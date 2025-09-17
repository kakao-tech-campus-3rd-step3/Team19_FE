/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FaHeart } from 'react-icons/fa';
import NoImage from '@/assets/images/NoImage.png';
import theme from '@/styles/theme';

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
}

const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.src = NoImage;
};

const WishListCard = ({ item, onClick }: WishListCardProps) => (
  <div css={card} onClick={() => onClick(item.shelterId)} style={{ cursor: 'pointer' }}>
    <div css={cardTitleRow}>
      <span css={cardTitle}>{item.name}</span>
      <FaHeart color="red" size={30} css={cardHeart} />
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
          별점: <span css={ratingNumber}>{item.averageRating}</span>
          <span css={starsWrapper}>
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} css={i < Math.round(item.averageRating) ? filledStar : emptyStar}>
                ★
              </span>
            ))}
          </span>
        </div>
        <div css={cardinfostyle}>
          거리: {item.distance}
          <br />
          운영시간: {item.operatingHours}
          <br />
          주소: {item.address}
        </div>
      </div>
    </div>
  </div>
);

const card = css`
  background: #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px 0;
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

export default WishListCard;
