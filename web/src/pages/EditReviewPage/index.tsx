/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaRegCommentDots } from 'react-icons/fa';
import { IoCloseCircleSharp } from 'react-icons/io5';
import { MdImage } from 'react-icons/md';
import theme from '@/styles/theme';
import ToastMessage from '../FindSheltersPage/components/ToastMessage'; // 경로에 맞게 import

const mockReview = {
  reviewId: 101,
  shelterId: 1,
  name: '다솔(아)경로당',
  userId: 1,
  content: '에어컨이 참. 시원.하네요~^^',
  rating: 4,
  photoUrl: 'https://plus.cnu.ac.kr/images/kr/sub01/ci_simbol_v2.png',
  profileImageUrl: 'https://example.com/users/1.jpg',
  createdAt: '2025-08-19T09:00:00Z',
  updatedAt: '2025-08-19T09:00:00Z',
};

const EditReviewPage = () => {
  const { id } = useParams();
  const [review, setReview] = useState<typeof mockReview | null>(null);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [photoUrl, setPhotoUrl] = useState('');
  const [showImage, setShowImage] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState('');
  const [onModalConfirm, setOnModalConfirm] = useState<() => void>(() => () => {});
  const [onModalCancel, setOnModalCancel] = useState<() => void>(() => () => {});
  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate();

  // 리뷰 단건 조회 (목데이터)
  useEffect(() => {
    // TODO: 실제 API 연동 시 fetch(`/api/reviews/${id}`)로 변경
    setReview(mockReview);
    setContent(mockReview.content);
    setRating(mockReview.rating);
    setPhotoUrl(mockReview.photoUrl || '');
    setShowImage(!!mockReview.photoUrl);
  }, [id]);

  // 별점 클릭 핸들러
  const handleStarClick = (idx: number) => {
    setRating(idx + 1);
  };

  // 저장 버튼 클릭
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setModalText('저장 하시겠습니까?');
    setOnModalConfirm(() => handleSaveConfirm);
    setOnModalCancel(() => () => setShowModal(false));
    setShowModal(true);
  };

  // 저장 모달에서 "예" 클릭 시
  const handleSaveConfirm = async () => {
    setShowModal(false);

    // TODO: 실제 API 연동 시 아래 fetch 코드 사용
    /*
    await fetch(`/api/reviews/${review?.reviewId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`, // JWT 토큰 필요시
      },
      body: JSON.stringify({
        content,
        // rating,
        // photoUrl,
      }),
    });
    */

    // 목데이터로 동작: 리뷰 상태를 임시로 업데이트
    setReview((prev) =>
      prev
        ? {
            ...prev,
            content,
            // rating,
            // photoUrl,
            updatedAt: new Date().toISOString(),
          }
        : prev,
    );

    // 저장 후 내가 쓴 리뷰 목록 페이지로 이동
    navigate('/myreviews');
  };

  // 사진 삭제 버튼 클릭
  const handleRemoveImage = () => {
    setModalText('사진을 삭제하시겠습니까?');
    setOnModalConfirm(() => () => {
      setShowImage(false);
      setPhotoUrl('');
      setShowModal(false);
    });
    setOnModalCancel(() => () => setShowModal(false));
    setShowModal(true);
  };

  // 이미지 추가 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (showImage && photoUrl) {
      setToastMessage('사진 첨부는 최대 1장만 가능합니다');
      setTimeout(() => setToastMessage(''), 2000);
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
      setShowImage(true);
    }
  };

  const handleAddImageClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    if (showImage && photoUrl) {
      e.preventDefault(); // 파일 선택창이 뜨지 않도록 막음
      setToastMessage('사진 첨부는 최대 1장만 가능합니다');
      setTimeout(() => setToastMessage(''), 2000);
    }
  };

  if (!review) return <div>로딩 중...</div>;

  return (
    <div css={container}>
      <div css={header}>
        <FaRegCommentDots size={36} />
        <span css={headerTitle}>리뷰 수정</span>
      </div>
      <div css={shelterName} onClick={() => navigate(`/shelter-detail/${review.shelterId}`)}>
        {review.name}
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
      {/* 저장 확인 모달 */}
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

const shelterName = css`
  ${theme.typography.myr4};
  margin-bottom: 4%;
  margin-top: 3%;
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
`;

const emptyStar = css`
  color: #ccc;
  cursor: pointer;
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
`;

const reviewImg = css`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
`;

const imgRemoveBtn = css`
  font-size: 2rem;
  color: #222;
  cursor: pointer;
  position: absolute;
  top: -12px;
  right: -12px;
  z-index: 2;
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
  /* 버튼 반응 없애기 */
  outline: none;
  box-shadow: none;
  -webkit-tap-highlight-color: transparent;
  &:focus,
  &:active,
  &:focus-visible {
    outline: none;
    box-shadow: none;
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
