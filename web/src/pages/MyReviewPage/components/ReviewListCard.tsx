/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import NoImage from '@/assets/images/NoImage.png';
import theme from '@/styles/theme';
import { FaTrash } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { deleteReview } from '@/api/reviewApi';
import { createPortal } from 'react-dom';

interface MyReview {
  reviewId: number;
  shelterId: number;
  shelterName?: string;
  name: string;
  userId: number;
  content: string;
  rating: number;
  photoUrl: string | null;
  profileImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewListCardProps {
  item: MyReview;
  onClick: (shelterId: number) => void;
  onToast: (msg: string) => void;
  onStartRemoving?: (reviewId: number) => void;
  onFinalizeRemove?: (reviewId: number) => void;
  onCancelRemoving?: (reviewId: number) => void;
  onRestore?: () => void;
  isDeleting?: boolean;
}

const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.src = NoImage;
};

// 애니메이션 시간(밀리초) — 모듈 상단에서 고정
const ANIM_MS = 1200;

const ReviewListCard = ({
  item,
  onClick,
  onStartRemoving,
  onFinalizeRemove,
  onCancelRemoving,
  onRestore,
  isDeleting = false,
}: ReviewListCardProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalImg, setModalImg] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const bodyLockRef = useRef(0);
  const removeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const modalOpen = showDeleteModal || !!modalImg;
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
  }, [showDeleteModal, modalImg]);

  const mutation = useMutation({
    mutationFn: (reviewId: number) => deleteReview(reviewId),
  });

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(false);

    try {
      onStartRemoving && onStartRemoving(item.reviewId);
    } catch (err) {
      console.warn('onStartRemoving error', err);
    }
    setIsRemoving(true);

    const wrapperEl = wrapperRef.current;
    const affectedSiblings: HTMLElement[] = [];

    if (wrapperEl) {
      const height = wrapperEl.scrollHeight;

      // wrapper collapse 준비
      wrapperEl.style.transition = `max-height ${ANIM_MS}ms ease, margin ${ANIM_MS}ms ease, padding ${ANIM_MS}ms ease`;
      wrapperEl.style.overflow = 'hidden';
      wrapperEl.style.maxHeight = `${height}px`;

      // 아래 형제들을 먼저 아래로 옮겨두고(시각적 준비) 이후 0으로 옮겨 자연스럽게 올라오게 함
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
    }

    // 서버 요청 병렬: 권한 오류면 복구, 네트워크 에러는 사용자 안내
    mutation.mutate(item.reviewId, {
      onSuccess: () => {},
      onError: (error: any) => {
        const status = error?.response?.status ?? error?.status;
        if (status === 401 || status === 403) {
          onCancelRemoving && onCancelRemoving(item.reviewId);
          setIsRemoving(false);
          onRestore && onRestore();
        } else {
          console.warn('deleteReview error', error);
        }
      },
    });

    if (removeTimeoutRef.current) {
      window.clearTimeout(removeTimeoutRef.current);
    }
    removeTimeoutRef.current = window.setTimeout(() => {
      onFinalizeRemove && onFinalizeRemove(item.reviewId);

      if (wrapperEl) {
        wrapperEl.style.overflow = '';
        wrapperEl.style.maxHeight = '';
        wrapperEl.style.transition = '';
        wrapperEl.style.marginBottom = '';
        wrapperEl.style.paddingTop = '';
        wrapperEl.style.paddingBottom = '';
      }
      for (const s of affectedSiblings) {
        s.style.transition = '';
        s.style.transform = '';
      }
    }, ANIM_MS);
  };

  useEffect(() => {
    return () => {
      if (removeTimeoutRef.current) {
        window.clearTimeout(removeTimeoutRef.current);
      }
    };
  }, []);

  const handleDeleteCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/edit-review/${item.reviewId}`);
  };

  return (
    <div ref={wrapperRef} css={[itemWrapper]}>
      <div
        css={[card, (isRemoving || isDeleting) && removingStyle]}
        onClick={() => onClick(item.shelterId)}
        style={{ cursor: 'pointer', position: 'relative' }}
      >
        <button css={deleteBtn} onClick={handleDeleteClick}>
          <FaTrash size={30} />
        </button>
        <div css={cardTitleRow}>
          <span css={cardTitle}>{item.shelterName ?? item.name ?? `쉼터 #${item.shelterId}`}</span>
        </div>
        <div css={cardBottomRow}>
          <div css={cardInfo}>
            <div css={cardRating}>
              <span css={ratingNumber}>
                {Number.isFinite(item.rating) ? item.rating.toFixed(1) : item.rating}
              </span>
              <span css={starsWrapper}>
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} css={i < item.rating ? filledStar : emptyStar}>
                    ★
                  </span>
                ))}
              </span>
            </div>
            <div css={cardContent}>{item.content}</div>
            {item.photoUrl && item.photoUrl.trim() !== '' && (
              <img
                src={item.photoUrl}
                alt="리뷰 이미지"
                css={cardImg}
                onError={handleImageError}
                onClick={(e) => {
                  e.stopPropagation();
                  setModalImg(item.photoUrl);
                }}
                style={{ cursor: 'pointer' }}
              />
            )}
          </div>
        </div>
        <div css={editMetaWrapper} onClick={(e) => e.stopPropagation()}>
          <div css={editDate}>작성일: {new Date(item.createdAt).toLocaleDateString()}</div>
          <div css={editBtnWrapper}>
            <button css={editBtn} onClick={handleEditClick}>
              수정
            </button>
          </div>
        </div>

        {showDeleteModal &&
          createPortal(
            <div css={modalOverlay} onClick={() => setShowDeleteModal(false)}>
              <div css={modalBox} onClick={(e) => e.stopPropagation()}>
                <div css={modalText}>
                  리뷰를
                  <br />
                  삭제하시겠습니까?
                </div>
                <div css={modalButtons}>
                  <button css={modalBtn} onClick={handleDeleteConfirm}>
                    예
                  </button>
                  <button css={modalBtn} onClick={handleDeleteCancel}>
                    아니요
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}

        {modalImg &&
          createPortal(
            <div css={modalOverlay} onClick={() => setModalImg(null)}>
              <div css={modalContent} onClick={(e) => e.stopPropagation()}>
                <img
                  src={modalImg}
                  alt="리뷰 이미지 확대"
                  css={modalImgStyle}
                  onError={handleImageError}
                />
                <button css={modalCloseBtn} onClick={() => setModalImg(null)}>
                  닫기
                </button>
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
    transform ${ANIM_MS}ms ease-in-out,
    opacity ${ANIM_MS}ms ease-in-out;
`;

const itemWrapper = css`
  overflow: hidden;
  margin-bottom: 12px;
`;

const card = css`
  background: #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px 0;
  -webkit-tap-highlight-color: transparent;
`;

const cardTitleRow = css`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px 8px 16px;
`;

const cardTitle = css`
  ${theme.typography.myr2};
  /* 한 줄로 표시하고 넘치면 ellipsis 처리 */
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  /* 플렉스 레이아웃에서 잘 동작하도록 */
  flex: 1 1 auto;
  min-width: 0;

  /* 휴지통 버튼(absolute)과 겹치지 않도록 우측 여유 확보 */
  padding-right: 48px;

  text-align: left;
  margin-top: 4px;
  margin-bottom: 8px;
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
  height: auto;
  margin-top: 8px;
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
`;

const ratingNumber = css`
  margin-right: 4px;
  ${theme.typography.myr3};
  color: ${theme.colors.text.red};
`;

const starsWrapper = css`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  ${theme.typography.myr3};
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

const cardContent = css`
  margin-top: 16px;
  ${theme.typography.myr3};
  padding-left: 4px;
  text-align: left;
  color: #3c3a3aff;
  margin-bottom: 8px;
`;

const deleteBtn = css`
  position: absolute;
  top: 8px;
  right: 4px;
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  z-index: 2;
  &:hover {
    color: #d76464;
  }
`;

const editBtnWrapper = css`
  display: flex;
  justify-content: flex-end;
  padding: 0 8px 8px 16px;
`;

const editBtn = css`
  background: ${theme.colors.button.blue};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  ${theme.typography.myr2};
  font-size: 1.6rem;
  cursor: pointer;

  /* 텍스트가 세로로 쪼개지는 현상 방지 */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  line-height: 1;
`;

const editMetaWrapper = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 16px 8px 16px;
`;

const editDate = css`
  margin-top: 4px;
  padding-left: 4px;
  font-size: 1.2rem;
  color: #7c7a7aff;
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

const modalContent = css`
  background: #fff;
  border-radius: 12px;
  padding: 24px 16px 16px 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 90vw;
  max-height: 80vh;
`;

const modalImgStyle = css`
  width: 90vw;
  border-radius: 8px;
  object-fit: contain;
  background: #fafafa;
`;

const modalCloseBtn = css`
  align-self: center;
  margin-top: 8px;
  background: #222;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 18px;
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;
`;

export default ReviewListCard;
