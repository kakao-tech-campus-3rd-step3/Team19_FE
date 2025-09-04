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
  variant: 'home' | 'find';
  isFavorite?: boolean;
  onStart?: () => void;
  onToggleFavorite?: () => void;
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

  // 현재 시간이 운영 시간 내에 있는지 확인하는 함수
  const checkIfOpenNow = (timeString: string): boolean => {
    if (!timeString || !timeString.includes('~')) {
      return false; // 운영 시간 정보가 없으면 운영 종료로 간주
    }

    try {
      const [startTimeStr, endTimeStr] = timeString.split('~');
      const now = new Date();

      const startTime = new Date(now);
      const [startHour, startMinute] = startTimeStr.split(':').map(Number);
      startTime.setHours(startHour, startMinute, 0, 0);

      const endTime = new Date(now);
      const [endHour, endMinute] = endTimeStr.split(':').map(Number);
      endTime.setHours(endHour, endMinute, 0, 0);

      // 현재 시간이 시작 시간과 같거나 크고, 종료 시간보다 작을 때 운영 중
      return now >= startTime && now < endTime;
    } catch (error) {
      console.error('운영 시간 파싱 오류:', error);
      return false;
    }
  };

  // isOpened 대신 isActuallyOpen을 계산하여 사용
  let formattedOperatingHours = '정보 없음';
  let isActuallyOpen = false; // 기본값은 운영 종료(false)

  if (variant === 'home') {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0: 일요일, 6: 토요일
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const currentOperatingHours = isWeekend
      ? shelter.operatingHours.weekend
      : shelter.operatingHours.weekday;

    // 표시될 운영 시간 포맷팅
    formattedOperatingHours = formatOperatingHours(currentOperatingHours);
    // 현재 실제 운영 여부 계산
    isActuallyOpen = checkIfOpenNow(currentOperatingHours);
  }

  return (
    <div css={infoCardStyle({ variant })}>
      {variant === 'home' && (
        <div css={statusWrapper}>
          <span css={[statusTag, isActuallyOpen ? operatingOnTag : operatingOffTag]}>
            {isActuallyOpen ? '운영중' : '운영 종료'}
          </span>
          {shelter.isOutdoors && (
            <span css={[statusTag, isActuallyOpen ? outdoorsOnTag : outdoorsOffTag]}>야외</span>
          )}
        </div>
      )}
      <p css={shelterName({ variant })}>{shelter.name}</p>

      <div css={cardTop}>
        <img
          src={
            shelter.photoUrl && shelter.photoUrl.trim() !== ''
              ? shelter.photoUrl
              : 'src/assets/images/NoImage.png'
          }
          alt={shelter.name || 'shelter'}
          css={thumbnail({ variant })}
        />
        <div css={infoText}>
          <p css={infoParagraph({ variant })}>거리: {shelter.distance}</p>
          <p css={infoParagraph({ variant })}>
            별점: <span css={ratingNumber({ variant })}>{shelter.averageRating.toFixed(1)}</span>{' '}
            <span css={starsWrapper}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} css={i < Math.round(shelter.averageRating) ? filledStar : emptyStar}>
                  ★
                </span>
              ))}
            </span>
          </p>
          {variant === 'home' ? (
            <p css={infoParagraph({ variant })}>운영시간: {formattedOperatingHours}</p>
          ) : (
            <p css={infoParagraph({ variant })}>주소: {shelter.address}</p>
          )}
        </div>
      </div>

      <div css={buttonContainer({ variant })}>
        <button css={mainButton({ variant })} onClick={onStart}>
          안내 시작
        </button>
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
  display: flex;
  flex-direction: column;
  align-items: center;

  /* variant에 따라 달라지는 스타일 */
  ${variant === 'home'
    ? css`
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        border-radius: 12px;
        position: absolute;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        z-index: 1000;
        padding: 12px 16px;
        padding-bottom: 16px;
      `
    : css`
        position: relative;
        width: 100%;
        padding-bottom: 4px;
      `}
`;

const cardTop = css`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-bottom: 4px;
  align-items: center;
