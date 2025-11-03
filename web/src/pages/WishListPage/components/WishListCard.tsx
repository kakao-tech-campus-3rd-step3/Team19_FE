/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FaHeart } from 'react-icons/fa';
import NoImage from '@/assets/images/NoImage.png';
import theme from '@/styles/theme';
import { formatOperatingHours } from '@/utils/date';
import { useState, useEffect, useRef } from 'react';
import ToastMessage from '@/components/ToastMessage';
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
  onClick: (shelterId: number) => void;
  refetchWishList: () => void;
}

const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.src = NoImage;
};

const WishListCard = ({ item, onClick, refetchWishList }: WishListCardProps) => {
  const [isFavorite, setIsFavorite] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const bodyLockRef = useRef(0);

  // 모달 오픈 시 body 스크롤 잠금 (멀티 모달 카운터)
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

  // 찜 삭제 mutation
  const deleteWishMutation = useMutation({
    mutationFn: () => deleteWish({ shelterId: item.shelterId }),
    onSuccess: () => {
      setIsFavorite(false);
      setToastMessage('찜 목록에서\n삭제되었습니다');
      refetchWishList();
    },
    onError: () => {
      setToastMessage('삭제에 실패했습니다');
    },
  });

  // 찜 추가 mutation
  const addWishMutation = useMutation({
    mutationFn: () => addWish({ shelterId: item.shelterId }),
    onSuccess: () => {
      setIsFavorite(true);
      setToastMessage('찜 목록에\n추가되었습니다');
      refetchWishList();
    },
    onError: () => {
      setToastMessage('추가에 실패했습니다');
    },
  });

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite) {
      setShowModal(true);
    } else {
      addWishMutation.mutate();
    }
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteWishMutation.mutate();
    setShowModal(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(false);
  };

  // 별점: 소수 둘째자리에서 반올림하여 소수 첫째자리까지 표시
  const displayRating = (() => {
    const v = Number(item.averageRating) || 0;
    return (Math.round(v * 10) / 10).toFixed(1);
  })();
  const starCount = Math.round(Number(item.averageRating) || 0);

  return (
    <div css={card} onClick={() => onClick(item.shelterId)} style={{ cursor: 'pointer' }}>
      <div css={cardTitleRow}>
        <span css={cardTitle}>{item.name}</span>
        <span onClick={handleHeartClick} style={{ cursor: 'pointer' }}>
          {isFavorite ? (
            <FaHeart color="red" size={30} css={cardHeart} />
          ) : (
            <FaHeart color="#bbb" size={30} css={cardHeart} />
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
          <div css={cardinfostyle}>
            거리: {item.distance}
            <br />
            운영시간: {formatOperatingHours(item.operatingHours)}
            <br />
            주소: {item.address}
          </div>
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
              <div css={modalText}>찜 목록에서 삭제하시겠습니까?</div>
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

      <ToastMessage message={toastMessage} />
    </div>
  );
};

const card = css`
  background: #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px 0;
  -webkit-tap-highlight-color: transparent; // 모바일 클릭 반응 제거
`;

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
  /* 한 줄로 자르고 ... 표시 */
  display: block;
  flex: 1 1 auto;
  min-width: 0; /* flex 항목에서 줄임표가 동작하도록 */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const cardHeart = css`
  font-size: ${theme.typography.wish1};
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
  height: 30%;
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
  gap: 3px;
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const modalBox = css`
  background: #fff;
  border-radius: 12px;
  padding: 32px 24px;
  box-shadow: 0 2px 12px #2224;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const modalText = css`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 24px;
`;

const modalButtons = css`
  display: flex;
  gap: 16px;
`;

const modalBtn = css`
  padding: 8px 24px;
  border-radius: 8px;
  border: none;
  background: #d76464;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  &:last-of-type {
    background: #bbb;
    color: #222;
  }
`;

export default WishListCard;
