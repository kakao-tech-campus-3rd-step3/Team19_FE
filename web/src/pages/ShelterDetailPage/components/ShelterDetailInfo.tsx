/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import theme from '@/styles/theme';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import NoImage from '@/assets/images/NoImage.png';
import { formatOperatingHours } from '@/utils/date';

// ShelterDetailPage에서 내려주는 데이터 타입
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

// ShelterDetailInfo 컴포넌트가 받을 props 타입
interface ShelterDetailInfoProps {
  shelter: ShelterDetail;
  averageRating: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onGuideStart: () => void;
  handleImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

const ShelterDetailInfo = ({
  shelter,
  averageRating,
  isFavorite,
  onToggleFavorite,
  onGuideStart,
  handleImageError,
}: ShelterDetailInfoProps) => {
  return (
    <>
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
          <b css={infoBold}>
            평일 운영시간: {formatOperatingHours(shelter.operatingHours.weekday)}
          </b>
          <b css={infoBold}>
            주말 운영시간: {formatOperatingHours(shelter.operatingHours.weekend)}
          </b>
          <b css={infoBold}>수용 가능 인원: {shelter.capacity}명</b>
          <b css={infoBold}>에어컨: {shelter.coolingEquipment.acCount}대</b>
          <b css={infoBold}>선풍기: {shelter.coolingEquipment.fanCount}대</b>
        </div>
      </div>

      <div css={bottomSection}>
        <button
          css={mainButton}
          onClick={onGuideStart} // props로 받은 핸들러 사용
        >
          안내 시작
        </button>
        <button
          css={favoriteButton}
          onClick={onToggleFavorite} // props로 받은 핸들러 사용
        >
          {isFavorite ? (
            <FaHeart size={36} color={theme.colors.button.red} />
          ) : (
            <FaRegHeart size={36} color={theme.colors.button.black} />
          )}
        </button>
      </div>
    </>
  );
};

export default ShelterDetailInfo;

/* 상세 정보 스타일 */
const title = css`
  text-align: center;
  margin-top: 16px;
  ${theme.typography.detail1};
  color: ${theme.colors.button.blue};
`;

const topSection = css`
  display: flex;
  flex-direction: column; /* 모바일 고정: 세로 스택 */
  gap: 12px;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
`;

const thumbnail = css`
  width: 220px; /* 고정 크기: 이미지가 너무 커지지 않도록 제한 */
  height: 220px;
  flex: 0 0 220px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  object-fit: cover;
  pointer-events: none;
  margin: 0;
`;

const infoText = css`
  flex: 1 1 auto;
  min-width: 0;
  max-width: 820px;
  margin: 0 auto; /* 블록 자체를 가로 중앙에 배치 */
  color: ${theme.colors.text.black};
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left; /* 내부 텍스트는 좌측 정렬 유지 */
  padding-bottom: 16px;
  align-items: flex-start;
`;

const bottomSection = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px auto 0;
  width: 90%;
  max-width: 820px;
  gap: 8px;
`;

const mainButton = css`
  flex: 1 1 auto;
  min-width: 0;
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
  display: flex;
  align-items: center;
  justify-content: center;
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
  color: ${theme.colors.text.gray200};
  ${theme.typography.detail2};
`;

const infoBold = css`
  ${theme.typography.detail3};
  color: ${theme.colors.text.black};
  font-weight: 700;
`;
