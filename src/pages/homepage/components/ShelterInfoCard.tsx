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
  onStart?: () => void;
}

const ShelterInfoCard = ({ shelter, onStart }: Props) => {
  //'09:00~16:00' 형식을 '09시~16시'로 변경하는 함수
  const formatOperatingHours = (timeString: string) => {
    // timeString이 유효하지 않거나 형식이 맞지 않을 경우 대비
    if (!timeString || !timeString.includes('~')) {
      return '정보 없음';
    }
    const [startTime, endTime] = timeString.split('~');
    const startHour = startTime.substring(0, 2);
    const endHour = endTime.substring(0, 2);

    return `${startHour}시~${endHour}시`;
  };

  // 오늘 요일을 확인하여 평일/주말 운영시간 결정
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일

  // 일요일(0) 또는 토요일(6)이면 주말, 그 외에는 평일
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const currentOperatingHours = isWeekend
    ? shelter.operatingHours.weekend
    : shelter.operatingHours.weekday;

  // 결정된 운영시간을 원하는 형식으로 변환
  const formattedOperatingHours = formatOperatingHours(currentOperatingHours);

  return (
    <div css={infoCardStyle}>
      {/* 1. 이름 */}
      <p css={shelterName}>{shelter.name}</p>

      <div css={cardTop}>
        {/* 2. 사진 */}
        <img
          src={
            shelter.photoUrl && shelter.photoUrl.trim() !== ''
              ? shelter.photoUrl
              : 'src/assets/images/NoImage.png'
          }
          alt={shelter.name || 'shelter'}
          css={thumbnail}
        />
        {/* 3. 설명 */}
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
          <p css={infoParagraph}>운영시간: {formattedOperatingHours}</p>
        </div>
      </div>
      {/* 4. 버튼 */}
      <button css={startButton} onClick={onStart}>
        안내 시작
      </button>
    </div>
  );
};

export default ShelterInfoCard;

/* 카드 스타일 */
const infoCardStyle = css`
  position: absolute;
  bottom: 4rem;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px ${theme.colors.button.white};
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1000;
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
  margin-bottom: 12px;
  width: 100%;
  text-align: center;
`;

const startButton = css`
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

/*별점 스타일*/
const starsWrapper = css`
  display: inline-flex;
  align-items: center;
  gap: 2px;
`;

const ratingNumber = css`
  color: ${theme.colors.button.red};
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
