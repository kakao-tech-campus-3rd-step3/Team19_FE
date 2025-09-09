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

const ShelterDetailPage = () => {
  const { id } = useParams(); // URL에서 쉼터 ID 가져오기
  const [shelter, setShelter] = useState<ShelterDetail | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = NoImage;
  };

  if (!shelter) return <div>로딩 중...</div>;

  // 평균 별점 계산
  const averageRating = shelter.reviewCount > 0 ? shelter.totalRating / shelter.reviewCount : 0;

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
          {/* 거리 표시 */}
          <div css={distanceStyle}>거리: {shelter.distance}</div>
          {/* 별점 표시 */}
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
    </div>
  );
};

export default ShelterDetailPage;

/* 스타일 */
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
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5); /* 그림자 효과 추가 */
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
