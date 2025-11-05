/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FaHeart } from 'react-icons/fa';
import NoImage from '@/assets/images/NoImage.png';
import theme from '@/styles/theme';
import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { addWish, deleteWish } from '@/api/wishApi';
import { createPortal } from 'react-dom';

interface WishShelter {
  shelterId: number;
  name: string;
  address: string;
  operatingHours: string;
  averageRating: number;
  photoUrl: string;
  distance: string;
}

interface WishListCardProps {
  item: WishShelter;
  onClick?: (shelterId: number) => void;
  refetchWishList: () => void;
}

const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.src = NoImage;
};

// 애니메이션 시간(ms) — 아래 카드(형제) 올라오는 속도 늘림
const ANIM_MS = 2000; // siblings(위치 보정) 전체 시간 (기존 1500 -> 2000ms)
// 카드 우측 슬라이드 시간 설정
const CARD_MS = 1200;

const WishListCard = ({ item, onClick, refetchWishList }: WishListCardProps) => {
  const [isFavorite, setIsFavorite] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false); // 삭제 애니메이션 플래그 (ReviewListCard와 동일)
  const bodyLockRef = useRef(0);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const removeTimeoutRef = useRef<number | null>(null);
  const siblingStartTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const modalOpen = showModal;
    const body = document.body;
    if (modalOpen) {
      const prev = Number(body.dataset.modalOpenCount ?? 0);
      body.dataset.modalOpenCount = String(prev + 1);
      if (prev === 0) {
        body.dataset.prevOverflow = body.style.overflow || '';
        body.dataset.prevScrollY = String(window.scrollY || 0);
        body.style.overflow = 'hidden';
      }
      bodyLockRef.current = Number(body.dataset.modalOpenCount);
    } else {
      const prev = Number(body.dataset.modalOpenCount ?? 0);
      const next = Math.max(0, prev - 1);
      body.dataset.modalOpenCount = String(next);
      if (next === 0) {
        const prevOverflow = body.dataset.prevOverflow ?? '';
        const prevScrollY = Number(body.dataset.prevScrollY ?? 0);
        body.style.overflow = prevOverflow;
        window.scrollTo(0, prevScrollY);
        delete body.dataset.prevOverflow;
        delete body.dataset.prevScrollY;
        delete body.dataset.modalOpenCount;
        bodyLockRef.current = 0;
      } else {
        bodyLockRef.current = next;
      }
    }
    return () => {
      const prev = Number(body.dataset.modalOpenCount ?? 0);
      if (prev <= 1) {
        const prevOverflow = body.dataset.prevOverflow ?? '';
        const prevScrollY = Number(body.dataset.prevScrollY ?? 0);
        body.style.overflow = prevOverflow;
        window.scrollTo(0, prevScrollY);
        delete body.dataset.prevOverflow;
        delete body.dataset.prevScrollY;
        delete body.dataset.modalOpenCount;
      } else {
        body.dataset.modalOpenCount = String(prev - 1);
      }
    };
  }, [showModal]);

  const deleteWishMutation = useMutation({
    mutationFn: () => deleteWish({ shelterId: item.shelterId }),
    onSuccess: () => {
      setIsFavorite(false);
      // 서버 반영은 refetch로 처리
      refetchWishList();
    },
    onError: () => {
      // 실패 시도: refetch로 강제 동기화
      refetchWishList();
    },
  });

  const addWishMutation = useMutation({
    mutationFn: () => addWish({ shelterId: item.shelterId }),
    onSuccess: () => {
      setIsFavorite(true);
      refetchWishList();
    },
    onError: () => {
      refetchWishList();
    },
  });

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite) setShowModal(true);
    else addWishMutation.mutate();
  };

  // 삭제 확인: ReviewListCard와 동일한 흐름으로 변경
  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(false);
    setIsRemoving(true);

    const wrapperEl = wrapperRef.current;
    if (!wrapperEl) {
      deleteWishMutation.mutate();
      return;
    }

    // 1) 카드 우측 슬라이드
    const cardEl = wrapperEl.firstElementChild as HTMLElement | null;
    if (cardEl) {
      cardEl.style.transition = `transform ${CARD_MS}ms cubic-bezier(0.22,0.9,0.25,1), opacity ${CARD_MS}ms cubic-bezier(0.22,0.9,0.25,1)`;
      cardEl.style.transform = 'translateX(100%)';
      cardEl.style.opacity = '0';
      cardEl.style.willChange = 'transform, opacity';
    }

    // 2) measure siblings before collapsing
    const parent = wrapperEl.parentElement;
    const siblings = parent
      ? (Array.from(parent.children).filter((c) => c !== wrapperEl) as HTMLElement[])
      : [];
    const beforeRects = siblings.map((s) => s.getBoundingClientRect());

    // 3) collapse wrapper (visual)
    const height = wrapperEl.scrollHeight;
    wrapperEl.style.transition = `max-height ${ANIM_MS}ms ease, margin ${ANIM_MS}ms ease, padding ${ANIM_MS}ms ease`;
    wrapperEl.style.overflow = 'hidden';
    wrapperEl.style.maxHeight = `${height}px`;
    // force reflow then collapse
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    wrapperEl.offsetHeight;
    wrapperEl.style.maxHeight = '0px';
    wrapperEl.style.marginBottom = '0px';
    wrapperEl.style.paddingTop = '0px';
    wrapperEl.style.paddingBottom = '0px';
    wrapperEl.style.willChange = 'max-height';

    // 4) measure after and apply inverse transform, then animate to 0 (FLIP)
    requestAnimationFrame(() => {
      const afterRects = siblings.map((s) => s.getBoundingClientRect());
      siblings.forEach((s, i) => {
        const dy = beforeRects[i].top - afterRects[i].top;
        if (!dy) return;
        s.style.transition = 'none';
        s.style.transform = `translateY(${dy}px)`;
      });
      // force reflow
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      siblings[0]?.offsetHeight;
      // animate siblings to final position
      siblings.forEach((s) => {
        s.style.transition = `transform ${ANIM_MS}ms cubic-bezier(0.2,0.8,0.2,1)`;
        s.style.transform = 'translateY(0)';
      });
    });

    // 5) 서버 요청 병렬 전송
    deleteWishMutation.mutate(undefined, {
      onError: () => {
        refetchWishList();
      },
    });

    // 6) cleanup after full anim
    if (removeTimeoutRef.current) window.clearTimeout(removeTimeoutRef.current);
    removeTimeoutRef.current = window.setTimeout(
      () => {
        refetchWishList();
        // cleanup inline styles
        if (wrapperEl) {
          wrapperEl.style.overflow = '';
          wrapperEl.style.maxHeight = '';
          wrapperEl.style.transition = '';
          wrapperEl.style.marginBottom = '';
          wrapperEl.style.paddingTop = '';
          wrapperEl.style.paddingBottom = '';
          wrapperEl.style.willChange = '';
        }
        siblings.forEach((s) => {
          s.style.transition = '';
          s.style.transform = '';
        });
        if (cardEl) {
          cardEl.style.transition = '';
          cardEl.style.transform = '';
          cardEl.style.opacity = '';
          cardEl.style.willChange = '';
        }
        setIsRemoving(false);
      },
      Math.max(ANIM_MS, CARD_MS) + 60,
    );
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(false);
  };

  useEffect(() => {
    return () => {
      if (removeTimeoutRef.current) window.clearTimeout(removeTimeoutRef.current);
      if (siblingStartTimeoutRef.current) window.clearTimeout(siblingStartTimeoutRef.current);
    };
  }, []);

  const displayRating = (() => {
    const v = Number(item.averageRating) || 0;
    return (Math.round(v * 10) / 10).toFixed(1);
  })();
  const starCount = Math.round(Number(item.averageRating) || 0);

  return (
    <div
      ref={wrapperRef}
      css={itemWrapper}
      onClick={() => onClick && onClick(item.shelterId)}
      role="button"
      tabIndex={0}
    >
      <div css={[card, isRemoving && removingStyle]}>
        <div css={cardTitleRow}>
          <span css={cardTitle}>{item.name}</span>
          <span onClick={handleHeartClick} style={{ cursor: 'pointer' }}>
            {isFavorite ? (
              <FaHeart color="red" css={cardHeart} />
            ) : (
              <FaHeart color="#bbb" css={cardHeart} />
            )}
          </span>
        </div>

        <div css={cardBottomRow}>
          <img
            src={item.photoUrl && item.photoUrl.trim() !== '' ? item.photoUrl : NoImage}
            alt="찜 이미지"
            css={cardImg}
            onError={handleImageError}
          />
          <div css={cardInfo}>
            <div css={cardinfostyle}>거리: {item.distance}</div>
            <div css={cardRating}>
              별점: <span css={ratingNumber}>{displayRating}</span>
              <span css={starsWrapper}>
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} css={i < starCount ? filledStar : emptyStar}>
                    ★
                  </span>
                ))}
              </span>
            </div>
            <div css={cardinfostyle}>주소: {item.address}</div>
          </div>
        </div>

        {showModal &&
          createPortal(
            <div
              css={modalOverlay}
              onClick={() => {
                setShowModal(false);
              }}
            >
              <div css={modalBox} onClick={(e) => e.stopPropagation()}>
                <div css={modalText}>
                  찜 목록에서
                  <br />
                  삭제하시겠습니까?
                </div>
                <div css={modalButtons}>
                  <button css={modalBtn} onClick={handleConfirm}>
                    예
                  </button>
                  <button css={modalBtn} onClick={handleCancel}>
                    아니요
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    </div>
  );
};

