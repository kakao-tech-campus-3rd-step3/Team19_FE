/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FaRegCommentDots } from 'react-icons/fa';
import { IoCloseCircleSharp } from 'react-icons/io5';
import { MdImage } from 'react-icons/md';
import theme from '@/styles/theme';
import ToastMessage from '../../components/ToastMessage';
import { useEditReview } from './hooks/useEditReview';

const EditReviewPage = () => {
  const {
    review,
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
    navigate,
    errorMessage,
    saving, // 훅에서 반환된 saving 사용
  } = useEditReview();

  if (!review) return <div>로딩 중...</div>;

  return (
    <div css={container}>
      <div css={header}>
        <FaRegCommentDots size={36} />
        <span css={headerTitle}>리뷰 수정</span>
      </div>
      <div css={shelterName} onClick={() => navigate(`/shelter-detail/${review.shelterId}`)}>
        {review.shelterName}
      </div>
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
              <img src={photoUrl ?? ''} alt="리뷰" css={reviewImg} />
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
        {/* 에러 메시지 표시 */}
        {errorMessage && <div css={errorMsgStyle}>{errorMessage}</div>}
        <button css={saveBtn} type="submit" disabled={saving}>
          {saving ? '저장 중...' : '저장'}
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

export default EditReviewPage;

// 스타일
const container = css`
  background: #ffffffff;
  padding: 0 0;
  font-family: 'Pretendard', sans-serif;
  height: calc(
    100vh - ${theme.spacing.spacing16} - env(safe-area-inset-bottom) - env(safe-area-inset-top)
  );
  padding-top: calc(${theme.spacing.spacing16} + env(safe-area-inset-top));
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const header = css`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 90%;
  padding-top: 5%;
  padding-bottom: 5%;
  box-sizing: border-box;
`;

const headerTitle = css`
  ${theme.typography.myr1};
  text-shadow: 2px 2px 6px #bbb;
`;

const shelterName = css`
  ${theme.typography.myr4};
  /* 한 줄로 자르고 말줄임 표시, 반응형 폰트 크기 적용 */
  display: block;
  width: 90%;
  margin: 8px auto 16px auto;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: center;
  font-weight: 700;
  /* 화면 크기에 따라 폰트가 커지도록 clamp의 preferred와 max 값을 조정 */
  font-size: clamp(1.5rem, 3vw + 1.25rem, 4rem);
`;

const starRow = css`
  display: flex;
  width: 90%;
  gap: 3%;
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
  width: 90%;
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

const modalTextStyle = css`
  ${theme.typography.modal1};
  color: #222;
  margin-bottom: 24px;
  text-align: center;
  white-space: pre-line; /* '\n'을 실제 줄바꿈으로 표시 */
`;

const modalBtnRow = css`
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

const errorMsgStyle = css`
  color: #d32f2f;
  font-size: 1.1rem;
  margin-bottom: 12px;
  text-align: center;
`;
