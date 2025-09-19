/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import emptyWishImg from '@/assets/images/empty-wish.png';
import theme from '@/styles/theme';
import WishListCard from './components/WishListCard';

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
  {
    shelterId: 1,
    name: '종로 무더위 쉼터',
    address: '서울 종로구 세종대로 175',
    operatingHours: '09:00~18:00',
    averageRating: 4.5,
    photoUrl: 'https://example.com/shelter1.jpg',
    distance: '250m',
  },
  {
    shelterId: 2,
    name: '강남 무더위 쉼터',
    address: '서울 강남구 테헤란로 123',
    operatingHours: '09:00~18:00',
    averageRating: 4.2,
    photoUrl: '',
    distance: '1.2km',
  },
];

const WishListPage = () => {
  const wishList = mockWishList; // TODO: 추후 API 연결 시 변경
  const navigate = useNavigate();

  const handleCardClick = (shelterId: number) => {
    navigate(`/shelter-detail/${shelterId}`);
  };

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
              <WishListCard key={item.shelterId} item={item} onClick={handleCardClick} />
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
