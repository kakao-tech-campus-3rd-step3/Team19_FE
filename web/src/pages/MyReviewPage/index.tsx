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

  // 마지막으로 제거된 항목 보관(ref) — 복구용
  const lastRemovedRef = useRef<{ item: MyReview; index: number } | null>(null);

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

  const handleCardClick = (shelterId: number) => {
    navigate(`/shelter-detail/${shelterId}`);
  };

  // 부모: 낙관적 제거 (리스트에서 즉시 삭제)
  const handleRemoveOptimistic = (reviewId: number) => {
    setReviews((prev) => {
      const idx = prev.findIndex((r) => r.reviewId === reviewId);
      if (idx === -1) return prev;
      const removed = prev[idx];
      lastRemovedRef.current = { item: removed, index: idx };
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  };

  // 부모: 실패 시 복구
  const handleRestore = () => {
    const rec = lastRemovedRef.current;
    if (!rec) return;
    setReviews((prev) => {
      const arr = [...prev];
      arr.splice(rec.index, 0, rec.item);
      return arr;
    });
    lastRemovedRef.current = null;
  };

  if (loading) return <div>로딩 중...</div>;
  // 변경: error 발생해도 별도 에러 화면으로 리턴하지 않고 빈 상태 UI를 렌더하도록 함

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
              <ReviewListCard
                key={item.reviewId}
                item={item}
                onClick={handleCardClick}
                onToast={setToastMessage} // ToastMessage 콜백 전달
                onRemoveOptimistic={handleRemoveOptimistic}
                onRestore={handleRestore}
              />
            ))}
          </div>
        </div>
      ) : (
        // 내가 쓴 리뷰가 없을 때 컨테이너 (API 실패도 여기로 표시)
        <div css={emptyStateStyle}>
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
  /* 목록 영역이 남은 높이를 차지하고 내부에서 스크롤 발생 */
  flex: 1 1 auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  /* 스크롤 시 하단 안전영역 확보 (스크롤 없으면 여백 없음) */
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: border-box;
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
