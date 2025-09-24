/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaRegCommentDots } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { MdImage } from 'react-icons/md';
import theme from '@/styles/theme';

const mockReview = {
  reviewId: 101,
  shelterId: 1,
  name: '다솔(아)경로당',
  userId: 1,
  content: '에어컨이 참. 시원.하네요~^^',
  rating: 4,
  photoUrl: 'https://example.com/review1.jpg',
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

  // 리뷰 단건 조회 (목데이터)
  useEffect(() => {
    // 실제 API 연동 시 fetch(`/api/reviews/${reviewId}`) 사용
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

  // 이미지 삭제
  const handleRemoveImage = () => {
    setShowImage(false);
    setPhotoUrl('');
  };

  // 저장 버튼 클릭
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // PATCH /api/reviews/{reviewId}로 수정 요청
    alert('리뷰가 수정되었습니다!');
  };

  if (!review) return <div>로딩 중...</div>;

  return (
    <div css={container}>
      <div css={header}>
        <FaRegCommentDots size={36} />
        <span css={headerTitle}>리뷰 수정</span>
      </div>
      <div css={shelterName}>{review.name}</div>
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
      <div css={formBox} onSubmit={handleSave}>
        <textarea
          css={contentBox}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
        />
        <div css={imgRow}>
          {showImage && photoUrl && (
            <div css={imgWrapper}>
              <img src={photoUrl} alt="리뷰" css={reviewImg} />
              <button type="button" css={imgRemoveBtn} onClick={handleRemoveImage}>
                <IoMdClose size={24} />
              </button>
            </div>
          )}
          <label css={imgAddBtn}>
            <MdImage size={48} />
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              // TODO: 내파일 접근 가능한지 확인 후 이미지 업로드 처리
            />
          </label>
        </div>
        <button css={saveBtn} type="submit">
          저&nbsp;장
        </button>
      </div>
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
  overflow: hidden;
`;

const header = css`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding-top: 24px;
  padding-bottom: 24px;
  box-sizing: border-box;
`;

const headerTitle = css`
  ${theme.typography.myr1};
  text-shadow: 2px 2px 6px #bbb;
`;

const shelterName = css`
  ${theme.typography.myr4};
  margin-bottom: 18px;
`;

const starRow = css`
  display: flex;
  gap: 12px;
  font-size: 3.5rem;
  margin-bottom: 18px;
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
  gap: 24px;
`;

const contentBox = css`
  width: 90%;
  ${theme.typography.myr5};
  height: 40%;
  border-radius: 18px;
  border: none;
  background: #ddddddb9;
  padding: 18px 24px;
  resize: none;
  font-family: inherit;
`;

const imgRow = css`
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 32px;
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
  position: absolute;
  top: -10px;
  right: -10px;
  background: #eee;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
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
  background: #111;
  color: #fff;
  border: none;
  border-radius: 12px;
  ${theme.typography.my1};

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