const removingStyle = css`
  transform: translateX(100%);
  opacity: 0;
  transition:
    transform ${CARD_MS}ms cubic-bezier(0.22, 0.9, 0.25, 1),
    opacity ${CARD_MS}ms cubic-bezier(0.22, 0.9, 0.25, 1);
`;

// 스타일 보강: will-change 추가로 깜박임 완화
const itemWrapper = css`
  overflow: hidden;
  margin-bottom: 12px;
  will-change: max-height;
`;

const card = css`
  background: #dcdcdcbf;
  border-radius: 12px;
  overflow: hidden;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px 0;
  -webkit-tap-highlight-color: transparent;
  will-change: transform, opacity;
`;

/* 이하 스타일은 기존과 동일 */
const cardTitleRow = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 16px 8px 16px;
`;
const cardTitle = css`
  ${theme.typography.wish2};
  padding-bottom: 4px;
  display: block;
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: left;
`;
const cardHeart = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding-bottom: 4px;
`;
const cardBottomRow = css`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
  padding: 0 16px;
`;
const cardImg = css`
  width: 30%;
  height: 120px; /* 고정 높이로 레이아웃 안정화 */
  object-fit: cover;
  border-radius: 8px;
  background: #fafafa;
`;
const cardInfo = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`;
const cardRating = css`
  display: flex;
  align-items: center;
  gap: 6px;
  ${theme.typography.wish3};
  color: ${theme.colors.text.gray500};
`;
const ratingNumber = css`
  ${theme.typography.wish3};
  color: ${theme.colors.text.red};
`;
const starsWrapper = css`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  ${theme.typography.wish3};
  color: ${theme.colors.text.gray500};
`;
const filledStar = css`
  color: #ffd700;
  ${theme.typography.wish3};
`;
const emptyStar = css`
  color: #bbb;
  ${theme.typography.wish3};
`;
const cardinfostyle = css`
  text-align: left;
  ${theme.typography.wish3};
  color: ${theme.colors.text.gray500};
`;
const modalOverlay = css`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 2001;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const modalBox = css`
  background: #fff;
  border-radius: 16px;
  padding: 32px 28px 24px 28px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
  display: flex;
  max-width: 80%;
  flex-direction: column;
  align-items: center;
`;
const modalText = css`
  ${theme.typography.modal1};
  color: #222;
  margin-bottom: 24px;
  text-align: center;
`;
const modalButtons = css`
  display: flex;
  gap: 18px;
`;
const modalBtn = css`
  ${theme.typography.modal2};
  background: ${theme.colors.button.black};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  cursor: pointer;
  transition: background 0.18s;
`;

export default WishListCard;
