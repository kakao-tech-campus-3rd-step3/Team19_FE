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

  // 텍스트 축소: 부모의 padding/실폭과 좌우 여백을 고려해 가운데 기준으로 scale 적용 (오버플로우 방지)
  useLayoutEffect(() => {
    const el = nameRef.current;
    if (!el) return;
    const original = shelter.name || '';

    // 초기 스타일. 가운데 기준 축소를 위해 transform-origin center로 설정
    el.style.visibility = 'hidden';
    el.style.whiteSpace = 'nowrap';
    el.style.display = 'inline-block';
    el.style.transformOrigin = 'center center';
    // 트랜지션 즉시 적용 (애니메이션 없음)
    el.style.transition = 'none';

    // 안전하게 오버플로우 숨김
    el.style.overflow = 'hidden';
    el.style.textOverflow = 'ellipsis';

    const compute = () => {
      el.textContent = original;
      el.style.transform = '';

      // 부모 실제 사용가능 너비 계산: parent.width - paddingLeft - paddingRight - safetyMargin
      const parent = el.parentElement;
      const parentRect = parent ? parent.getBoundingClientRect() : el.getBoundingClientRect();
      const parentStyle = parent
        ? window.getComputedStyle(parent)
        : ({ paddingLeft: '0px', paddingRight: '0px' } as any);
      const padLeft = parseFloat(parentStyle.paddingLeft || '0');
      const padRight = parseFloat(parentStyle.paddingRight || '0');
      // 카드 내부에 thumbnail/infoText 등으로 인해 실제 보이는 중앙폭이 달라질 수 있으므로 안전마진 추가
      const safety = 8; // px
      const available = Math.max(20, parentRect.width - padLeft - padRight - safety);

      // 텍스트 실제 폭(스크롤 폭) 측정
      const textWidth = el.scrollWidth;
      if (textWidth <= available) {
        el.style.transform = '';
        el.style.maxWidth = `${available}px`;
        el.style.visibility = '';
        return;
      }

      // scale 계산 및 최소 scale 제한
      const MIN_SCALE = 0.72;
      const scale = Math.max(MIN_SCALE, available / textWidth);
      el.style.transform = `scale(${scale})`;
      // 축소 후에도 좌우 여백 동일하게 보이도록 maxWidth 설정
      el.style.maxWidth = `${available}px`;
      el.style.visibility = '';
    };

    // 폰트 로드/렌더 안정화 후 계산
    const fontsReady =
      (document as any).fonts && (document as any).fonts.ready
        ? (document as any).fonts.ready
        : Promise.resolve();
    let rafId = 0;
    fontsReady.then(() => {
      rafId = requestAnimationFrame(() => {
        rafId = requestAnimationFrame(() => compute());
      });
    });

    // 부모/자식 크기 변경에 대응 (디바운스 via RAF)
    let ro: ResizeObserver | null = null;
    try {
      ro = new ResizeObserver(() => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => compute());
      });
      ro.observe(el);
      if (el.parentElement) ro.observe(el.parentElement);
    } catch {
      const onResize = () => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => compute());
      };
      window.addEventListener('resize', onResize);
      return () => {
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(rafId);
      };
    }

    return () => {
      cancelAnimationFrame(rafId);
      if (ro) {
        try {
          ro.disconnect();
        } catch {}
      }
    };
  }, [shelter.name, variant]); // home/find 모두 적용

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
        z-index: 1500;
        padding: 12px 16px;
        padding-bottom: 16px;
      `
    : css`
        position: relative;
        width: 100%;
        padding: 4px 12px 12px 12px;
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

const shelterName = ({ variant }: { variant: 'home' | 'find' }) => css`
  width: 100%;
  text-align: center;
  margin-top: 8px;
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  transition: none;

  /* variant에 따라 달라지는 스타일 */
  ${variant === 'home'
    ? css`
        margin-bottom: 8px;
        ${theme.typography.cardh1};
        color: ${theme.colors.text.blue};
      `
    : css`
        margin-bottom: 8px;
        ${theme.typography.cardf1};
        color: ${theme.colors.text.blue};
      `}
`;

const thumbnail = ({ variant }: { variant: 'home' | 'find' }) => css`
  ${variant === 'home'
    ? css`
        width: 30%;
        height: 90%;
        object-fit: cover;
        border-radius: 8px;
        margin-right: 12px;
        transition: none;
      `
    : css`
        width: 12vh;
        height: 12vh;
        object-fit: cover;
        border-radius: 8px;
        margin-right: 4px;
        transition: none;
      `}
`;

const infoText = css`
  flex: 1;
  text-align: left;
  margin-bottom: 4px;
  transition: none;
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
  transition: none;

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
  transition: none;

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
