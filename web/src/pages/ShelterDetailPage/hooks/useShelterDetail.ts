import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NoImage from '@/assets/images/NoImage.png';

// 타입 정의
interface ShelterDetail {
  shelterId: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: string;
  operatingHours: {
    weekday: string;
    weekend: string;
  };
  capacity: number;
  isOutdoors: boolean;
  coolingEquipment: {
    fanCount: number;
    acCount: number;
  };
  totalRating: number;
  reviewCount: number;
  photoUrl: string;
}

interface Review {
  reviewId: number;
  userId: number;
  nickname: string;
  rating: number;
  content: string;
  photoUrl: string;
  userProfileUrl: string;
  createdAt: string;
}

// 커스텀 훅 정의
export const useShelterDetail = (id: string | undefined) => {
  const navigate = useNavigate();
  const [shelter, setShelter] = useState<ShelterDetail | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);

  // 쉼터 상세 정보 Fetching
  useEffect(() => {
    const fetchData = async () => {
      // TODO: 실제 API 연동 시에는 GET /api/shelters/{id}로 호출
      const data: ShelterDetail = {
        shelterId: 1,
        name: '쉼터 이름 예시',
        address: '쉼터 주소 예시',
        latitude: 37.5665,
        longitude: 126.978,
        distance: '250m',
        operatingHours: {
          weekday: '09:00~18:00',
          weekend: '10:00~16:00',
        },
        capacity: 50,
        isOutdoors: true,
        coolingEquipment: {
          fanCount: 3,
          acCount: 1,
        },
        totalRating: 14,
        reviewCount: 5,
        photoUrl: 'https://example.com/shelter1.jpg',
      };
      setShelter(data);
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // 리뷰 정보 Fetching
  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true);
      // TODO: 실제 API 연동 시에는 GET /api/shelters/{id}/reviews?sort=created_at으로 호출
      const reviewData: Review[] = [
        {
          reviewId: 1,
          userId: 1,
          nickname: '사용자1',
          rating: 5,
          content:
            '일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십',
          photoUrl: '',
          userProfileUrl: 'https://example.com/users/1.jpg',
          createdAt: '2023-10-01T12:00:00Z',
        },
        {
          reviewId: 2,
          userId: 2,
          nickname: '사용자2',
          rating: 4,
          content:
            '일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십',
          photoUrl: 'https://example.com/review2.jpg',
          userProfileUrl: '',
          createdAt: '2023-10-02T12:00:00Z',
        },
      ];
      setReviews(reviewData);
      setLoadingReviews(false);
    };

    if (id) {
      fetchReviews();
    }
  }, [id]);

  // 이미지 에러 핸들러
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = NoImage;
  };

  // 평균 별점 계산
  const averageRating =
    shelter && shelter.reviewCount > 0 ? shelter.totalRating / shelter.reviewCount : 0;

  // 리뷰 더보기 핸들러
  const handleMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  // 즐겨찾기 토글 핸들러
  const onToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: 실제 API 연동 시에는 POST /api/shelters/{id}/favorites 호출
  };

  // 길 안내 시작 핸들러
  const onGuideStart = () => {
    navigate('/guide');
  };

  // 컴포넌트에서 필요한 모든 상태와 함수를 반환
  return {
    shelter,
    isLoading: !shelter, // 쉼터 정보가 로드되기 전까지 로딩 상태로 간주
    isFavorite,
    setIsFavorite, //isFavorite 상태를 직접 변경할 수 있도록 반환
    reviews,
    loadingReviews,
    visibleCount,
    averageRating,
    handleImageError,
    handleMore,
    onToggleFavorite,
    onGuideStart,
  };
};
