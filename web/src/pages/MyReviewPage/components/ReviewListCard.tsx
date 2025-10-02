/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import NoImage from '@/assets/images/NoImage.png';
import theme from '@/styles/theme';
import { FaTrash } from 'react-icons/fa';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface MyReview {
  reviewId: number;
  shelterId: number;
  name: string;
  userId: number;
  content: string;
  rating: number;
  photoUrl: string | null;
  profileImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

// ✅ 부모로 전달할 콜백 추가
interface ReviewListCardProps {
  item: MyReview;
  onClick: (shelterId: number) => void;
  onToast: (msg: string) => void; // ✅ 부모로 전달할 콜백
}

// 이미지 url이 유효하지 않을 경우 대체 이미지를 보여주는 함수
const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.src = NoImage;
};

const ReviewListCard = ({ item, onClick, onToast }: ReviewListCardProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalImg, setModalImg] = useState<string | null>(null); // 추가: 확대 이미지 상태
  const navigate = useNavigate();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  // 찜 삭제와 동일한 패턴으로 리뷰 삭제
  const handleDeleteConfirm = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(false);
    try {
      const res = await fetch(`/api/reviews/${item.reviewId}`, {
        method: 'DELETE',
      });
      if (res.status === 204) {
        onToast('리뷰가 삭제되었습니다'); // 부모로 전달
        //TODO: 리뷰 삭제 후 목록 표시 수정 필요
      } else {
        onToast('삭제에 실패했습니다');
      }
    } catch {
      onToast('삭제에 실패했습니다');
    }
  };

  const handleDeleteCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(false);
  };

  // 수정 버튼 클릭 시 리뷰 수정 페이지로 이동
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/edit-review/${item.reviewId}`);
  };

  return (
    <div
      css={card}
      onClick={() => onClick(item.shelterId)}
      style={{ cursor: 'pointer', position: 'relative' }}
    >
      {/* 휴지통 버튼 */}
      <button css={deleteBtn} onClick={handleDeleteClick}>
        <FaTrash size={25} />
      </button>
      <div css={cardTitleRow}>
        <span css={cardTitle}>{item.name}</span>
      </div>
      <div css={cardBottomRow}>
        <div css={cardInfo}>
          <div css={cardRating}>
            <span css={ratingNumber}>{item.rating}</span>
            <span css={starsWrapper}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} css={i < item.rating ? filledStar : emptyStar}>
                  ★
                </span>
              ))}
            </span>
          </div>
          <div css={cardContent}>{item.content}</div>
          <div css={cardDate}>작성일: {new Date(item.createdAt).toLocaleDateString()}</div>
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
      {/* 수정 버튼 */}
      <div css={editBtnWrapper}>
        <button css={editBtn} onClick={handleEditClick}>
          수정
        </button>
      </div>
      {/* 삭제 모달 */}
      {showDeleteModal && (
        <div css={modalOverlay} onClick={(e) => e.stopPropagation()}>
          <div css={modalBox}>
            <div css={modalText}>리뷰를 삭제하시겠습니까?</div>
            <div css={modalButtons}>
              <button css={modalBtn} onClick={handleDeleteConfirm}>
                예
              </button>
              <button css={modalBtn} onClick={handleDeleteCancel}>
                아니요
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 이미지 확대 모달 */}
      {modalImg && (
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
        </div>
      )}
      {/* ToastMessage는 부모에서 관리 */}
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
  -webkit-tap-highlight-color: transparent;
`;

const cardTitleRow = css`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px 8px 16px;
`;

const cardTitle = css`
  ${theme.typography.myr2};
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
  gap: 3px;
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
  color: #f2d321ff;
  ${theme.typography.myr3};
`;

const emptyStar = css`
  color: #9d9c9cff;
  ${theme.typography.myr3};
`;

const cardContent = css`
  margin-top: 16px;
  ${theme.typography.myr3};
  padding-left: 4px;
  text-align: left;
  color: #3c3a3aff;
`;

const cardDate = css`
  margin-top: 4px;
  padding-left: 4px;
  font-size: 1rem;
  color: #888;
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
  padding: 0 16px 8px 16px;
`;

const editBtn = css`
  background: ${theme.colors.button.blue};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 4px 12px;
  ${theme.typography.myr2};
  cursor: pointer;
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

// (ShelterDetailPage와 통일)
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
`;

export default ReviewListCard;
