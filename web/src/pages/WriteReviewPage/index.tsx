/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FaRegCommentDots } from 'react-icons/fa';
import { IoCloseCircleSharp } from 'react-icons/io5';
import { MdImage } from 'react-icons/md';
import theme from '@/styles/theme';
import ToastMessage from '../FindSheltersPage/components/ToastMessage';
import { useWriteReview } from './hooks/useWriteReview';
import { useLocation } from 'react-router-dom';
// import { useParams } from 'react-router-dom';
//TODO: 저장 후 이동할 때도 /shelter-detail/${shelterId} 등으로 활용할 수 있기 때문에 남겨둠 (필요시 삭제)

const WriteReviewPage = () => {
  const location = useLocation();
  // const { shelterId } = useParams();
  // TODO: 저장 후 이동할 때도 /shelter-detail/${shelterId} 등으로 활용할 수 있기 때문에 남겨둠 (필요시 삭제)
  // URL 파라미터로 shelterId 받기
  const shelterName = location.state?.shelterName;
  const {
    content,
    setContent,
    rating,
    photoUrl,
    showImage,
    showModal,
    modalText,
    onModalConfirm,
    onModalCancel,
    toastMessage,
    handleStarClick,
    handleSave,
    handleRemoveImage,
    handleImageChange,
    handleAddImageClick,
  } = useWriteReview();

  return (
    <div css={container}>
      <div css={header}>
        <FaRegCommentDots size={36} />
        <span css={headerTitle}>리뷰 작성</span>
      </div>
      {/* 쉼터 이름 표시 */}
      {shelterName && <div css={shelterNameStyle}>{shelterName}</div>}
      <div css={starRow}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            css={i < rating ? filledStar : emptyStar}
            onClick={() => handleStarClick(i)}
          >
            ★
          </span>
        ))}
      </div>
      <form css={formBox} onSubmit={handleSave}>
        <textarea
          css={contentBox}
          value={content}
          maxLength={100}
          onChange={(e) => {
            if (e.target.value.length <= 100) setContent(e.target.value);
          }}
          rows={4}
        />
        <div css={charCount}>{content.length}/100</div>
        <div css={imgRow}>
          {showImage && photoUrl && (
            <div css={imgWrapper}>
              <img src={photoUrl} alt="리뷰" css={reviewImg} />
              <IoCloseCircleSharp css={imgRemoveBtn} onClick={handleRemoveImage} />
            </div>
          )}
          <label css={imgAddBtn} onClick={handleAddImageClick}>
            <MdImage size={48} />
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
          </label>
        </div>
        <button css={saveBtn} type="submit">
          저&nbsp;장
        </button>
      </form>
      {/* 저장/삭제 모달 */}
      {showModal && (
        <div css={modalOverlay}>
          <div css={modalBox}>
            <div css={modalTextStyle}>{modalText}</div>
            <div css={modalBtnRow}>
              <button css={modalBtn} type="button" onClick={onModalConfirm}>
                예
              </button>
              <button css={modalBtn} type="button" onClick={onModalCancel}>
                아니요
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastMessage message={toastMessage} />
    </div>
  );
};

export default WriteReviewPage;

// 스타일
const container = css`
  background: #ffffffff;
  padding: 0 24px;
  font-family: 'Pretendard', sans-serif;
  height: calc(100vh - ${theme.spacing.spacing16});
  display: flex;
  flex-direction: column;
`;

const header = css`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding-top: 5%;
  padding-bottom: 5%;
  box-sizing: border-box;
`;

const headerTitle = css`
  ${theme.typography.myr1};
  text-shadow: 2px 2px 6px #bbb;
`;

const shelterNameStyle = css`
  ${theme.typography.myr4};
  text-align: center;
  margin-bottom: 16px;
  margin-top: 8px;
  font-weight: 700;
`;

const starRow = css`
  display: flex;
  gap: 12px;
  font-size: 3.5rem;
  margin-bottom: 2%;
  justify-content: center;
`;

const filledStar = css`
  color: #ffd600;
  cursor: pointer;
  text-shadow: 1px 1px 3px #bbb;
  user-select: none;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  &:focus,
  &:active,
  &:focus-visible {
    outline: none;
    color: #ffd600;
    background: none;
    box-shadow: none;
  }
`;

const emptyStar = css`
  color: #ccc;
  cursor: pointer;
  user-select: none;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  &:focus,
  &:active,
  &:focus-visible {
    outline: none;
    color: #ccc;
    background: none;
    box-shadow: none;
  }
`;

const formBox = css`
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: center;
`;

const contentBox = css`
  width: 90%;
  ${theme.typography.myr5};
  height: 30%;
  border-radius: 18px;
  border: none;
  background: #ddddddb9;
  padding: 3% 4%;
  resize: none;
  font-family: inherit;
`;

const charCount = css`
  width: 90%;
  text-align: right;
  font-size: 1.1rem;
  color: #888;
  margin-bottom: 8px;
  position: relative;
  right: 0;
`;

const imgRow = css`
  width: 95%;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: auto;
  position: relative;
`;

const imgWrapper = css`
  position: relative;
  width: 80px;
  height: 80px;
  user-select: none; // 클릭/드래그 반응 제거
`;

const reviewImg = css`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  user-select: none; // 이미지 드래그/선택 방지
  -webkit-user-drag: none;
  -webkit-tap-highlight-color: transparent; // 모바일 클릭 반응 제거
`;

const imgRemoveBtn = css`
  font-size: 2rem;
  color: #222;
  cursor: pointer;
  position: absolute;
  top: -12px;
  right: -12px;
  z-index: 2;
  background: none;
  border: none;
  outline: none;
  box-shadow: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  &:focus,
  &:active,
  &:focus-visible {
    outline: none;
    box-shadow: none;
    background: none;
  }
`;

const imgAddBtn = css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 12px;
  border: 2px solid #222;
  background: #fff;
  cursor: pointer;
  font-size: 2.5rem;
  user-select: none;
  outline: none;
  box-shadow: none;
  -webkit-tap-highlight-color: transparent;
  &:focus,
  &:active,
  &:focus-visible {
    outline: none;
    box-shadow: none;
    background: #fff;
  }
`;

const saveBtn = css`
  width: 100%;
  margin: auto auto 5% auto;
  bottom: 3%;
  background: #111;
  color: #fff;
  border: none;
  border-radius: 12px;
  ${theme.typography.myr1};
  cursor: pointer;
  outline: none;
  box-shadow: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  &:focus,
  &:active,
  &:focus-visible {
    outline: none;
    box-shadow: none;
    background: #111;
  }
`;

const modalOverlay = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const modalBox = css`
  background: #fff;
  border-radius: 18px;
  padding: 38px 32px;
  box-shadow: 0 2px 12px #2224;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const modalTextStyle = css`
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 24px;
`;

const modalBtnRow = css`
  display: flex;
  gap: 24px;
`;

const modalBtn = css`
  padding: 10px 38px;
  border-radius: 8px;
  border: none;
  background: #222;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
`;
