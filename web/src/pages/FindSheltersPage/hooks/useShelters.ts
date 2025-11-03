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
  // 화면에 실제로 표시할 개수 관리 (초기 4개, 스크롤마다 +3)
  const INITIAL_VISIBLE = 4;
  const LOAD_INCREMENT = 3;
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE);
  const visibleShelters = shelters.slice(0, visibleCount);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const [hasMoreItems, setHasMoreItems] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const [, setPage] = useState<number>(1);
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
          // 새로 받아올 때는 표시 개수 초기화
          setVisibleCount(INITIAL_VISIBLE);
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
    // 클라이언트에서 표시 개수만 늘림 (서버 페이징이 아닌 경우)
    if (isLoading || isFetchingMore) return;
    if (visibleCount >= shelters.length) return;
    setIsFetchingMore(true);
    // 약간의 딜레이(로딩 UX) 후 더 보여주기
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(shelters.length, prev + LOAD_INCREMENT));
      setIsFetchingMore(false);
    }, 300);
  };

  return {
    // 전체 데이터와 화면에 보이는 데이터 둘다 반환
    shelters,
    visibleShelters,
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
