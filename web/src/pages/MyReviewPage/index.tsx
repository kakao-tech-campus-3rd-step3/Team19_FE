/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FaRegCommentDots } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import emptyReviewImg from '@/assets/images/empty-review2.jpg';
import theme from '@/styles/theme';
import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  const [reviews, setReviews] = useState<MyReview[] | null>(null);
  const [error, setError] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate();

  // 마지막으로 제거된 항목 보관(ref) — 복구용
  const lastRemovedRef = useRef<{ item: MyReview; index: number } | null>(null);

  // 삭제 애니메이션 중인 아이디 집합 (부모가 관리)
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  // React Query로 서버 데이터 조회
  const { data, isError } = useQuery<MyReview[], Error>({
    queryKey: ['myReviews'],
    queryFn: () => getMyReviews(),
    staleTime: 120_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  useEffect(() => {
    if (typeof data === 'undefined') return;
    const arr = Array.isArray(data) ? data : data && (data as any).data ? (data as any).data : [];
    setReviews(arr);
  }, [data]);

  useEffect(() => {
    if (isError && reviews === null) {
      // 서버 에러로 확인이 끝났을 때 빈 배열로 처리
      setError(new Error('리뷰 조회 실패'));
      setReviews([]);
    }
  }, [isError, reviews]);

  const handleCardClick = (shelterId: number) => {
    navigate(`/shelter-detail/${shelterId}`);
  };

  // 부모: 애니메이션 시작 플래그 설정
  const handleStartRemoving = (reviewId: number) => {
    setDeletingIds((prev) => new Set(prev).add(reviewId));
  };

  // 부모: 애니메이션 취소(서버에서 실패 등)
  const handleCancelRemoving = (reviewId: number) => {
    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.delete(reviewId);
      return next;
    });
  };

  // 부모: 애니메이션 종료 후 실제로 리스트에서 제거
  const handleFinalizeRemove = (reviewId: number) => {
    setReviews((prev) => {
      const idx = prev.findIndex((r) => r.reviewId === reviewId);
      if (idx === -1) return prev;
      const removed = prev[idx];
      lastRemovedRef.current = { item: removed, index: idx };
      // 삭제 확정 -> deletingIds에서도 제거
      setDeletingIds((prevIds) => {
        const next = new Set(prevIds);
        next.delete(reviewId);
        return next;
      });
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

  // 서버 확인 중이면 아무것도 보여주지 않거나 로딩을 표시하여 깜빡임 방지
  if (reviews === null) return <div>로딩 중...</div>;

  const isEmpty = reviews.length === 0;

  return (
    <>
      <div css={pageContainerStyle(isEmpty)}>
        <div css={header}>
          <FaRegCommentDots color={isEmpty ? '#fff' : '#222'} size={43} css={reviewIcon} />
          <span css={isEmpty ? emptyTitle : title}>내가 쓴 리뷰</span>
        </div>

        {/* 리뷰 목록: 비어있을 때는 서서히 사라짐 */}
        <div css={[listBox, isEmpty && listHidden]}>
          {reviews.map((item) => (
            <ReviewListCard
              key={item.reviewId}
              item={item}
              onClick={handleCardClick}
              onToast={setToastMessage}
              onStartRemoving={handleStartRemoving}
              onFinalizeRemove={handleFinalizeRemove}
              onCancelRemoving={handleCancelRemoving}
              onRestore={handleRestore}
              isDeleting={deletingIds.has(item.reviewId)}
            />
          ))}
        </div>

        {/* 빈 상태: 목록 위에 겹쳐서 존재, isEmpty시 fade-in */}
        <div css={[emptyStateStyle, !isEmpty && emptyHidden]}>
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
      </div>

      <ToastMessage message={toastMessage} />
    </>
  );
};

export default MyReviewPage;

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

const listHidden = css`
  opacity: 0;
  pointer-events: none;
  transform: translateY(8px);
`;

const emptyStateStyle = css`
  position: absolute;
  inset: 0;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  padding-top: calc(${theme.spacing.spacing16} + env(safe-area-inset-top));
  text-align: center;
  background: #000;
  height: 100vh;
  box-sizing: border-box;
  transition:
    opacity 360ms ease,
    transform 360ms ease;
  opacity: 1;
  pointer-events: auto;
`;

const emptyHidden = css`
  opacity: 0;
  pointer-events: none;
  transform: translateY(8px);
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
  white-space: pre-line;
`;
