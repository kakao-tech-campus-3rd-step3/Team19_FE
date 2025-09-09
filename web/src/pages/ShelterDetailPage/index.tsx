/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import theme from '@/styles/theme';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import NoImage from '@/assets/images/NoImage.png';

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

// --- Review 타입, 상태, useEffect 등은 질문 코드 참고 ---
interface Review {
  reviewId: number;
  shelterId: number;
  userId: number;
  nickname: string;
  rating: number;
  title: string;
  content: string;
  photoUrl: string;
  createdAt: string;
}

const ShelterDetailPage = () => {
  const { id } = useParams(); // URL에서 쉼터 ID 가져오기
  const [shelter, setShelter] = useState<ShelterDetail | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    // 실제 API 연동 시에는 GET /api/shelters/{shelterId}로 호출됨.
    // 추후에 API 연동 필요, 현재는 간단하게 하나의 임시 데이터 사용 중임.
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
      // 실제 API 연동 시에는 GET /api/shelters/{shelterId}/reviews로 호출됨.
      // 임시 데이터 사용 중
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

  // 평균 별점 계산
  const averageRating = shelter.reviewCount > 0 ? shelter.totalRating / shelter.reviewCount : 0;

  function formatDateShort(createdAt: string) {
    try {
      return new Date(createdAt).toLocaleDateString();
    } catch {
      return createdAt;
    }
  }

  return (
    <div css={container}>
      <h2 css={title}>{shelter.name}</h2>
      <div css={topSection}>
        <img
          src={shelter.photoUrl || NoImage}
          alt={shelter.name}
          css={thumbnail}
          onError={handleImageError}
        />
        <div css={infoText}>
          <div css={distanceStyle}>거리: {shelter.distance}</div>
          <div css={ratingRow}>
            별점: <span css={ratingNumber}>{averageRating.toFixed(1)}</span>
            <span css={starsWrapper}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} css={i < Math.round(averageRating) ? filledStar : emptyStar}>
                  ★
                </span>
              ))}
            </span>
          </div>
          <b css={infoBold}>주소: {shelter.address}</b>
          <b css={infoBold}>평일 운영시간: {shelter.operatingHours.weekday}</b>
          <b css={infoBold}>주말 운영시간: {shelter.operatingHours.weekend}</b>
          <b css={infoBold}>수용 가능 인원: {shelter.capacity}명</b>
          <b css={infoBold}>에어컨: {shelter.coolingEquipment.acCount}대</b>
          <b css={infoBold}>선풍기: {shelter.coolingEquipment.fanCount}대</b>
        </div>
      </div>

      <div css={bottomSection}>
        <button css={mainButton}>안내 시작</button>
        <button css={favoriteButton} onClick={() => setIsFavorite(!isFavorite)}>
          {isFavorite ? (
            <FaHeart size={36} color={theme.colors.button.red} />
          ) : (
            <FaRegHeart size={36} color={theme.colors.button.black} />
          )}
        </button>
      </div>

      {/* 리뷰 섹션 */}
      <section css={reviewSectionStyle}>
        <div css={reviewHeader}>
          <div css={reviewTitle}>리뷰({reviews ? reviews.length : 0})</div>
          <button css={reviewWriteButton}>리뷰 작성</button>
        </div>

        {loadingReviews ? (
          <div css={loadingStyle}>로딩 중...</div>
        ) : reviews && reviews.length > 0 ? (
          <div css={reviewListStyle}>
            {reviews.map((r) => (
              <article css={reviewCardStyle} key={r.reviewId}>
                <div css={reviewLeft}>
                  <div css={avatarRow}>
                    <div css={avatarStyle}>{(r.nickname && r.nickname.charAt(0)) || '유'}</div>
                    <span css={reviewNickname}>{r.nickname}</span>
                    <span css={reviewStarsRow}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} css={i < r.rating ? filledStar : emptyStar}>
                          ★
                        </span>
                      ))}
                    </span>
                  </div>
                  <div css={reviewContentBox}>
                    {r.title && <div css={reviewTitleText}>{r.title}</div>}
                    <div css={reviewText}>{r.content}</div>
                    {r.photoUrl ? (
                      <img
                        src={r.photoUrl}
                        alt={`review-${r.reviewId}`}
                        css={reviewPhoto}
                        onError={handleImageError}
                      />
                    ) : null}
                    <div css={reviewMeta}>
                      <span>{formatDateShort(r.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div css={noReviewStyle}>리뷰가 없습니다.</div>
        )}

        <div css={moreWrap}>
          <button css={moreButton}>더보기</button>
        </div>
      </section>
    </div>
  );
};

