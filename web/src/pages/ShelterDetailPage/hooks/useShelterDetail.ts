import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getShelterDetail, getShelterReviews } from '@/api/shelterApi';
import NoImage from '@/assets/images/NoImage.png';

export const useShelterDetail = (id: string | undefined) => {
  const navigate = useNavigate();

  // 쉼터 상세 정보
  const {
    data: shelter,
    isLoading: isShelterLoading,
    error: shelterError,
  } = useQuery({
    queryKey: ['shelterDetail', id],
    queryFn: () => getShelterDetail({ shelterId: Number(id) }),
    enabled: !!id,
  });

  // 쉼터 리뷰 정보
  const {
    data: reviews = [],
    isLoading: loadingReviews,
    error: reviewsError,
  } = useQuery({
    queryKey: ['shelterReviews', id],
    queryFn: () => getShelterReviews(Number(id)),
    enabled: !!id,
  });

  // 즐겨찾기(찜) 상태 (목데이터, 실제 연동 시 API로)
  const [isFavorite, setIsFavorite] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);

  // 평균 별점 계산
  const averageRating =
    shelter && shelter.reviewCount > 0 ? shelter.totalRating / shelter.reviewCount : 0;

  // 이미지 에러 핸들러
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = NoImage;
  };

  // 리뷰 더보기 핸들러
  const handleMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  // 즐겨찾기 토글 핸들러
  const onToggleFavorite = () => {
    setIsFavorite((prev) => !prev);
    // TODO: 실제 API 연동 시 POST /api/shelters/{id}/favorites 호출
  };

  // 길 안내 시작 핸들러
  const onGuideStart = () => {
    navigate('/guide');
  };

  return {
    shelter,
    isLoading: isShelterLoading,
    isFavorite,
    setIsFavorite,
    reviews,
    loadingReviews,
    visibleCount,
    averageRating,
    handleImageError,
    handleMore,
    onToggleFavorite,
    onGuideStart,
    shelterError,
    reviewsError,
  };
};
