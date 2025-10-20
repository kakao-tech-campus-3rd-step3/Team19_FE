/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getWishList } from '@/api/wishApi';
import emptyWishImg from '@/assets/images/empty-wish2.jpg';
import theme from '@/styles/theme';
import WishListCard from './components/WishListCard';

const WishListPage = () => {
  // userId는 서버에서 me로 처리되므로 불필요

  const [wishList, setWishList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    getWishList()
      .then((data: any) => {
        if (mounted) setWishList(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (mounted) setError(e);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const navigate = useNavigate();

  const handleCardClick = (shelterId: number) => {
    navigate(`/shelter-detail/${shelterId}`);
  };

  if (isLoading) return <div css={pageContainerStyle}>로딩 중...</div>;
  // error는 빈 상태 UI로 처리: 아래 렌더에서 error 여부에 따라 메시지 표시

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
            {wishList.map((item: any) => (
              <WishListCard
                key={item.shelterId}
                item={item}
                onClick={handleCardClick}
                refetchWishList={() =>
                  getWishList()
                    .then((d: any) => setWishList(Array.isArray(d) ? d : []))
                    .catch(() => {
                      /* optional: set error state if needed */
                    })
                }
              />
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
            <div css={emptyText}>
              {error ? '찜 목록을\n불러오지 못했습니다.' : '찜이 없습니다.'}
            </div>
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
  height: calc(
    100vh - ${theme.spacing.spacing16} - env(safe-area-inset-bottom) - env(safe-area-inset-top)
  );
  padding-top: calc(${theme.spacing.spacing16} + env(safe-area-inset-top));
`;

const header = css`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin-top: 16px;
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
  height: calc(
    100vh - ${theme.spacing.spacing16} - env(safe-area-inset-bottom) - env(safe-area-inset-top)
  );
  padding-top: calc(${theme.spacing.spacing16} + env(safe-area-inset-top));
  text-align: center;
  background: #000;
  overflow: hidden;
`;

const emptyHeader = css`
  display: flex;
  gap: 8px;
  width: 100%;
  margin-top: 16px;
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
  white-space: pre-line; /* '\n'을 줄바꿈으로 렌더 */
`;
