/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import theme from '../styles/theme';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import NoImage from '@/assets/images/NoImage.png';
import { useNavigate } from 'react-router-dom';

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

const ShelterInfoCard = ({ shelter, variant, isFavorite = false, onToggleFavorite }: Props) => {
  const navigate = useNavigate(); // React Router의 useNavigate 사용

  const handleNavigateToDetail = () => {
    navigate(`/shelter-detail/${shelter.shelterId}`); // 쉼터 상세 페이지로 이동
  };

  const handleStartNavigation = () => {
    navigate('/guide'); // 길안내 페이지로 이동
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = NoImage; // 이미지 로드 실패 시 NoImage로 대체
  };

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
      <p css={shelterName({ variant })} onClick={handleNavigateToDetail}>
        {shelter.name}
      </p>

      <div css={cardTop} onClick={handleNavigateToDetail}>
        <img
          src={shelter.photoUrl && shelter.photoUrl.trim() !== '' ? shelter.photoUrl : NoImage}
          alt={shelter.name || 'shelter'}
          css={thumbnail({ variant })}
          onError={handleImageError} // 이미지 로드 실패 시 처리
        />
        <div css={infoText}>
          <p css={infoParagraph({ variant })} onClick={handleNavigateToDetail}>
            거리: {shelter.distance}
          </p>
          <p css={infoParagraph({ variant })} onClick={handleNavigateToDetail}>
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
            <p css={infoParagraph({ variant })} onClick={handleNavigateToDetail}>
              운영시간: {formattedOperatingHours}
            </p>
          ) : (
            <p css={infoParagraph({ variant })} onClick={handleNavigateToDetail}>
              주소: {shelter.address}
            </p>
          )}
        </div>
      </div>

      <div css={buttonContainer({ variant })}>
        <button css={mainButton({ variant })} onClick={handleStartNavigation}>
          안내 시작
        </button>
        {variant === 'find' && (
          <button css={favoriteButton} onClick={onToggleFavorite}>
            {isFavorite ? (
              <FaHeart size={40} color={theme.colors.button.red} />
            ) : (
              <FaRegHeart size={40} color={theme.colors.button.black} />
            )}
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
        height: 27vh;
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

const thumbnail = ({ variant }: { variant: 'home' | 'find' }) => css`
  ${variant === 'home'
    ? css`
        width: 30%;
        height: 90%;
        object-fit: cover;
        border-radius: 8px;
        margin-right: 12px;
      `
    : css`
        width: 12vh;
        height: 12vh;
        object-fit: cover;
        border-radius: 8px;
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

        ${theme.typography.cardh1};
        color: ${theme.colors.button.blue};
      `
    : css`
        margin-bottom: 0.7vh;

        ${theme.typography.cardf1};
        color: ${theme.colors.button.blue};
      `}
`;

const infoParagraph = ({ variant }: { variant: 'home' | 'find' }) => css`
  margin: 2px 0;

  /* variant에 따라 달라지는 스타일 */
  ${variant === 'home'
    ? css`
        ${theme.typography.cardh2};
        color: ${theme.colors.text.gray500};
      `
    : css`
        padding-right: 2px;
        ${theme.typography.cardf2};
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

        ${theme.typography.cardh3}
      `
    : css`
        margin-top: 2px;
        padding: 1px 8px;

        ${theme.typography.cardf3};
      `}
`;
const favoriteButton = css`
  width: 20%;
  background: ${theme.colors.button.white};
  color: white;
  border: none;
  padding: 6px;
  border-radius: 8px;

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
        ${theme.typography.cardh4};
      `
    : css`
        color: ${theme.colors.text.red};
        ${theme.typography.cardf4};
      `}
`;

const filledStar = css`
  color: ${theme.colors.text.yellow};
  font-size: ${theme.typography.cardh4.fontSize};
`;

const emptyStar = css`
  color: ${theme.colors.text.gray100};
  font-size: ${theme.typography.cardh4.fontSize};
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

  ${theme.typography.cardh4}
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
