/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FaHeart } from 'react-icons/fa';
import NoImage from '@/assets/images/NoImage.png';
import emptyWishImg from '@/assets/images/empty-wish.png';
import theme from '@/styles/theme';

// API 명세에 맞는 타입 정의
interface WishShelter {
  shelterId: number;
  name: string;
  address: string;
  operatingHours: string;
  averageRating: number;
  photoUrl: string;
  distance: string;
}

// 목데이터 (API 응답 형태와 동일)
const mockWishList: WishShelter[] = [
  // 데이터가 없을 경우 테스트를 위해 빈 배열로 두세요.
];

const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.src = NoImage;
};

const WishListPage = () => {
  const wishList = mockWishList; // TODO: 추후 API 연결 시 변경

  return (
    <>
      {wishList.length > 0 ? (
        // 찜 목록이 있을 때 컨테이너
        <div css={pageContainerStyle}>
          <div css={header}>
            <FaHeart color="red" size={43} css={heartIcon} />
            <span css={title}>찜 목록</span>
          </div>
          <div css={listBox}>
            {wishList.map((item) => (
              <div key={item.shelterId} css={card}>
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
                          <span
                            key={i}
                            css={i < Math.round(item.averageRating) ? filledStar : emptyStar}
                          >
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
            ))}
          </div>
        </div>
      ) : (
        // 찜 목록이 없을 때 컨테이너
        <div css={emptyStateStyle}>
          <div css={emptyHeader}>
            <FaHeart color="red" size={43} css={heartIcon} />
            <span css={emptyTitle}>찜 목록</span>
          </div>
          <div css={emptyBox}>
            <div css={emptyText}>찜이 없습니다.</div>
            <img src={emptyWishImg} alt="찜 없음" css={emptyImg} />
          </div>
        </div>
      )}
    </>
  );
};

export default WishListPage;

// 스타일
const pageContainerStyle = css`
  position: relative;
  min-height: 100vh;
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

const heartIcon = css`
  font-size: ${theme.typography.wish1};
`;

const title = css`
  ${theme.typography.wish1};
  text-shadow: 2px 2px 6px #bbb;
  color: #222;
`;

const listBox = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 95%;
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
  ${theme.typography.wish1};
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
  width: 160px;
  height: auto;
  object-fit: contain;
`;

const emptyText = css`
  padding-top: 20%;
  font-size: 2.2rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 2px 2px 6px #222;
`;
