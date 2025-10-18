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
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const [hasMoreItems, setHasMoreItems] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const [page, setPage] = useState<number>(1);
  const PAGE_SIZE = 20; // 필요 시 API 페이지 크기에 맞게 변경

  const fetchNearby = useCallback(
    async (latitude: number, longitude: number, pageParam = 1, append = false) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await (getNearbyShelters as any)({
          latitude,
          longitude,
          page: pageParam,
        });
        const list = Array.isArray(data)
          ? data
          : (data?.items ?? data?.shelters ?? data?.data ?? []);
        if (append) {
          setShelters((prev) => [...prev, ...list]);
        } else {
          setShelters(list);
        }
        // 간단한 hasMore 판단: 반환 항목이 페이지 사이즈보다 작으면 끝
        setHasMoreItems(Array.isArray(list) ? list.length >= PAGE_SIZE : false);
        setPage(pageParam);
      } catch (err) {
        console.error('[useShelters] fetchNearby error', err);
        setError(err);
        setShelters([]);
        setHasMoreItems(false);
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    },
    [],
  );

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
        fetchNearby(latitude, longitude, 1, false);
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
    if (isLoading || isFetchingMore || !hasMoreItems) return;
    setIsFetchingMore(true);
    try {
      // 현재 위치로 다음 페이지 요청
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const nextPage = page + 1;
          await fetchNearby(pos.coords.latitude, pos.coords.longitude, nextPage, true);
        },
        (err) => {
          console.warn('[useShelters] loadMore geolocation error', err);
          setIsFetchingMore(false);
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 },
      );
    } catch (e) {
      console.error('[useShelters] handleLoadMore error', e);
      setIsFetchingMore(false);
    }
  };

  return {
    shelters,
    favoriteIds,
    isLoading,
    error,
    hasMoreItems,
    isFetchingMore,
    toastMessage,
    setToastMessage,
    handleToggleFavorite,
    handleLoadMore,
    refresh: () => {
      // 현재 위치로 재요청 수행
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          fetchNearby(latitude, longitude, 1, false);
        },
        (err) => {
          console.warn('[useShelters] refresh geolocation error', err);
        },
      );
    },
  };
};
