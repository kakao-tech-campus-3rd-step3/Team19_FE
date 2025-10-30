/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useRef, useLayoutEffect } from 'react';
import theme from '../styles/theme';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import NoImage from '@/assets/images/NoImage.png';
import { useNavigate } from 'react-router-dom';
import { formatOperatingHours, checkIfOpenNow } from '@/utils/date';

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
    navigate('/guide', { state: { targetShelter: shelter } }); // 선택한 쉼터로 길안내 페이지로 이동
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = NoImage; // 이미지 로드 실패 시 NoImage로 대체
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
    formattedOperatingHours = formatOperatingHours(currentOperatingHours); // 유틸리티 함수 사용
    // 현재 실제 운영 여부 계산
    isActuallyOpen = checkIfOpenNow(currentOperatingHours);
  }

  const nameRef = useRef<HTMLParagraphElement | null>(null);

  // 1줄로 만들기: 텍스트가 1줄을 초과하면 폰트 크기를 줄여 1줄에 들어가도록 조정
  useLayoutEffect(() => {
    const el = nameRef.current;
    if (!el) return;
    const original = shelter.name || '';
    el.textContent = original;

    const cs = window.getComputedStyle(el);
    // 현재 폰트 사이즈/라인하이트
    const originalFontSize = parseFloat(cs.fontSize || '16');
    let lineHeight = parseFloat(cs.lineHeight);
    if (isNaN(lineHeight)) lineHeight = originalFontSize * 1.2;

    // 단일 라인 높이로 판단 (한 줄 허용)
    const singleLineHeight = lineHeight;

    // 이미 한 줄이면 아무 작업도 안 함
    if (el.scrollHeight <= singleLineHeight + 1) {
      // ensure inline style removed if previously set
      el.style.fontSize = '';
      return;
    }

    // 최소 폰트 크기 (px) — 너무 작아지지 않도록 설정
    const MIN_FONT_PX = 12;
    const maxFont = originalFontSize;
    const minFont = Math.max(MIN_FONT_PX, Math.floor(originalFontSize * 0.7));

    // 이진 탐색으로 한 줄에 들어가는 최대 폰트 크기 찾기
    let low = minFont;
    let high = maxFont;
    let best = minFont;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      el.style.fontSize = `${mid}px`;
      // force reflow to get updated scrollHeight
      const fitsOneLine = el.scrollHeight <= singleLineHeight + 1;
      if (fitsOneLine) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    // 적용
    el.style.fontSize = `${best}px`;

    // 창 크기 변경 시 및 폰트 상속 변경 시 재계산
    const onResize = () => {
      el.textContent = original;
      el.style.fontSize = '';
      const cs2 = window.getComputedStyle(el);
      const fontSize2 = parseFloat(cs2.fontSize || `${originalFontSize}`);
      let lh2 = parseFloat(cs2.lineHeight);
      if (isNaN(lh2)) lh2 = fontSize2 * 1.2;
      if (el.scrollHeight <= lh2 + 1) return;
      // 빠르게 동일 알고리즘 재적용
      let l = minFont;
      let h = Math.max(minFont, fontSize2);
      let b = minFont;
      while (l <= h) {
        const m = Math.floor((l + h) / 2);
        el.style.fontSize = `${m}px`;
        if (el.scrollHeight <= lh2 + 1) {
          b = m;
          l = m + 1;
        } else {
          h = m - 1;
        }
      }
      el.style.fontSize = `${b}px`;
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      // cleanup: restore inline font-size only if we changed it
      // (keep it if user still needs the reduced size)
    };
  }, [shelter.name, variant]); // variant가 바뀌면 재계산 해서 home/ find 모두 동작하도록 함

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
      <p ref={nameRef} css={shelterName({ variant })} onClick={handleNavigateToDetail}>
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
        bottom: calc(2rem + env(safe-area-inset-bottom));
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
        padding: 8px 12px;
        box-sizing: border-box;
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
  margin-bottom: 4px;
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
        margin-bottom: 8px;

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
