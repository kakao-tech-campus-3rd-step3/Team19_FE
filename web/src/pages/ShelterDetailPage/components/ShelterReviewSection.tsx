/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import theme from '@/styles/theme';
import { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { checkLoginStatus, getMyProfile } from '@/api/userApi';
import { deleteReview } from '@/api/reviewApi';
import { setPendingAction } from '@/utils/pendingAction';
import NoProfile from '@/assets/images/NoProfile.png';
import { createPortal } from 'react-dom';
import { FaTrash } from 'react-icons/fa';

// Review 타입 정의
interface Review {
  reviewId: number;
  userId: number;
  nickname: string;
  rating: number;
  content: string;
  photoUrl: string | null;
  profileImageUrl: string;
  createdAt: string;
}

// ShelterReviewSection 컴포넌트가 받을 props 타입
interface ShelterReviewSectionProps {
  reviews: Review[];
  loading: boolean;
  visibleCount: number;
  onMore: () => void;
  handleImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  shelterName: string; // props로 쉼터 이름 받기
  shelterId: number; // props로 쉼터 id 받기
  // 삭제 성공 시 부모에 삭제된 reviewId 전달 -> 부모가 로컬 상태에서 제거
  onReviewDeleted?: (reviewId: number) => void;
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
  shelterName,
  shelterId,
  onReviewDeleted,
}: ShelterReviewSectionProps) => {
  const [expandedMap, setExpandedMap] = useState<{ [reviewId: number]: boolean }>({});
  const [showMoreMap, setShowMoreMap] = useState<{ [reviewId: number]: boolean }>({});
  const [modalImg, setModalImg] = useState<string | null>(null); // 추가: 확대 이미지 상태

  const contentRefs = useRef<{ [reviewId: number]: HTMLDivElement | null }>({});
  const navigate = useNavigate();
  const location = useLocation();
  const bodyLockRef = useRef(0);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 프로필 이미지 에러 핸들링용 state
  const [profileImgErrorMap, setProfileImgErrorMap] = useState<{ [reviewId: number]: boolean }>({});

  // 내 닉네임 저장 (리뷰 작성자와 비교하여 삭제 버튼 표시)
  const [myNickname, setMyNickname] = useState<string | null>(null);

  // 삭제 확인 모달 state
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    open: boolean;
    reviewId: number | null;
  }>({ open: false, reviewId: null });

  // 컴포넌트 마운트 시 내 프로필 정보 가져오기
  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const isLoggedIn = await checkLoginStatus();
        if (isLoggedIn) {
          const profile = await getMyProfile();
          setMyNickname(profile.nickname);
        }
      } catch (err) {
        console.warn('[ShelterReviewSection] Failed to fetch my profile:', err);
      }
    };
    fetchMyProfile();
  }, []);

  // 리뷰 삭제 핸들러
  const handleDeleteReview = async (reviewId: number) => {
    try {
      await deleteReview(reviewId);
      // 삭제 성공 시 부모에 id 전달하여 로컬에서 바로 제거하도록 함 (스크롤 유지)
      onReviewDeleted?.(reviewId);
    } catch (err) {
      console.error('[ShelterReviewSection] Failed to delete review:', err);
      alert('리뷰 삭제에 실패했습니다.');
    }
  };

  // 줄 수 감지 함수
  const checkLineClamp = (reviewId: number) => {
    const el = contentRefs.current[reviewId];
    if (!el) return;
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight || '20');
    const maxHeight = lineHeight * 3;
    // 3줄 초과면 true, 3줄 이하면 false
    setShowMoreMap((prev) => ({
      ...prev,
      [reviewId]: el.scrollHeight > maxHeight + 1, // +1로 오차 보정
    }));
  };

  // 화면 크기 변경 시 줄 수 재확인
  useEffect(() => {
    setTimeout(() => {
      reviews.forEach((r) => checkLineClamp(r.reviewId));
    }, 0);
  }, [reviews]);

  // modal(open) 시 바디 스크롤 잠금 (ReviewListCard와 동일 동작)
  useEffect(() => {
    const modalOpen = !!modalImg;
    const body = document.body;
    if (modalOpen) {
      const prev = Number(body.dataset.modalOpenCount ?? 0);
      body.dataset.modalOpenCount = String(prev + 1);
      if (prev === 0) {
        body.dataset.prevOverflow = body.style.overflow || '';
        body.dataset.prevScrollY = String(window.scrollY || 0);
        body.style.overflow = 'hidden';
      }
      bodyLockRef.current = Number(body.dataset.modalOpenCount);
    } else {
      const prev = Number(body.dataset.modalOpenCount ?? 0);
      const next = Math.max(0, prev - 1);
      body.dataset.modalOpenCount = String(next);
      if (next === 0) {
        const prevOverflow = body.dataset.prevOverflow ?? '';
        const prevScrollY = Number(body.dataset.prevScrollY ?? 0);
        body.style.overflow = prevOverflow;
        window.scrollTo(0, prevScrollY);
        delete body.dataset.prevOverflow;
        delete body.dataset.prevScrollY;
        delete body.dataset.modalOpenCount;
        bodyLockRef.current = 0;
      } else {
        bodyLockRef.current = next;
      }
    }
    return () => {
      const prev = Number(body.dataset.modalOpenCount ?? 0);
      if (prev <= 1) {
        const prevOverflow = body.dataset.prevOverflow ?? '';
        const prevScrollY = Number(body.dataset.prevScrollY ?? 0);
        body.style.overflow = prevOverflow;
        window.scrollTo(0, prevScrollY);
        delete body.dataset.prevOverflow;
        delete body.dataset.prevScrollY;
        delete body.dataset.modalOpenCount;
      } else {
        body.dataset.modalOpenCount = String(prev - 1);
      }
    };
  }, [modalImg]);

  return (
    <section css={reviewSectionStyle}>
      <div css={reviewHeader}>
        <div css={reviewTitle}>리뷰({reviews ? reviews.length : 0})</div>
        <button
          css={reviewWriteButton}
          onClick={async () => {
            const isLoggedIn = await checkLoginStatus();
            if (!isLoggedIn) {
              setShowLoginModal(true);
              return;
            }
            navigate(`/write-review/${shelterId}`, { state: { shelterName } });
          }}
        >
          리뷰 작성
        </button>
      </div>

      {loading ? null : reviews && reviews.length > 0 ? (
        <div css={reviewListStyle}>
          {reviews.slice(0, visibleCount).map((r) => (
            <article css={reviewCardStyle} key={r.reviewId}>
              <div css={reviewLeft}>
                {/* 내 리뷰인 경우 삭제 버튼 표시 (리뷰 콘텐츠 박스 우측 상단에 배치) */}
                {myNickname && myNickname === r.nickname && (
                  <button
                    type="button"
                    css={deleteButtonStyle}
                    onClick={() => setDeleteConfirmModal({ open: true, reviewId: r.reviewId })}
                    aria-label="리뷰 삭제"
                  >
                    <FaTrash size={30} />
                  </button>
                )}
                <div css={avatarRow}>
                  {r.profileImageUrl &&
                  r.profileImageUrl !== '' &&
                  !profileImgErrorMap[r.reviewId] ? (
                    <img
                      src={r.profileImageUrl}
                      alt={r.nickname}
                      css={avatarImgStyle}
                      onError={() =>
                        setProfileImgErrorMap((prev) => ({
                          ...prev,
                          [r.reviewId]: true,
                        }))
                      }
                    />
                  ) : (
                    <img src={NoProfile} alt="NoProfile" css={avatarImgStyle} />
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
                      onClick={() => setModalImg(r.photoUrl)} // 클릭 시 확대
                      style={{ cursor: 'pointer' }}
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

      {/* 이미지 확대 모달 (createPortal, ReviewListCard와 동일 동작) */}
      {modalImg &&
        createPortal(
          <div css={modalOverlay} onClick={() => setModalImg(null)}>
            <div css={modalContent} onClick={(e) => e.stopPropagation()}>
              <img
                src={modalImg}
                alt="리뷰 이미지 확대"
                css={modalImgStyle}
                onError={handleImageError}
              />
              <button css={modalCloseBtn} onClick={() => setModalImg(null)}>
                닫기
              </button>
            </div>
          </div>,
          document.body,
        )}

      {/* 삭제 확인 모달 */}
      {deleteConfirmModal.open &&
        createPortal(
          <div
            css={deleteModalOverlay}
            onClick={() => setDeleteConfirmModal({ open: false, reviewId: null })}
          >
            <div css={deleteModalBox} onClick={(e) => e.stopPropagation()}>
              <div css={deleteModalText}>
                리뷰를
                <br />
                삭제하시겠습니까?
              </div>
              <div css={deleteModalButtons}>
                <button
                  css={deleteModalBtn}
                  onClick={() => {
                    const id = deleteConfirmModal.reviewId;
                    setDeleteConfirmModal({ open: false, reviewId: null });
                    if (id) {
                      // 모달 닫고 삭제 API 호출 및 부모에 id 전달
                      handleDeleteReview(id);
                    }
                  }}
                >
                  예
                </button>
                <button
                  css={deleteModalBtn}
                  onClick={() => setDeleteConfirmModal({ open: false, reviewId: null })}
                >
                  아니요
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* 로그인 필요 모달 */}
      {showLoginModal &&
        createPortal(
          <div css={loginModalOverlay} onClick={() => setShowLoginModal(false)}>
            <div css={loginModalBox} onClick={(e) => e.stopPropagation()}>
              <div css={loginModalText}>
                로그인이 필요한
                <br />
                기능입니다
              </div>
              <div css={loginModalButtons}>
                <button
                  css={loginModalBtn}
                  onClick={() => {
                    setShowLoginModal(false);
                    setPendingAction({
                      type: 'write-review',
                      payload: { shelterId, state: { shelterName } },
                      returnUrl: location.pathname,
                    });
                    navigate('/auth');
                  }}
                >
                  로그인
                </button>
                <button css={loginModalBtn} onClick={() => setShowLoginModal(false)}>
                  취소
                </button>
              </div>
            </div>
          </div>,
          document.body,
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
  margin: 32px auto 0; /* 상단 마진은 유지, 가운데 정렬 */
  padding: 16px;
  border-top: 1px solid ${theme.colors.text.gray500};
  width: 90%; /* 화면의 90% 사용 */
  max-width: 1100px; /* 필요 시 최대 너비 제한 (선택) */
  box-sizing: border-box;
`;

const reviewHeader = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  width: 100%; /* 부모(90%) 안에서 꽉 채움 */
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

const reviewListStyle = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%; /* 부모(90%) 안에서 꽉 채움 */
`;

const reviewCardStyle = css`
  display: flex;
  gap: 16px;
  border-radius: 12px;
  background: ${theme.colors.text.white};
  align-items: flex-start;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
  flex-wrap: wrap; /* 내용이 너무 길면 다음 줄로 내려가도록 허용 */
`;

const reviewLeft = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
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

const deleteButtonStyle = css`
  position: absolute;
  top: 8px;
  right: 4px;
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  z-index: 2;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #d76464;
  }
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
  width: 100%; /* 내용 영역이 가용 너비를 차지하도록 */
  box-sizing: border-box;
`;

const reviewText = css`
  ${theme.typography.review3};
  color: ${theme.colors.text.black};
  white-space: pre-wrap; /* 줄바꿈/공백 유지하며 자동 줄바꿈 허용 */
  overflow-wrap: anywhere; /* 긴 단어도 적절히 줄바꿈 */
  word-break: break-word; /* 긴 단어가 박스를 넘지 않게 처리 */
  hyphens: auto;
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
  width: 35%;
  max-width: 180px;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.23);
  align-self: flex-start;
  margin-top: 8px;
  background: ${theme.colors.text.white};
  flex-shrink: 0;
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

// 모달 스타일 추가
const modalOverlay = css`
  position: fixed;
  z-index: 2000;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const modalContent = css`
  background: #fff;
  border-radius: 12px;
  padding: 24px 16px 16px 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 90vw;
  max-height: 80vh;
`;

const modalImgStyle = css`
  width: 90vw;
  border-radius: 8px;
  object-fit: contain;
  background: #fafafa;
`;

const modalCloseBtn = css`
  align-self: center;
  margin-top: 8px;
  background: #222;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 18px;
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
`;

// 삭제 확인 모달 스타일
const deleteModalOverlay = css`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 2001;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const deleteModalBox = css`
  background: #fff;
  border-radius: 16px;
  padding: 32px 28px 24px 28px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
  display: flex;
  max-width: 80%;
  flex-direction: column;
  align-items: center;
`;

const deleteModalText = css`
  ${theme.typography.modal1};
  color: #222;
  margin-bottom: 24px;
  text-align: center;
`;

const deleteModalButtons = css`
  display: flex;
  gap: 18px;
`;

const deleteModalBtn = css`
  ${theme.typography.modal2};
  background: ${theme.colors.button.black};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  cursor: pointer;
  transition: background 0.18s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// 로그인 모달 스타일
const loginModalOverlay = css`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 2001;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const loginModalBox = css`
  background: #fff;
  border-radius: 16px;
  padding: 32px 28px 24px 28px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
  display: flex;
  max-width: 80%;
  flex-direction: column;
  align-items: center;
`;

const loginModalText = css`
  ${theme.typography.modal1};
  color: #222;
  margin-bottom: 24px;
  text-align: center;
`;

const loginModalButtons = css`
  display: flex;
  gap: 18px;
`;

const loginModalBtn = css`
  ${theme.typography.modal2};
  background: ${theme.colors.button.black};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  cursor: pointer;
  transition: background 0.18s;
`;
