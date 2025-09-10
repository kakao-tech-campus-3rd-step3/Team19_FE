/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import theme from '@/styles/theme';
import { useRef, useState, useEffect } from 'react';

// Review 타입 정의
interface Review {
  reviewId: number;
  userId: number;
  nickname: string;
  rating: number;
  content: string;
  photoUrl: string;
  userProfileUrl: string;
  createdAt: string;
}

// ShelterReviewSection 컴포넌트가 받을 props 타입
interface ShelterReviewSectionProps {
  reviews: Review[];
  loading: boolean;
  visibleCount: number;
  onMore: () => void;
  handleImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

// 날짜 포맷팅 함수
function formatDateShort(createdAt: string) {
  try {
    return new Date(createdAt).toLocaleDateString();
  } catch {
    return createdAt;
  }
}

const ShelterReviewSection = ({
  reviews,
  loading,
  visibleCount,
  onMore,
  handleImageError,
}: ShelterReviewSectionProps) => {
  const [expandedMap, setExpandedMap] = useState<{ [reviewId: number]: boolean }>({});
  const [showMoreMap, setShowMoreMap] = useState<{ [reviewId: number]: boolean }>({});

  const contentRefs = useRef<{ [reviewId: number]: HTMLDivElement | null }>({});

  // 줄 수 감지 함수
  const checkLineClamp = (reviewId: number) => {
    const el = contentRefs.current[reviewId];
    if (!el) return;
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight || '20');
    const maxHeight = lineHeight * 3;
    // 3줄 초과면 showMoreMap[reviewId] = true
    setShowMoreMap((prev) => ({
      ...prev,
      [reviewId]: el.scrollHeight > maxHeight,
    }));
  };

  // 화면 크기 변경 시 줄 수 재확인
  useEffect(() => {
    const handleResize = () => {
      reviews.forEach((r) => checkLineClamp(r.reviewId));
    };
    window.addEventListener('resize', handleResize);
    // mount 시에도 체크
    reviews.forEach((r) => checkLineClamp(r.reviewId));
    return () => window.removeEventListener('resize', handleResize);
  }, [reviews]);

