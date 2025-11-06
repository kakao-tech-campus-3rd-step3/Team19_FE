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
        if (!mounted) return;
        const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
        setWishList(items);
        setError(null); // 오류 메시지 제거 — 빈 목록 화면으로 보이도록
      })
      .catch((e) => {
        // 네트워크/권한 에러가 와도 빈 목록으로 처리
        if (mounted) {
          console.warn('[WishListPage] getWishList failed', e);
          setWishList([]);
          setError(null);
        }
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

  if (isLoading) return <div css={pageContainerStyle(false)}>로딩 중...</div>;

  const isEmpty = wishList.length === 0;

  return (
    <>
      <div css={pageContainerStyle(isEmpty)}>
        <div css={header}>
          <FaHeart color={isEmpty ? '#fff' : 'red'} size={43} css={heartIcon} />
          <span css={isEmpty ? emptyTitle : title}>찜 목록</span>
        </div>

        {/* 목록: 비어있을 때 fade-out */}
        <div css={[listBox, isEmpty && listHidden]}>
          {wishList.map((item: any) => (
            <WishListCard
              key={item.shelterId}
              item={item}
              onClick={handleCardClick}
              refetchWishList={() =>
                getWishList()
                  .then((d: any) => {
                    const items = Array.isArray(d?.items) ? d.items : Array.isArray(d) ? d : [];
                    setWishList(items);
                  })
                  .catch(() => {
                    /* optional */
                  })
              }
            />
          ))}
        </div>

        {/* 빈 상태: 목록 위에 겹쳐서 존재, isEmpty시 fade-in */}
        <div css={[emptyStateStyle, !isEmpty && emptyHidden]}>
          <div css={emptyHeader}>
            <FaHeart color="#ff0000ff" size={43} css={heartIcon} />
            <span css={emptyTitle}>찜 목록</span>
          </div>
          <div css={emptyBox}>
            <div css={emptyText}>
              {error ? '찜 목록을\n불러오지 못했습니다.' : '찜이 없습니다.'}
            </div>
            <img src={emptyWishImg} alt="찜 없음" css={emptyImg} />
          </div>
        </div>
      </div>
    </>
  );
};

export default WishListPage;

// 스타일
const pageContainerStyle = (isEmpty: boolean) => css`
  position: relative;
  margin: 0 auto;
  background: ${isEmpty ? '#000' : '#fff'};
  transition: background-color 360ms ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: calc(100% - ${theme.spacing.spacing16} - env(safe-area-inset-top));
  padding-top: calc(${theme.spacing.spacing16} + env(safe-area-inset-top));
  box-sizing: border-box;
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
  width: 95%;
  /* 목록 영역이 남은 높이를 차지하고 내부에서 스크롤 발생 */
  flex: 1 1 auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  /* 스크롤 시 하단 안전영역 확보 (스크롤 없으면 여백 없음) */
  padding-bottom: calc(env(safe-area-inset-bottom) + 4px);
  box-sizing: border-box;
  transition:
    opacity 360ms ease,
    transform 360ms ease;
  opacity: 1;
`;

const emptyStateStyle = css`
  position: absolute;
  inset: 0;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  padding-top: calc(${theme.spacing.spacing16} + env(safe-area-inset-top));
  height: 100vh;
  box-sizing: border-box;
  text-align: center;
  background: #000;
  transition:
    opacity 360ms ease,
    transform 360ms ease;
  opacity: 1;
  pointer-events: auto;
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

const listHidden = css`
  opacity: 0;
  pointer-events: none;
  transform: translateY(8px);
`;

const emptyHidden = css`
  opacity: 0;
  pointer-events: none;
  transform: translateY(8px);
`;
