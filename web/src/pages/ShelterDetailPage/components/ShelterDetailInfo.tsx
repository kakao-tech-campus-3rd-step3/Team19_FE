/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useRef, useLayoutEffect, useState } from 'react';
import theme from '@/styles/theme';
import { FaHeart, FaRegHeart, FaUser } from 'react-icons/fa';
import { MdAcUnit, MdLocationOn, MdAccessTime, MdExpandMore, MdExpandLess } from 'react-icons/md';
import { GiWindTurbine } from 'react-icons/gi';
import NoImage from '@/assets/images/NoImage.png';
import { formatOperatingHours, checkIfOpenNow } from '@/utils/date';
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
    // API에서 null/undefined로 올 수 있으므로 optional + nullable 허용
    fanCount?: number | null;
    acCount?: number | null;
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
  // 상세에서도 targetShelter을 state로 전달하도록 시그니처 통일 (옵셔널)
  onGuideStart?: (targetShelter?: ShelterDetail) => void;
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
  const [hoursOpen, setHoursOpen] = useState(false); // 운영시간 펼침 상태 (디폴트: 닫힘)
  const navigate = useNavigate(); // 추가

  // 제목 DOM 레퍼런스 (한 줄로 맞추기용)
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  useLayoutEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const original = shelter.name || '';

    // 텍스트를 font-size 기반으로 축소하여 부모 폭에 맞춤 (좌우 여백 8px 보장)
    el.style.visibility = 'hidden';
    el.style.whiteSpace = 'nowrap';
    el.style.display = 'block';
    el.style.boxSizing = 'border-box';
    el.style.transition = 'none';

    const compute = () => {
      // 원본 텍스트 반영 (span/br 등 제거하고 단일 텍스트로 처리)
      el.textContent = original;
      // 기존 inline style fontSize 기준값 저장 (dataset에 보관)
      if (!el.dataset.baseFontSize) {
        const cs = window.getComputedStyle(el);
        const base = parseFloat(cs.fontSize || '16') || 16;
        el.dataset.baseFontSize = String(base);
      }
      const baseFontSize = parseFloat(el.dataset.baseFontSize || '16');

      const parent = el.parentElement;
      const parentRect = parent ? parent.getBoundingClientRect() : el.getBoundingClientRect();
      const pStyle = parent ? window.getComputedStyle(parent) : ({} as any);
      const padLeft = parseFloat(pStyle.paddingLeft || '0');
      const padRight = parseFloat(pStyle.paddingRight || '0');
      const safety = 8; // 좌우 최소 여백
      const available = Math.max(40, parentRect.width - padLeft - padRight - safety);

      // 텍스트의 원래 폭 측정 (현재 fontSize로 측정)
      // reset fontSize before measuring to get consistent base measurement
      el.style.fontSize = '';
      const textWidth = el.scrollWidth;
      // 폭 제한을 걸어두면 줄바꿈/overflow 방지에 유리
      el.style.maxWidth = `${available}px`;

      if (textWidth <= available) {
        // 충분히 들어가면 원래 폰트 크기 사용(기본값으로 복원)
        el.style.fontSize = '';
        el.style.visibility = '';
        return;
      }

      // 계산된 scale과 이를 이용한 폰트 크기 적용
      const scale = available / textWidth;
      const MIN_FONT_PX = 12; // 최소 허용 폰트 사이즈(px) — 필요시 조정
      const newFont = Math.max(MIN_FONT_PX, Math.floor(baseFontSize * scale));
      el.style.fontSize = `${newFont}px`;

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
      // 스타일 원복
      try {
        el.style.fontSize = '';
        el.style.maxWidth = '';
        if (ro) ro.disconnect();
      } catch {}
    };
  }, [shelter.name]);

  const handleStartGuide = () => {
    console.log('안내 시작 버튼 클릭됨'); // 디버그
    try {
      // 부모가 콜백을 받는다면 선택된 쉼터 객체를 전달
      onGuideStart && onGuideStart(shelter);
    } catch (err) {
      console.warn('onGuideStart 호출 중 오류', err);
    }
    // ShelterInfoCard와 동일하게 targetShelter를 state로 넘겨 가이드 페이지로 이동
    navigate('/guide', { state: { targetShelter: shelter } });
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
          <div css={metaRow}>
            <MdLocationOn size={25} color={theme.colors.text.gray500} css={metaIcon} aria-hidden />
            <b css={infoBold}>{shelter.address}</b>
          </div>
          <div css={metaRow}>
            <MdAccessTime size={25} color={theme.colors.text.gray500} css={metaIcon} aria-hidden />
            <button
              type="button"
              css={hoursToggleBtn}
              aria-expanded={hoursOpen}
              onClick={(e) => {
                e.stopPropagation();
                setHoursOpen((v) => !v);
              }}
            >
              {/* 운영중/운영종료 표시 */}
              {(() => {
                const now = new Date();
                const day = now.getDay(); // 0=Sun,6=Sat
                const isWeekend = day === 0 || day === 6;
                const target = isWeekend
                  ? shelter.operatingHours.weekend
                  : shelter.operatingHours.weekday;
                return checkIfOpenNow(target) ? (
                  <span css={[infoBold, openStatus]} aria-live="polite">
                    운영중
                  </span>
                ) : (
                  <span css={[infoBold, closedStatus]} aria-live="polite">
                    운영종료
                  </span>
                );
              })()}
              <span css={toggleIcon} aria-hidden>
                {hoursOpen ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
              </span>
            </button>
          </div>
          {/* 상세 운영시간: 기본 닫힘(디폴트). 펼침 시 평일/주말 표시 */}
          {hoursOpen && (
            <div css={hoursDetail}>
              <div css={[infoBold, hoursDetailRow]}>
                평일: {formatOperatingHours(shelter.operatingHours.weekday)}
              </div>
              <div css={[infoBold, hoursDetailRow]}>
                주말: {formatOperatingHours(shelter.operatingHours.weekend)}
              </div>
            </div>
          )}
          {/* 수용 인원 + 에어컨 + 선풍기 — 3열 그리드 */}
          <div css={equipmentGrid}>
            <div css={equipmentItem} role="group" aria-label="수용 인원">
              <div css={equipmentIcon} aria-hidden>
                <FaUser size={28} color={theme.colors.text.blue} />
              </div>
              <div css={equipmentLabel}>수용 인원</div>
              <div css={equipmentCount}>{shelter.capacity ?? 0}명</div>
            </div>
            <div css={equipmentItem} role="group" aria-label="에어컨">
              <div css={equipmentIcon} aria-hidden>
                <MdAcUnit size={28} color={theme.colors.text.blue} />
              </div>
              <div css={equipmentLabel}>에어컨</div>
              <div css={equipmentCount}>{shelter.coolingEquipment.acCount ?? 0}대</div>
            </div>
            <div css={equipmentItem} role="group" aria-label="선풍기">
              <div css={equipmentIcon} aria-hidden>
                <GiWindTurbine size={28} color={theme.colors.text.blue} />
              </div>
              <div css={equipmentLabel}>선풍기</div>
              <div css={equipmentCount}>{shelter.coolingEquipment.fanCount ?? 0}대</div>
            </div>
          </div>
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
  color: ${theme.colors.text.blue};
  box-sizing: border-box;
  padding: 0 8px; /* 좌우 최소 여백 확보 */
  max-width: calc(100% - 16px); /* 좌우 패딩 만큼 여유 확보 */
  display: block;
  overflow: hidden; /* 스케일로 인해 넘칠 경우 잘라서 가로 스크롤 방지 */
`;

const topSection = css`
  display: flex;
  flex-direction: column; /* 모바일 고정: 세로 스택 */
  gap: 12px;
  align-items: center;
  width: 80%;
  box-sizing: border-box;
  padding: 0 8px; /* 전체 상단 섹션에 좌우 여백 추가 */
`;

const thumbnail = css`
  width: 100%; /* 고정 크기: 이미지가 너무 커지지 않도록 제한 */
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
  gap: 10px;
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
  ${theme.typography.detail2};
  color: ${theme.colors.text.yellow};
  /* 부드러운 어두운 외곽선: 여러 방향 text-shadow로 균일하게 처리 */
  text-shadow:
    1px 1px 0 rgba(0, 0, 0, 0.2),
    -1px 1px 0 rgba(0, 0, 0, 0.2),
    1px -1px 0 rgba(0, 0, 0, 0.2),
    -1px -1px 0 rgba(0, 0, 0, 0.2),
    0 2px 4px rgba(0, 0, 0, 0.06);
  /* WebKit 기반 브라우저에서 약한 스트로크 보강(선명도) */
  -webkit-text-stroke: 0.4px rgba(0, 0, 0, 0.14);
`;

const emptyStar = css`
  ${theme.typography.detail2};
  color: ${theme.colors.text.gray200};
  /* 빈 별도 약한 외곽선으로 가독성 확보 */
  text-shadow:
    1px 1px 0 rgba(0, 0, 0, 0.2),
    -1px 1px 0 rgba(0, 0, 0, 0.2),
    1px -1px 0 rgba(0, 0, 0, 0.2),
    -1px -1px 0 rgba(0, 0, 0, 0.2),
    0 1px 2px rgba(0, 0, 0, 0.04);
  -webkit-text-stroke: 0.3px rgba(0, 0, 0, 0.08);
`;

const infoBold = css`
  ${theme.typography.detail3};
  color: ${theme.colors.text.black};
  align-items: center;
  justify-content: center;
`;

/* 냉방 장비 2열 레이아웃 */
const equipmentGrid = css`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-flow: column; /* 세로(열) 우선 배치: 위→아래로 채우고 다음 열로 이동 */
  grid-auto-rows: minmax(0, auto);
  gap: 8px;
  width: 100%;
  margin-top: 8px;
  align-items: start;
`;

const equipmentItem = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
`;

const equipmentIcon = css`
  font-size: 1.9rem;
  line-height: 1;
  margin-bottom: 6px;
`;

const equipmentLabel = css`
  ${theme.typography.edit3};
  color: ${theme.colors.text.black};
  margin-bottom: 4px;
`;

const equipmentCount = css`
  ${theme.typography.edit3};
  font-weight: 700;
  color: ${theme.colors.text.black};
`;

/* meta (아이콘 + 텍스트) */
const metaRow = css`
  /* 아이콘(고정 너비) + 텍스트(시작 위치 정렬)를 그리드로 고정하여
     모든 meta 항목의 텍스트 시작점이 동일하도록 맞춤 */
  display: grid;
  grid-template-columns: 28px 1fr;
  align-items: center;
  gap: 8px;
`;

const metaIcon = css`
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  margin: 0;
`;

/* 운영시간 토글 버튼 및 상세 영역 */
const hoursToggleBtn = css`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  padding: 0; /* 텍스트 시작 점을 아이콘과 정렬하기 위해 여백 제거 */
  margin: 0;
  cursor: pointer;
  color: inherit;
`;

const toggleIcon = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.text.gray500};
`;

const hoursDetail = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 6px;
`;

/* 추가: 메타 아이콘 칸(28px) + gap(8px) 만큼 왼쪽 여백을 줌 */
const hoursDetailRow = css`
  padding-left: 36px;
`;

/* 운영 상태 색상 */
const openStatus = css`
  color: #000000ff; /* 검은색: 운영중 */
  ${theme.typography.detail3};
`;

const closedStatus = css`
  color: #6b7280; /* 회색: 운영종료 */
  ${theme.typography.detail3};
`;