  return (
    <section css={reviewSectionStyle}>
      <div css={reviewHeader}>
        <div css={reviewTitle}>리뷰({reviews ? reviews.length : 0})</div>
        <button css={reviewWriteButton}>리뷰 작성</button>
      </div>

      {loading ? (
        <div css={loadingStyle}>로딩 중...</div>
      ) : reviews && reviews.length > 0 ? (
        <div css={reviewListStyle}>
          {reviews.slice(0, visibleCount).map((r) => (
            <article css={reviewCardStyle} key={r.reviewId}>
              <div css={reviewLeft}>
                <div css={avatarRow}>
                  {r.userProfileUrl ? (
                    <img
                      src={r.userProfileUrl}
                      alt={r.nickname}
                      css={avatarImgStyle}
                      onError={handleImageError}
                    />
                  ) : (
                    <div css={avatarStyle}>{(r.nickname && r.nickname.charAt(0)) || '유'}</div>
                  )}
                  <div css={avatarInfoCol}>
                    <span css={reviewNickname}>{r.nickname}</span>
                    <span css={reviewStarsRow}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} css={i < r.rating ? filledStar : emptyStar}>
                          ★
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
                <div css={reviewContentBox}>
                  <div
                    ref={(el) => {
                      contentRefs.current[r.reviewId] = el;
                    }}
                    css={[
                      reviewText,
                      !expandedMap[r.reviewId] && showMoreMap[r.reviewId]
                        ? clamp3LineStyle
                        : undefined,
                    ]}
                  >
                    {r.content}
                  </div>
                  {showMoreMap[r.reviewId] && (
                    <button
                      css={moreTextButtonStyle}
                      onClick={() =>
                        setExpandedMap((prev) => ({
                          ...prev,
                          [r.reviewId]: !prev[r.reviewId],
                        }))
                      }
                    >
                      {expandedMap[r.reviewId] ? '접기' : '더보기'}
                    </button>
                  )}
                  {r.photoUrl && (
                    <img
                      src={r.photoUrl}
                      alt={`review-${r.reviewId}`}
                      css={reviewPhoto}
                      onError={handleImageError}
                    />
                  )}
                  <div css={reviewMeta}>
                    <span>{formatDateShort(r.createdAt)}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div css={noReviewStyle}>리뷰가 없습니다.</div>
      )}

      {/* 더보기 버튼: 보여줄 리뷰가 남아있을 때만 노출 */}
      {reviews && visibleCount < reviews.length && (
        <div css={moreWrap}>
          <button css={moreButton} onClick={onMore}>
            더보기
          </button>
        </div>
      )}
    </section>
  );
};

export default ShelterReviewSection;

/* 별점 스타일 */
const filledStar = css`
  color: ${theme.colors.text.yellow};
  ${theme.typography.detail2};
`;

const emptyStar = css`
  color: ${theme.colors.text.gray200};
  ${theme.typography.detail2};
`;

/* 리뷰 섹션 스타일 */
const reviewSectionStyle = css`
  margin-top: 32px;
  padding: 16px;
  wdith: 80%;
  border-top: 1px solid ${theme.colors.text.gray500};
`;

const reviewHeader = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const reviewTitle = css`
  ${theme.typography.cardh3};
  color: ${theme.colors.text.black};
  text-align: left;
`;

const reviewWriteButton = css`
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: ${theme.colors.button.red};
  color: white;
  cursor: pointer;
  ${theme.typography.detail3};
`;

const loadingStyle = css`
  text-align: center;
  padding: 16px;
  color: ${theme.colors.text.gray500};
`;

const reviewListStyle = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const reviewCardStyle = css`
  display: flex;
  gap: 16px;
  border-radius: 12px;
  background: ${theme.colors.text.white};
  align-items: flex-start;
  text-align: left;
`;

const reviewLeft = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const avatarRow = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const avatarInfoCol = css`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
`;

const avatarStyle = css`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${theme.colors.text.gray500};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  ${theme.typography.detail2};
  font-size: 25px;
  font-weight: 700;
`;

const avatarImgStyle = css`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  background: ${theme.colors.text.gray500};
  margin-right: 0;
  flex-shrink: 0;
`;

const reviewNickname = css`
  ${theme.typography.detail3};
  color: ${theme.colors.text.black};
  font-weight: 700;
`;

const reviewStarsRow = css`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const reviewContentBox = css`
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  gap: 8px;
  margin-top: 4px;
  padding: 8px;
  background: ${theme.colors.text.gray50};
`;

const reviewText = css`
  ${theme.typography.review3};
  color: ${theme.colors.text.black};
`;

const reviewMeta = css`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  ${theme.typography.review2};
  color: ${theme.colors.text.gray500};
  font-size: 20px;
`;

const reviewPhoto = css`
  width: 40%;
  max-width: 180px;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.23);
  pointer-events: none;
  align-self: flex-start;
  margin-top: 8px;
  background: ${theme.colors.text.white};
`;

const noReviewStyle = css`
  text-align: center;
  color: ${theme.colors.text.gray500};
  padding: 16px;
  ${theme.typography.review1};
`;

const moreWrap = css`
  display: flex;
  justify-content: center;
  margin-top: 16px;
`;

const moreButton = css`
  width: 50%;
  margin: 4px auto 0;
  padding: 6px 20px;
  border: 1px solid rgba(0, 0, 0, 0.52);
  border-radius: 8px;
  background-color: ${theme.colors.button.black};
  color: ${theme.colors.text.white};
  ${theme.typography.button1};
  cursor: pointer;
`;

const clamp3LineStyle = css`
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const moreTextButtonStyle = css`
  background: none;
  border: none;
  color: ${theme.colors.text.blue};
  cursor: pointer;
  margin-top: 2px;
  ${theme.typography.review2};
  align-self: flex-end;
`;
