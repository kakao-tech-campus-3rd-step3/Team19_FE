/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import NoImage from '@/assets/images/NoImage.png';
import theme from '@/styles/theme';

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

interface ReviewListCardProps {
  item: MyReview;
  onClick: (shelterId: number) => void;
}

const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.src = NoImage;
};

const ReviewListCard = ({ item, onClick }: ReviewListCardProps) => {
  return (
    <div css={card} onClick={() => onClick(item.shelterId)} style={{ cursor: 'pointer' }}>
      <div css={cardTitleRow}>
        <span css={cardTitle}>{item.name}</span>
      </div>
      <div css={cardBottomRow}>
        <img
          src={item.photoUrl ? item.photoUrl : NoImage}
          alt="리뷰 이미지"
          css={cardImg}
          onError={handleImageError}
        />
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
        </div>
      </div>
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
  height: auto;
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
  ${theme.typography.myr3};
  color: ${theme.colors.text.gray500};
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
  margin-top: 8px;
  ${theme.typography.myr3};
  text-align: left;
  color: #3c3a3aff;
`;

const cardDate = css`
  margin-top: 4px;
  font-size: 0.95rem;
  color: #888;
`;

export default ReviewListCard;