export default ShelterDetailPage;

/* 상세 정보 스타일 */
const container = css`
  padding: 16px;
  margin-top: 0px;
  background: white;
`;

const title = css`
  text-align: center;
  margin-top: 0px;
  ${theme.typography.detail1};
  color: ${theme.colors.button.blue};
`;

const topSection = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
`;

const thumbnail = css`
  width: 70%;
  height: 70%;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5); /* 사진 그림자 효과 */
  margin-bottom: 8px;
`;

const infoText = css`
  flex: 1;
  color: ${theme.colors.text.black};
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  padding-bottom: 16px;

  align-items: flex-start;
`;

const bottomSection = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const mainButton = css`
  flex: 1;
  margin-right: 8px;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: ${theme.colors.button.red};
  color: white;
  cursor: pointer;
  ${theme.typography.cardh3};
`;

const favoriteButton = css`
  background: white;
  border: none;
  cursor: pointer;
`;

const distanceStyle = css`
  color: ${theme.colors.text.black};
  ${theme.typography.detail2};
  margin-top: 4px;
  margin-bottom: 8px;
`;

const ratingRow = css`
  display: flex;
  align-items: center;
  gap: 6px;
  ${theme.typography.detail2};
  margin-bottom: 20px;
`;

const ratingNumber = css`
  color: ${theme.colors.text.red};
  ${theme.typography.detail2};
`;

const starsWrapper = css`
  display: inline-flex;
  align-items: center;
  gap: 2px;
`;

const filledStar = css`
  color: ${theme.colors.text.yellow};
  ${theme.typography.detail2};
`;

const emptyStar = css`
  color: ${theme.colors.text.gray100};
  ${theme.typography.detail2};
`;

const infoBold = css`
  ${theme.typography.detail3};
  color: ${theme.colors.text.black};
  font-weight: 700;
`;

/* 리뷰 섹션 */
const reviewSectionStyle = css`
  margin-top: 32px;
  padding: 16px;
  wdith: 80%;
  border-top: 1px solid ${theme.colors.text.gray500};
`;

const reviewHeader = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const reviewTitle = css`
  ${theme.typography.cardh3};
  color: ${theme.colors.text.black};
`;

const reviewWriteButton = css`
  padding: 8px;
  border: none;
  border-radius: 16px;
  background: ${theme.colors.button.red};
  color: white;
  cursor: pointer;
  ${theme.typography.detail3};
`;

const loadingStyle = css`
  text-align: center;
  padding: 16px;
  color: ${theme.colors.text.gray500};
`;

const reviewListStyle = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const reviewCardStyle = css`
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: ${theme.colors.text.gray100};
  align-items: flex-start;
`;

const reviewLeft = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const avatarRow = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const avatarStyle = css`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${theme.colors.text.gray500};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  ${theme.typography.detail2};
  font-weight: 700;
`;

const reviewNickname = css`
  ${theme.typography.detail3};
  color: ${theme.colors.text.black};
  font-weight: 700;
`;

const reviewStarsRow = css`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const reviewContentBox = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
`;

const reviewTitleText = css`
  ${theme.typography.review1};
  color: ${theme.colors.text.black};
  font-weight: 700;
`;

const reviewText = css`
  ${theme.typography.review3};
  color: ${theme.colors.text.black};
`;

const reviewMeta = css`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  ${theme.typography.review2};
  color: ${theme.colors.text.gray500};
  font-size: 20px;
`;

const reviewPhoto = css`
  width: 35%;
  height: 35%;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  margin-left: 8px;
`;

const noReviewStyle = css`
  text-align: center;
  color: ${theme.colors.text.gray500};
  padding: 16px;
`;

const moreWrap = css`
  display: flex;
  justify-content: center;
  margin-top: 16px;
`;

const moreButton = css`
  padding: 8px;
  border: none;
  border-radius: 16px;
  background: ${theme.colors.text.gray500};
  color: white;
  cursor: pointer;
  ${theme.typography.detail3};
`;
