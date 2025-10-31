/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FaRegCommentDots } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import emptyReviewImg from '@/assets/images/empty-review2.jpg';
import theme from '@/styles/theme';
import { useEffect, useState, useRef } from 'react';
import { getMyReviews } from '@/api/reviewApi';
import ToastMessage from '@/components/ToastMessage';
import ReviewListCard from './components/ReviewListCard';

type MyReview = {
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
};

const MyReviewPage = () => {
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [extraBottom, setExtraBottom] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getMyReviews()
      .then((res) => {
        if (!mounted) return;
        const data = Array.isArray(res) ? res : res && (res as any).data ? (res as any).data : [];
        setReviews(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (!mounted) return;
        console.error('[MyReviewPage] getMyReviews error', e);
        // API 실패 시에도 빈 상태 UI를 보여주고, 토스트로 에러를 알림
        setError(e);
        setReviews([]); // 명시적으로 빈배열로 처리
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // containerRef와 스크롤 여부에 따라 safe-area-inset-bottom 값을 측정해서 margin 추가
  useEffect(() => {
    let mounted = true;
    const measure = () => {
      if (!mounted) return;
      const el = containerRef.current ?? document.documentElement;
      const isScrollable = el.scrollHeight > el.clientHeight + 1;
      if (!isScrollable) {
        setExtraBottom(0);
        return;
      }
      // 임시 엘리먼트로 CSS env(safe-area-inset-bottom) 측정
      const tmp = document.createElement('div');
      tmp.style.cssText =
        'position:absolute;left:-9999px;top:-9999px;padding-bottom:env(safe-area-inset-bottom);';
      document.body.appendChild(tmp);
      const pad = parseFloat(getComputedStyle(tmp).paddingBottom) || 0;
      document.body.removeChild(tmp);
      // pad가 0인 경우도 있으므로 최소값 보정 가능 (원하면 0 대신 고정값 추가)
      setExtraBottom(pad);
    };

    measure();
    const onWin = () => {
      // debounce via RAF
      requestAnimationFrame(() => measure());
    };
    window.addEventListener('resize', onWin);
    window.addEventListener('orientationchange', onWin);
    // 데이터 변경(찜 목록)으로 스크롤 상태가 바뀌면 재측정
    // (wishList 변경 이미 트리거되는 렌더에서 effect가 재실행되므로 추가 구독 불필요)

    return () => {
      mounted = false;
      window.removeEventListener('resize', onWin);
      window.removeEventListener('orientationchange', onWin);
    };
  }, [reviews.length]);

  const handleCardClick = (shelterId: number) => {
    navigate(`/shelter-detail/${shelterId}`);
  };

  if (loading) return <div>로딩 중...</div>;
  // 변경: error 발생해도 별도 에러 화면으로 리턴하지 않고 빈 상태 UI를 렌더하도록 함

  return (
    <>
      {reviews.length > 0 ? (
        // 내가 쓴 리뷰가 있을 때 컨테이너
        <div
          css={pageContainerStyle}
          ref={containerRef}
          style={extraBottom ? { marginBottom: `${extraBottom}px` } : undefined}
        >
          <div css={header}>
            <FaRegCommentDots color="#222" size={43} css={reviewIcon} />
            <span css={title}>내가 쓴 리뷰</span>
          </div>
          <div css={listBox}>
            {reviews.map((item) => (
              <ReviewListCard
                key={item.reviewId}
                item={item}
                onClick={handleCardClick}
                onToast={setToastMessage} // ToastMessage 콜백 전달
              />
            ))}
          </div>
        </div>
      ) : (
        // 내가 쓴 리뷰가 없을 때 컨테이너 (API 실패도 여기로 표시)
        <div
          css={emptyStateStyle}
          ref={containerRef}
          style={extraBottom ? { marginBottom: `${extraBottom}px` } : undefined}
        >
          <div css={emptyHeader}>
            <FaRegCommentDots color="#fff" size={43} css={reviewIcon} />
            <span css={emptyTitle}>내가 쓴 리뷰</span>
          </div>
          <div css={emptyBox}>
            <div css={emptyText}>
              {error ? '리뷰를 \n불러오지 못했습니다.' : '작성한 리뷰가 없습니다.'}
            </div>
            <img src={emptyReviewImg} alt="리뷰 없음" css={emptyImg} />
          </div>
        </div>
      )}
      {/*페이지 단 ToastMessage */}
      <ToastMessage message={toastMessage} />
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
  width: 180px;
  height: auto;
  object-fit: contain;
`;

const emptyText = css`
  padding-top: 20%;
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 2px 2px 6px #222;
  white-space: pre-line; /*'\n'을 줄바꿈으로 렌더 */
`;
