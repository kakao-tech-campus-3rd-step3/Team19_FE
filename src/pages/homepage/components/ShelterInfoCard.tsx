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
  return (
    <div css={infoCardStyle}>
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
          <p css={shelterName}>{shelter.name}</p>
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
          <p css={infoParagraph}>
            운영시간: 평일 {shelter.operatingHours.weekday}
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 주말{' '}
            {shelter.operatingHours.weekend}
          </p>
        </div>
      </div>
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
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 95%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px ${theme.colors.button.white};
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1000;
`;

const cardTop = css`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-bottom: 8px;
`;

const thumbnail = css`
  width: 40%;
  height: 230px;
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
  margin-bottom: 6px;
`;

const startButton = css`
  margin-top: 10px;
  width: 100%;
  background: ${theme.colors.button.red};
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-size: ${theme.typography.button2Bold.fontSize};
  font-weight: ${theme.typography.button2Bold.fontWeight};
  line-height: ${theme.typography.button2Bold.lineHeight};
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