`;

const thumbnail = ({ variant }: { variant: 'home' | 'find' }) => css`
  width: 30%;
  height: 90%;
  object-fit: cover;
  border-radius: 8px;

  /* variant에 따라 달라지는 스타일 */
  ${variant === 'home'
    ? css`
        margin-right: 12px;
      `
    : css`
        margin-right: 4px;
      `}
`;

const infoText = css`
  flex: 1;
  text-align: left;
`;

const shelterName = ({ variant }: { variant: 'home' | 'find' }) => css`
  width: 100%;
  text-align: center;
  margin-top: 8px;

  /* variant에 따라 달라지는 스타일 */
  ${variant === 'home'
    ? css`
        margin-bottom: 8px;

        font-size: ${theme.typography.title1Bold.fontSize};
        font-weight: ${theme.typography.title1Bold.fontWeight};
        line-height: ${theme.typography.title1Bold.lineHeight};
        color: ${theme.colors.button.blue};
      `
    : css`
        margin-bottom: 4px;

        font-size: ${theme.typography.title2Bold.fontSize};
        font-weight: ${theme.typography.title2Bold.fontWeight};
        line-height: ${theme.typography.title2Bold.lineHeight};
        color: ${theme.colors.button.blue};
      `}
`;

const infoParagraph = ({ variant }: { variant: 'home' | 'find' }) => css`
  margin: 2px 0;
  font-size: ${theme.typography.body2Bold.fontSize};
  font-weight: ${theme.typography.body2Bold.fontWeight};
  line-height: ${theme.typography.body2Bold.lineHeight};
  color: ${theme.colors.text.gray500};

  /* variant에 따라 달라지는 스타일 */
  ${variant === 'home'
    ? css`
        font-size: ${theme.typography.body2Bold.fontSize};
        font-weight: ${theme.typography.body2Bold.fontWeight};
        line-height: ${theme.typography.body2Bold.lineHeight};
        color: ${theme.colors.text.gray500};
      `
    : css`
        padding-right: 2px;
        font-size: ${theme.typography.body3Bold.fontSize};
        font-weight: ${theme.typography.body3Bold.fontWeight};
        line-height: ${theme.typography.body3Bold.lineHeight};
        color: ${theme.colors.text.gray500};
      `}
`;

/* 버튼 스타일 */
const buttonContainer = ({ variant }: { variant: 'home' | 'find' }) => css`
  display: flex;
  ${variant === 'home'
    ? css`
        width: 100%;
        gap: 8px;
      `
    : css`
        width: 95%;
        gap: 4px;
      `}
`;

const mainButton = ({ variant }: { variant: 'home' | 'find' }) => css`
  width: 100%;
  background: ${theme.colors.button.red};
  color: white;
  border: none;
  border-radius: 8px;

  cursor: pointer;
  ${variant === 'home'
    ? css`
        margin-top: 10px;
        padding: 6px;

        font-size: ${theme.typography.button1Bold.fontSize};
        font-weight: ${theme.typography.button1Bold.fontWeight};
        line-height: ${theme.typography.button1Bold.lineHeight};
      `
    : css`
        margin-top: 3px;
        padding: 1px 8px;

        font-size: ${theme.typography.button3Bold.fontSize};
        font-weight: ${theme.typography.button3Bold.fontWeight};
        line-height: ${theme.typography.button3Bold.lineHeight};
      `}
`;
const favoriteButton = css`
  margin-top: 10px;
  width: 20%;
  background: ${theme.colors.button.white};
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

const ratingNumber = ({ variant }: { variant: 'home' | 'find' }) => css`
  ${variant === 'home'
    ? css`
        color: ${theme.colors.text.red};
        font-size: ${theme.typography.highlight1Bold.fontSize};
        font-weight: ${theme.typography.highlight1Bold.fontWeight};
        line-height: ${theme.typography.highlight1Bold.lineHeight};
      `
    : css`
        color: ${theme.colors.text.red};
        font-size: ${theme.typography.highlight2Bold.fontSize};
        font-weight: ${theme.typography.highlight2Bold.fontWeight};
        line-height: ${theme.typography.highlight2Bold.lineHeight};
      `}
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
