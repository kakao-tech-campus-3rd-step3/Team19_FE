/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import theme from '../../../styles/theme';

interface Shelter {
  shelterId: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: string;
  isOpened: boolean;
  isOutdoors: boolean;
  operatingHours: {
    weekday: string;
    weekend: string;
  };
  averageRating: number;
  photoUrl: string;
}

interface Props {
  shelter: Shelter;
  variant: 'home' | 'find'; // 컴포넌트의 종류를 결정하는 prop
  isFavorite?: boolean; // 'find' variant에서 하트의 상태
  onStart?: () => void;
  onToggleFavorite?: () => void; // 'find' variant에서 하트 클릭 이벤트 핸들러
}

const ShelterInfoCard = ({
  shelter,
  variant,
  isFavorite = false,
  onStart,
  onToggleFavorite,
}: Props) => {
  //'09:00~16:00' 형식을 '09시~16시'로 변경하는 함수
  const formatOperatingHours = (timeString: string) => {
    if (!timeString || !timeString.includes('~')) {
      return '정보 없음';
    }
    const [startTime, endTime] = timeString.split('~');
    const startHour = startTime.substring(0, 2);
    const endHour = endTime.substring(0, 2);

    return `${startHour}시~${endHour}시`;
  };

  // --- HomePage에서만 사용될 운영시간 관련 로직 ---
  let formattedOperatingHours = '정보 없음';
  if (variant === 'home') {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const currentOperatingHours = isWeekend
      ? shelter.operatingHours.weekend
      : shelter.operatingHours.weekday;
    formattedOperatingHours = formatOperatingHours(currentOperatingHours);
  }

  return (
    <div css={infoCardStyle({ variant })}>
      {variant === 'home' && (
        <div css={statusWrapper}>
          <span css={[statusTag, shelter.isOpened ? operatingOnTag : operatingOffTag]}>
            {shelter.isOpened ? '운영중' : '휴무'}
          </span>
          {shelter.isOutdoors && (
            <span css={[statusTag, shelter.isOpened ? outdoorsOnTag : outdoorsOffTag]}>야외</span>
          )}
        </div>
      )}
      <p css={shelterName}>{shelter.name}</p>

      <div css={cardTop}>
        <img
          src={
            shelter.photoUrl && shelter.photoUrl.trim() !== ''
              ? shelter.photoUrl
              : 'src/assets/images/NoImage.png'
          }
          alt={shelter.name || 'shelter'}
          css={thumbnail}
        />
        <div css={infoText}>
          <p css={infoParagraph}>거리: {shelter.distance}</p>
          <p css={infoParagraph}>
            별점: <span css={ratingNumber}>{shelter.averageRating.toFixed(1)}</span>{' '}
            <span css={starsWrapper}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} css={i < Math.round(shelter.averageRating) ? filledStar : emptyStar}>
                  ★
                </span>
              ))}
            </span>
          </p>
          {/* variant에 따라 운영시간 또는 주소를 보여줍니다. */}
          {variant === 'home' ? (
            <p css={infoParagraph}>운영시간: {formattedOperatingHours}</p>
          ) : (
            <p css={infoParagraph}>주소: {shelter.address}</p>
          )}
        </div>
      </div>

      {/* 버튼 컨테이너 */}
      <div css={buttonContainer({ variant })}>
        <button css={mainButton} onClick={onStart}>
          안내 시작
        </button>
        {/* 'find' variant일 때만 하트 버튼을 보여줍니다. */}
        {variant === 'find' && (
          <button css={favoriteButton} onClick={onToggleFavorite}>
            {isFavorite ? '❤️' : '🤍'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ShelterInfoCard;

/* 카드 스타일 */
const infoCardStyle = ({ variant }: { variant: 'home' | 'find' }) => css`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 16px;

  /* variant에 따라 달라지는 스타일 */
  ${variant === 'home'
    ? css`
        position: absolute;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        z-index: 1000;
        padding: 12px 16px;
      `
    : css`
        position: relative;
        width: 100%;
      `}
`;

const cardTop = css`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-bottom: 4px;
  align-items: center;
`;

const thumbnail = css`
  width: 30%;
  height: 90%;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 12px;
`;

const infoText = css`
  flex: 1;
  text-align: left;
`;

const infoParagraph = css`
  margin: 2px 0;
  font-size: ${theme.typography.body2Bold.fontSize};
  font-weight: ${theme.typography.body2Bold.fontWeight};
  line-height: ${theme.typography.body2Bold.lineHeight};
  color: ${theme.colors.text.gray500};
`;

const shelterName = css`
  font-size: ${theme.typography.title1Bold.fontSize};
  font-weight: ${theme.typography.title1Bold.fontWeight};
  line-height: ${theme.typography.title1Bold.lineHeight};
  color: ${theme.colors.button.bule};
  margin-bottom: 8px;
  width: 100%;
  text-align: center;
`;

/* 버튼 스타일 */
const buttonContainer = ({ variant }: { variant: 'home' | 'find' }) => css`
  display: flex;
  gap: 8px;
  ${variant === 'home'
    ? css`
        width: 100%;
      `
    : css`
        width: 90%;
      `}
`;

const mainButton = css`
  margin-top: 10px;
  width: 100%;
  background: ${theme.colors.button.red};
  color: white;
  border: none;
  padding: 6px;
  border-radius: 8px;
  font-size: ${theme.typography.button1Bold.fontSize};
  font-weight: ${theme.typography.button1Bold.fontWeight};
  line-height: ${theme.typography.button1Bold.lineHeight};
  cursor: pointer;
`;
const favoriteButton = css`
  margin-top: 10px;
  width: 20%;
  background: ${theme.colors.button.red};
  color: white;
  border: none;
  padding: 6px;
  border-radius: 8px;
  font-size: ${theme.typography.button1Bold.fontSize};
  font-weight: ${theme.typography.button1Bold.fontWeight};
  line-height: ${theme.typography.button1Bold.lineHeight};
  cursor: pointer;
`;

/*별점 스타일*/
const starsWrapper = css`
  display: inline-flex;
  align-items: center;
  gap: 2px;
`;

const ratingNumber = css`
  color: ${theme.colors.text.red};
  font-size: ${theme.typography.highlight1Bold.fontSize};
  font-weight: ${theme.typography.highlight1Bold.fontWeight};
  line-height: ${theme.typography.highlight1Bold.lineHeight};
`;

const filledStar = css`
  color: ${theme.colors.text.yellow};
  font-size: ${theme.typography.highlight1Bold.fontSize};
`;

const emptyStar = css`
  color: ${theme.colors.text.gray100};
  font-size: ${theme.typography.highlight1Bold.fontSize};
`;

/* 상태 태그 스타일 */
const statusWrapper = css`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 0px;
`;

const statusTag = css`
  padding: 4px 8px;
  border-radius: 16px;
  color: white;
  white-space: nowrap;

  ${theme.typography.highlight2Bold}
`;

const operatingOnTag = css`
  background-color: ${theme.colors.button.greenOn};
`;

const operatingOffTag = css`
  background-color: ${theme.colors.button.greenOff};
`;

const outdoorsOnTag = css`
  background-color: ${theme.colors.button.redOn};
`;

const outdoorsOffTag = css`
  background-color: ${theme.colors.button.redOff};
`;
