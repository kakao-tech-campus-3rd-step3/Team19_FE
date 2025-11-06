/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import ToastMessage from '../../components/ToastMessage';
import ShelterDetailInfo from './components/ShelterDetailInfo';
import ShelterReviewSection from './components/ShelterReviewSection';
import { useShelterDetail } from './hooks/useShelterDetail';
import { toggleWish } from '@/api/wishApi';
import { checkLoginStatus } from '@/api/userApi';
import theme from '@/styles/theme';
import { setPendingAction } from '@/utils/pendingAction';

const ShelterDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    shelter,
    isLoading,
    isFavorite,
    reviews,
    loadingReviews,
    visibleCount,
    averageRating,
    handleImageError,
    handleMore,
    onGuideStart,
    setIsFavorite,
    shelterError,
    reviewsError,
  } = useShelterDetail(id);

  const [toast] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });
  const [toggling, setToggling] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // wishApi를 활용한 찜 버튼 클릭 핸들러
  const handleToggleFavorite = async () => {
    if (toggling) return; // 중복 호출 방지

    // 로그인 검증
    const isLoggedIn = await checkLoginStatus();
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    setToggling(true);
    try {
      const result = await toggleWish({
        shelterId: id ?? '',
        isFavorite,
      });

      if (result?.success) {
        setIsFavorite(!isFavorite);
      }
    } catch (err: any) {
      if (err?.status === 403 || err?.status === 401) {
        setShowLoginModal(true);
        return;
      }
      console.error('[ShelterDetailPage] toggleWish error:', err);
    } finally {
      setToggling(false);
    }
  };

  const handleLoginConfirm = () => {
    setShowLoginModal(false);
    // 찜 동작 복원을 위해 PendingAction 저장
    if (id) {
      setPendingAction({
        type: 'toggle-wish',
        payload: { shelterId: id, isFavorite },
        returnUrl: `/shelter-detail/${id}`,
      });
    }
    navigate('/auth');
  };

  const handleLoginCancel = () => {
    setShowLoginModal(false);
  };

  if (isLoading) {
    return null;
  }
  if (shelterError) {
    return <div>쉼터 정보를 불러오지 못했습니다.</div>;
  }
  if (reviewsError) {
    return <div>리뷰 정보를 불러오지 못했습니다.</div>;
  }

  return (
    <div css={container}>
      {toast.open && <ToastMessage message={toast.message} />}

      {shelter && (
        <ShelterDetailInfo
          shelter={shelter}
          averageRating={averageRating}
          isFavorite={isFavorite}
          onToggleFavorite={handleToggleFavorite}
          // optional: 자식에서 버튼 비활성화 처리하려면 prop 추가 가능
          // isToggling={toggling}
          // hook의 onGuideStart는 {lat,lng}를 받으므로,
          // 상세 컴포넌트에서 전달하는 ShelterDetail 객체를 좌표로 변환하여 호출하는 wrapper 전달
          onGuideStart={(targetShelter?: any) => {
            if (!onGuideStart) return;
            if (
              targetShelter &&
              typeof targetShelter.latitude === 'number' &&
              typeof targetShelter.longitude === 'number'
            ) {
              onGuideStart({ lat: targetShelter.latitude, lng: targetShelter.longitude });
            } else {
              onGuideStart(undefined);
            }
          }}
          handleImageError={handleImageError}
        />
      )}

      <ShelterReviewSection
        reviews={reviews}
        loading={loadingReviews}
        visibleCount={visibleCount}
        onMore={handleMore}
        handleImageError={handleImageError}
        shelterName={shelter?.name ?? ''}
        shelterId={shelter?.shelterId ?? 0}
      />

      {/* 로그인 필요 모달 */}
      {showLoginModal &&
        createPortal(
          <div css={modalOverlay} onClick={handleLoginCancel}>
            <div css={modalBox} onClick={(e) => e.stopPropagation()}>
              <div css={modalText}>
                로그인이 필요한
                <br />
                기능입니다
              </div>
              <div css={modalButtons}>
                <button css={modalBtn} onClick={handleLoginConfirm}>
                  로그인
                </button>
                <button css={modalBtn} onClick={handleLoginCancel}>
                  취소
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default ShelterDetailPage;

const container = css`
  padding-top: calc(${theme.spacing.spacing16} + env(safe-area-inset-top));
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  margin-bottom: env(safe-area-inset-bottom);
  margin-top: 0px;
  background: white;
`;

const modalOverlay = css`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 2001;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const modalBox = css`
  background: #fff;
  border-radius: 16px;
  padding: 32px 28px 24px 28px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
  display: flex;
  max-width: 80%;
  flex-direction: column;
  align-items: center;
`;

const modalText = css`
  ${theme.typography.modal1};
  color: #222;
  margin-bottom: 24px;
  text-align: center;
`;

const modalButtons = css`
  display: flex;
  gap: 18px;
`;

const modalBtn = css`
  ${theme.typography.modal2};
  background: ${theme.colors.button.black};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  cursor: pointer;
  transition: background 0.18s;
`;
