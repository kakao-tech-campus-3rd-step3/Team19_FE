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
  // 부모 콜백 — ReviewListCard와 동일한 패턴으로 처리
  onStartRemoving?: (shelterId: number) => void;
  onFinalizeRemove?: (shelterId: number) => void;
  onCancelRemoving?: (shelterId: number) => void;
  // 기존 refetch는 폴백으로 유지(선택)
  refetchWishList?: () => void;
}

const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.src = NoImage;
};

// 애니메이션 시간(ms)
const ANIM_MS = 1200; // wrapper collapse / siblings 이동 시간 (기존)
const CARD_MS = 1200; // 카드 우측 슬라이드 전용 시간 — 이 값을 늘리면 슬라이드가 더 느려짐

const WishListCard = ({
  item,
  onClick,
  onStartRemoving,
  onFinalizeRemove,
  onCancelRemoving,
  refetchWishList,
}: WishListCardProps) => {
  const [isFavorite, setIsFavorite] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false); // 삭제 애니메이션 플래그 (ReviewListCard와 동일)
  // 애니메이션 중 부모에서 들어오는 prop 변경으로 인한 깜박임 방지용 스냅샷
  const snapshotRef = useRef<WishShelter | null>(null);
  const bodyLockRef = useRef(0);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const removeTimeoutRef = useRef<number | null>(null);

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

  // 삭제 뮤테이션: 성공 시에도 즉시 부모 리패치하지 않음(애니메이션 후 한 번만 refetch)
  const deleteWishMutation = useMutation({
    mutationFn: () => deleteWish({ shelterId: item.shelterId }),
  });

  const addWishMutation = useMutation({
    mutationFn: () => addWish({ shelterId: item.shelterId }),
    onSuccess: () => {
      setIsFavorite(true);
      if (typeof refetchWishList === 'function') refetchWishList();
    },
    onError: () => {
      if (typeof refetchWishList === 'function') refetchWishList();
    },
  });

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite) setShowModal(true);
    else addWishMutation.mutate();
  };

  // 삭제 확인: ReviewListCard와 동일한 흐름으로 (wrapper collapse -> siblings translate by height -> translateY(0))
  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(false);
    // 애니메이션 동안 외부 리패치/props 변경을 무시하기 위해 현재 item 스냅샷 저장
    snapshotRef.current = item;
    setIsRemoving(true);

    const wrapperEl = wrapperRef.current;
    // if no wrapper (unexpected), still call mutation
    if (!wrapperEl) {
      deleteWishMutation.mutate();
      return;
    }

    // 카드 우측 슬라이드 (ANIM_MS에 맞춰 동일 동작)
    const cardEl = wrapperEl.firstElementChild as HTMLElement | null;
    if (cardEl) {
      cardEl.style.transition = `transform ${CARD_MS}ms cubic-bezier(0.22,0.9,0.25,1), opacity ${CARD_MS}ms cubic-bezier(0.22,0.9,0.25,1)`;
      cardEl.style.transform = 'translateX(100%)';
      cardEl.style.opacity = '0';
    }

    // 간단한 siblings 처리: ReviewListCard와 동일하게 아래 형제들을 먼저 height만큼 아래로 옮겨놓음
    const affectedSiblings: HTMLElement[] = [];
    const height = wrapperEl.scrollHeight;

    // wrapper collapse 준비
    wrapperEl.style.transition = `max-height ${ANIM_MS}ms ease, margin ${ANIM_MS}ms ease, padding ${ANIM_MS}ms ease`;
    wrapperEl.style.overflow = 'hidden';
    wrapperEl.style.maxHeight = `${height}px`;

    let next = wrapperEl.nextElementSibling as HTMLElement | null;
    while (next) {
      affectedSiblings.push(next);
      next.style.transition = `transform ${ANIM_MS}ms ease`;
      next.style.transform = `translateY(${height}px)`;
      next = next.nextElementSibling as HTMLElement | null;
    }

    // 강제 리플로우 후 collapse
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    wrapperEl.offsetHeight;
    wrapperEl.style.maxHeight = '0px';
    wrapperEl.style.marginBottom = '0px';
    wrapperEl.style.paddingTop = '0px';
    wrapperEl.style.paddingBottom = '0px';

    // siblings를 0으로 이동시켜 위로 올라오게 함
    requestAnimationFrame(() => {
      for (const s of affectedSiblings) {
        s.style.transform = 'translateY(0)';
      }
    });

    // 부모에게 제거 시작 알림 (선택) — 함수인지 확인 후 호출
    if (typeof onStartRemoving === 'function') {
      onStartRemoving(item.shelterId);
    }

    // 서버 요청 병렬 전송 — 에러 시에는 부모에게 복구 알림
    deleteWishMutation.mutate(undefined, {
      onError: (_err: any) => {
        // 부모 복구 콜백 우선 호출 (함수인지 확인)
        if (typeof onCancelRemoving === 'function') {
          onCancelRemoving(item.shelterId);
        }
        // 폴백: refetch가 제공되면 호출
        if (refetchWishList) refetchWishList();
        setIsRemoving(false);
        snapshotRef.current = null;
      },
    });

    // cleanup after full anim (CARD_MS 혹은 ANIM_MS 중 큰 값)
    if (removeTimeoutRef.current) window.clearTimeout(removeTimeoutRef.current);
    removeTimeoutRef.current = window.setTimeout(
      () => {
        // 애니메이션 종료 시 부모에게 최종 제거 알림(부모가 리스트에서 제거)
        if (typeof onFinalizeRemove === 'function') {
          onFinalizeRemove(item.shelterId);
        } else if (refetchWishList) {
          refetchWishList(); // 폴백
        }

        // 스냅샷 제거 및 애니메이션 상태 해제
        setIsRemoving(false);
        snapshotRef.current = null;
      },
      Math.max(ANIM_MS, CARD_MS),
    );
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(false);
  };

  useEffect(() => {
    return () => {
      if (removeTimeoutRef.current) window.clearTimeout(removeTimeoutRef.current);
    };
  }, []);

  // 애니메이션 중에는 snapshot을 사용하여 부모 refetch/props 변경을 무시
  const displayed = isRemoving && snapshotRef.current ? snapshotRef.current : item;

  const displayRating = (() => {
    const v = Number(displayed.averageRating) || 0;
    return (Math.round(v * 10) / 10).toFixed(1);
  })();
  const starCount = Math.round(Number(displayed.averageRating) || 0);

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
          <span css={cardTitle}>{displayed.name}</span>
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
            src={
              displayed.photoUrl && displayed.photoUrl.trim() !== '' ? displayed.photoUrl : NoImage
            }
            alt="찜 이미지"
            css={cardImg}
            onError={handleImageError}
          />
          <div css={cardInfo}>
            <div css={cardinfostyle}>거리: {displayed.distance}</div>
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
            <div css={cardinfostyle}>주소: {displayed.address}</div>
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
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 8px;
  background: #fafafa;
  flex-shrink: 0;
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
  color: ${theme.colors.text.yellow};
  font-size: ${theme.typography.cardh4.fontSize};
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
  color: ${theme.colors.text.gray150};
  font-size: ${theme.typography.cardh4.fontSize};
  /* 빈 별도 약한 외곽선으로 가독성 확보 */
  text-shadow:
    1px 1px 0 rgba(0, 0, 0, 0.2),
    -1px 1px 0 rgba(0, 0, 0, 0.2),
    1px -1px 0 rgba(0, 0, 0, 0.2),
    -1px -1px 0 rgba(0, 0, 0, 0.2),
    0 1px 2px rgba(0, 0, 0, 0.04);
  -webkit-text-stroke: 0.3px rgba(0, 0, 0, 0.08);
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
