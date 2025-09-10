/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import NoImage from '@/assets/images/NoImage.png';
import ShelterDetailInfo from './components/ShelterDetailInfo';
import ShelterReviewSection from './components/ShelterReviewSection'; // 리뷰 섹션 컴포넌트 import

// 상세 조회 API에서 내려주는 형태
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

// Review 타입
interface Review {
  reviewId: number;
  shelterId: number;
  userId: number;
  nickname: string;
  rating: number;
  title: string;
  content: string;
  photoUrl: string;
  userProfileUrl: string;
  createdAt: string;
}

const ShelterDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shelter, setShelter] = useState<ShelterDetail | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    // 실제 API 연동 시에는 GET /api/shelters/{shelterId}로 호출됨.
    const fetchData = async () => {
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

    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true);
      // 실제 API 연동 시에는 GET /api/shelters/{shelterId}/reviews?sort=created_at으로 호출됨.
      const reviewData: Review[] = [
        {
          reviewId: 1,
          shelterId: 1,
          userId: 1,
          nickname: '사용자1',
          rating: 5,
          title: '아주 좋은 쉼터입니다',
          content: '위치도 좋고 시설도 깨끗해요. 강추합니다!',
          photoUrl: '',
          userProfileUrl: 'https://example.com/users/1.jpg',
          createdAt: '2023-10-01T12:00:00Z',
        },
        {
          reviewId: 2,
          shelterId: 1,
          userId: 2,
          nickname: '사용자2',
          rating: 4,
          title: '만족스러운 쉼터',
          content: '전반적으로 만족스러웠습니다. 다만, 주차 공간이 부족해요.',
          photoUrl: 'https://example.com/review2.jpg',
          userProfileUrl: '',
          createdAt: '2023-10-02T12:00:00Z',
        },
      ];
      setReviews(reviewData);
      setLoadingReviews(false);
    };

    fetchReviews();
  }, [id]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = NoImage;
  };

  if (!shelter) return <div>로딩 중...</div>;

  const averageRating = shelter.reviewCount > 0 ? shelter.totalRating / shelter.reviewCount : 0;

  const handleMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  return (
    <div css={container}>
      {/* 쉼터 정보 컴포넌트 */}
      <ShelterDetailInfo
        shelter={shelter}
        averageRating={averageRating}
        isFavorite={isFavorite}
        onToggleFavorite={() => setIsFavorite(!isFavorite)}
        onGuideStart={() => navigate('/guide')}
        handleImageError={handleImageError}
      />

      {/* 리뷰 섹션 컴포넌트 */}
      <ShelterReviewSection
        reviews={reviews}
        loading={loadingReviews}
        visibleCount={visibleCount}
        onMore={handleMore}
        handleImageError={handleImageError}
      />
    </div>
  );
};

export default ShelterDetailPage;

/* 페이지 전체 컨테이너 스타일 */
const container = css`
  padding: 16px;
  margin-top: 0px;
  background: white;
`;
