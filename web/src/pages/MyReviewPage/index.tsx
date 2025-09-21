/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FaRegCommentDots } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import emptyReviewImg from '@/assets/images/empty-review.png';
import theme from '@/styles/theme';
import ReviewListCard from './components/ReviewListCard';

// API 명세에 맞는 타입 정의
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

// 목데이터 (API 응답 형태와 동일)
const mockReviews: MyReview[] = [
  {
    reviewId: 101,
    shelterId: 1,
    name: '종로 무더위 쉼터',
    userId: 1,
    content: '에어컨도 잘 나오고 깨끗했어요',
    rating: 5,
    photoUrl: 'https://example.com/review1.jpg',
    profileImageUrl: 'https://example.com/users/1.jpg',
    createdAt: '2025-08-19T09:00:00Z',
    updatedAt: '2025-08-19T09:00:00Z',
  },
  {
    reviewId: 102,
    shelterId: 2,
    name: '강남 무더위 쉼터',
    userId: 1,
    content:
      '일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십',
    rating: 3,
    photoUrl: null,
    profileImageUrl: 'https://example.com/users/1.jpg',
    createdAt: '2025-08-18T14:00:00Z',
    updatedAt: '2025-08-18T14:00:00Z',
  },
];

const MyReviewPage = () => {
  const reviews = mockReviews; // TODO: 추후 API 연결 시 변경
  const navigate = useNavigate();

  const handleCardClick = (shelterId: number) => {
    navigate(`/shelter-detail/${shelterId}`);
  };

  return (
    <>
      {reviews.length > 0 ? (
        // 내가 쓴 리뷰가 있을 때 컨테이너
        <div css={pageContainerStyle}>
          <div css={header}>
            <FaRegCommentDots color="#222" size={43} css={reviewIcon} />
            <span css={title}>내가 쓴 리뷰</span>
          </div>
          <div css={listBox}>
            {reviews.map((item) => (
              <ReviewListCard key={item.reviewId} item={item} onClick={handleCardClick} />
            ))}
          </div>
        </div>
      ) : (
        // 내가 쓴 리뷰가 없을 때 컨테이너
        <div css={emptyStateStyle}>
          <div css={emptyHeader}>
            <FaRegCommentDots color="#fff" size={43} css={reviewIcon} /> {/* 변경: 리뷰 아이콘 */}
            <span css={emptyTitle}>내가 쓴 리뷰</span>
          </div>
          <div css={emptyBox}>
            <div css={emptyText}>작성한 리뷰가 없습니다.</div>
            <img src={emptyReviewImg} alt="리뷰 없음" css={emptyImg} />
          </div>
        </div>
      )}
    </>
  );
};

export default MyReviewPage;

// 스타일
const pageContainerStyle = css`
  position: relative;
  margin: 0 auto;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const header = css`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding-top: 24px;
  padding-bottom: 24px;
  padding-left: 16px;
  box-sizing: border-box;
`;

const reviewIcon = css`
  font-size: ${theme.typography.myr1};
  margin-top: 4px;
`;

const title = css`
  ${theme.typography.myr1};
  text-shadow: 2px 2px 6px #bbb;
  color: #222;
`;

const listBox = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 95%;
`;

const emptyStateStyle = css`
  position: fixed;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  text-align: center;
  background: #000;
  overflow: hidden;
`;

const emptyHeader = css`
  display: flex;
  gap: 8px;
  width: 100%;
  padding-top: 24px;
  padding-bottom: 24px;
  padding-left: 16px;
  box-sizing: border-box;
`;

const emptyTitle = css`
  ${theme.typography.myr1};
  color: #fff;
  text-shadow: 2px 2px 6px #222;
`;

const emptyBox = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  width: 100%;
`;

const emptyImg = css`
  width: 140px;
  height: auto;
  object-fit: contain;
`;

const emptyText = css`
  padding-top: 20%;
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 2px 2px 6px #222;
`;
