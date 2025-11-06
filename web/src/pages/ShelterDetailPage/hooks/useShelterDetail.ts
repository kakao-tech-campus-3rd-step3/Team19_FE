import { useEffect, useState, useCallback } from 'react';
import { getShelterDetail, getShelterReviews } from '@/api/shelterApi';
import { checkIfShelterIsWished } from '@/api/wishApi';

export const useShelterDetail = (shelterIdParam?: string | number) => {
  const id = Number(shelterIdParam ?? 0);

  const [shelter, setShelter] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [shelterError, setShelterError] = useState<any | null>(null);

  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);
  const [reviewsError, setReviewsError] = useState<any | null>(null);

  const [visibleCount, setVisibleCount] = useState<number>(3);

  // 계산된 평균 별점 상태
  const [averageRating, setAverageRating] = useState<number>(0);

  // 단순한 isFavorite 상태 (실제 값은 별도 API에서 가져오면 대체)
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  const fetchDetail = useCallback(
    async (latitude?: number, longitude?: number) => {
      setIsLoading(true);
      setShelterError(null);
      try {
        const data = await getShelterDetail({ shelterId: id, latitude, longitude });
        setShelter(data);
        // averageRating 계산: API가 직접 averageRating을 주면 그 값을 사용,
        // 아니면 totalRating / reviewCount로 계산 (분모 0 방지)
        const avg =
          typeof data?.averageRating === 'number'
            ? data.averageRating
            : typeof data?.totalRating === 'number' && Number(data?.reviewCount) > 0
              ? Number(data.totalRating) / Number(data.reviewCount)
              : 0;
        setAverageRating(Number.isFinite(avg) ? Math.round(avg * 10) / 10 : 0);
        // 만약 API가 isFavorite이나 favorite 여부를 반환하면 여기서 setIsFavorite(data.isFavorite)
      } catch (err) {
        console.error('[useShelterDetail] getShelterDetail error', err);
        setShelter(null);
        setShelterError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [id],
  );

  const fetchReviews = useCallback(
    async (sort?: string) => {
      setLoadingReviews(true);
      setReviewsError(null);
      try {
        const data = await getShelterReviews(id, sort);
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('[useShelterDetail] getShelterReviews error', err);
        setReviews([]);
        setReviewsError(err);
      } finally {
        setLoadingReviews(false);
      }
    },
    [id],
  );

  useEffect(() => {
    let mounted = true;
    // 위치 있으면 전달, 없으면 그냥 호출
    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!mounted) return;
          const { latitude, longitude } = pos.coords;
          fetchDetail(latitude, longitude);
        },
        (err) => {
          console.warn('[useShelterDetail] geolocation error', err);
          // 위치 권한 없으면 좌표 없이 호출
          fetchDetail();
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 },
      );
    } else {
      fetchDetail();
    }

    // [추가] 상세 진입 시 해당 쉼터의 찜 여부도 동기화
    checkIfShelterIsWished(id).then((result) => {
      if (mounted) setIsFavorite(result);
    });

    // 리뷰는 상세 로드 후 또는 별도로 호출
    fetchReviews();

    return () => {
      mounted = false;
    };
  }, [fetchDetail, fetchReviews, id]);

  const handleMore = () => setVisibleCount((v) => v + 3);

  const handleImageError = (_e?: any) => {
    /* 이미지 로드 실패 시 처리(필요시 구현) */
  };

  const onGuideStart = (_from?: { lat: number; lng: number }) => {
    /* 길안내 시작 콜백(필요시 구현) */
  };

  const removeReview = (reviewId: number) => {
    setReviews((prev) => {
      const updated = prev.filter((r: any) => {
        // API에 따라 id 필드명이 다를 수 있으니 둘 다 확인
        return r.reviewId !== reviewId && r.id !== reviewId;
      });

      // 평균 별점 재계산 (리뷰 객체에 rating 필드가 있다고 가정)
      if (Array.isArray(updated)) {
        const total = updated.reduce((s: number, rv: any) => s + (Number(rv.rating) || 0), 0);
        const avg = updated.length ? total / updated.length : 0;
        setAverageRating(Number.isFinite(avg) ? Math.round(avg * 10) / 10 : 0);
      } else {
        setAverageRating(0);
      }

      return updated;
    });
  };

  return {
    shelter,
    isLoading,
    isFavorite,
    setIsFavorite,
    reviews,
    loadingReviews,
    visibleCount,
    averageRating,
    handleImageError,
    handleMore,
    onGuideStart,
    shelterError,
    reviewsError,
    refresh: () => {
      // 현재 위치로 다시 불러오기
      if (navigator?.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchDetail(pos.coords.latitude, pos.coords.longitude),
          () => fetchDetail(),
        );
      } else {
        fetchDetail();
      }
      fetchReviews();
    },
    removeReview, // 추가: 로컬에서 리뷰 제거
  };
};
