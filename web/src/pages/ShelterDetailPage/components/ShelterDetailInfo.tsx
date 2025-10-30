/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useRef, useLayoutEffect } from 'react';
import theme from '@/styles/theme';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import NoImage from '@/assets/images/NoImage.png';
import { formatOperatingHours } from '@/utils/date';
import { useNavigate } from 'react-router-dom'; // 추가

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
  const navigate = useNavigate(); // 추가

  // 제목 DOM 레퍼런스 (한 줄로 맞추기용)
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  useLayoutEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const original = shelter.name || '';

    // 축소(스케일)로 한 줄에 맞추기
    el.style.visibility = 'hidden';
    el.style.whiteSpace = 'nowrap';
    el.style.display = 'inline-block';
    el.style.transformOrigin = 'center center';
    el.style.willChange = 'transform';
    // 즉시 적용: transition 제거하여 축소 애니메이션이 보이지 않도록 함
    el.style.transition = 'none';
    el.style.overflow = 'visible';

    const compute = () => {
      el.textContent = original;
      el.style.transform = '';
      const parent = el.parentElement;
      const parentRect = parent ? parent.getBoundingClientRect() : el.getBoundingClientRect();
      const pStyle = parent ? window.getComputedStyle(parent) : ({} as any);
      const padLeft = parseFloat(pStyle.paddingLeft || '0');
      const padRight = parseFloat(pStyle.paddingRight || '0');
      const safety = 8;
      const available = Math.max(40, parentRect.width - padLeft - padRight - safety);

      const textWidth = el.scrollWidth;
      if (textWidth <= available) {
        el.style.transform = '';
        el.style.visibility = '';
        return;
      }

      const MIN_SCALE = 0.72;
      const scale = Math.max(MIN_SCALE, available / textWidth);
      el.style.transform = `scale(${scale})`;
      el.style.visibility = '';
    };

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
  }, [shelter.name]);

  const handleStartGuide = () => {
    console.log('안내 시작 버튼 클릭됨'); // 디버그
    try {
      // 컴포넌트 외부에서 처리할 로직이 있으면 호출
      onGuideStart && onGuideStart();
    } catch (err) {
      console.warn('onGuideStart 호출 중 오류', err);
    }
    // 항상 라우팅도 수행하여 FindSheltersPage와 동일 동작 보장
    // shelterId를 쿼리로 전달 (필요에 따라 state로 변경 가능)
    navigate(`/guide?shelterId=${shelter.shelterId}`);
  };

  return (
    <>
      {/** '..' 가 이미 들어있으면 '..'을 기준으로 줄바꿈하여 표시, 그렇지 않으면 titleRef에 의해 스케일로 한줄 처리 */}
      {shelter.name.includes('..') ? (
        (() => {
          const parts = shelter.name.split('..').map((s) => s.trim());
          return (
            <h2 css={title} ref={titleRef}>
              <span>{parts[0]}</span>
              {parts[1] ? <br /> : null}
              {parts[1] ? <span>{parts[1]}</span> : null}
            </h2>
          );
        })()
      ) : (
        <h2 css={title} ref={titleRef}>
          {shelter.name}
        </h2>
      )}
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
          type="button"
          onClick={handleStartGuide} // 변경: 직접 네비게이트 보장
        >
          안내 시작
        </button>
        <button css={favoriteButton} onClick={onToggleFavorite}>
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
  width: 80%;
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
  display: inline-block;
  white-space: nowrap; /* 한 줄로 고정 */
  overflow: hidden; /* 넘치면 숨김 */
  text-overflow: ellipsis; /* 넘칠 때 말줄임 */
  max-width: 100%;
  box-sizing: border-box;
`;

// 기존 ratingRow 대체
const ratingRow = css`
  display: flex;
  align-items: center;
  gap: 6px;
  ${theme.typography.detail2};
  margin-bottom: 20px;
  white-space: nowrap; /* 한 줄로 고정 */
  overflow: hidden; /* 넘치면 숨김 */
  text-overflow: ellipsis; /* 넘칠 때 말줄임 */
  min-width: 0; /* flex 축소 허용 (자식에 overflow 동작시키기 위해 필요) */
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
