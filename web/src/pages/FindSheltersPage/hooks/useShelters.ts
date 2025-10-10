import { useEffect, useState, useCallback } from 'react';
import { getNearbyShelters } from '@/api/shelterApi';

export type Shelter = {
  shelterId: number;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  distance?: string;
  isOutdoors?: boolean;
  operatingHours?: any;
  averageRating?: number;
  photoUrl?: string;
};

export const useShelters = () => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [hasMoreItems, setHasMoreItems] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const fetchNearby = useCallback(async (latitude: number, longitude: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getNearbyShelters({ latitude, longitude });
      // API가 배열을 반환한다고 가정
      setShelters(Array.isArray(data) ? data : []);
      // 단순히 더불어 사용할 플래그 (nearby는 페이징 없으므로 false)
      setHasMoreItems(false);
    } catch (err) {
      console.error('[useShelters] fetchNearby error', err);
      setError(err);
      setShelters([]);
      setHasMoreItems(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    // 브라우저 위치 사용 시도
    if (!navigator?.geolocation) {
      setError(new Error('Geolocation not available'));
      setIsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!mounted) return;
        const { latitude, longitude } = pos.coords;
        fetchNearby(latitude, longitude);
      },
      (err) => {
        console.warn('[useShelters] geolocation error', err);
        setError(err);
        setIsLoading(false);
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 },
    );
    return () => {
      mounted = false;
    };
  }, [fetchNearby]);

  // 로컬에서 favorite 토글 (UI 즉시 반영)
  const handleToggleFavorite = (shelterId: number) => {
    setFavoriteIds((prev) => {
      if (prev.includes(shelterId)) {
        return prev.filter((id) => id !== shelterId);
      }
      return [...prev, shelterId];
    });
  };

  const handleLoadMore = async () => {
    // nearby API는 페이징이 없으므로 기본 noop
    setToastMessage('더 불러올 항목이 없습니다.');
  };

  return {
    shelters,
    favoriteIds,
    isLoading,
    error,
    hasMoreItems,
    toastMessage,
    setToastMessage,
    handleToggleFavorite,
    handleLoadMore,
    refresh: () => {
      // 현재 위치로 재요청 수행
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          fetchNearby(latitude, longitude);
        },
        (err) => {
          console.warn('[useShelters] refresh geolocation error', err);
        },
      );
    },
  };
};
