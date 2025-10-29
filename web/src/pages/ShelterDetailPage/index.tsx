/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import ToastMessage from '../../components/ToastMessage';
import ShelterDetailInfo from './components/ShelterDetailInfo';
import ShelterReviewSection from './components/ShelterReviewSection';
import { useShelterDetail } from './hooks/useShelterDetail';
import { toggleWish } from '@/api/wishApi';
import theme from '@/styles/theme';

const ShelterDetailPage = () => {
  const { id } = useParams();

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

  const [toast, setToast] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });
  const [toggling, setToggling] = useState(false);

  const showToast = (message: string) => {
    setToast({ open: true, message });
    setTimeout(() => setToast({ open: false, message: '' }), 1500);
  };

  // wishApi를 활용한 찜 버튼 클릭 핸들러
  const handleToggleFavorite = async () => {
    if (toggling) return; // 중복 호출 방지
    setToggling(true);
    try {
      const result = await toggleWish({
        shelterId: id ?? '',
        isFavorite,
      });

      if (result?.success) {
        setIsFavorite(!isFavorite);
      }
      showToast(result?.message ?? '처리되었습니다.');
    } catch (err: any) {
      console.error('[ShelterDetailPage] toggleWish error:', err);
      // client.ts의 전역 리다이렉트가 주석처리된 상태라면 이 catch가 호출됩니다.
      showToast(err?.message ?? '서버와 연결할 수 없습니다.');
    } finally {
      setToggling(false);
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
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
          onGuideStart={onGuideStart}
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
    </div>
  );
};

export default ShelterDetailPage;

const container = css`
  height: calc(
    100vh - ${theme.spacing.spacing16} - env(safe-area-inset-bottom) - env(safe-area-inset-top)
  );
  padding-top: calc(${theme.spacing.spacing16} + env(safe-area-inset-top));
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  margin-top: 0px;
  background: white;
`;
