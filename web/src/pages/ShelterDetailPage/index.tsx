/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import ToastMessage from '../FindSheltersPage/components/ToastMessage';
import ShelterDetailInfo from './components/ShelterDetailInfo';
import ShelterReviewSection from './components/ShelterReviewSection';
import { useShelterDetail } from './hooks/useShelterDetail';
import { toggleWish } from '@/utils/wishApi';

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
  } = useShelterDetail(id);

  const [toast, setToast] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  const showToast = (message: string) => {
    setToast({ open: true, message });
    setTimeout(() => setToast({ open: false, message: '' }), 1500);
  };

  // wishApi를 활용한 찜 버튼 클릭 핸들러
  const handleToggleFavorite = async () => {
    const userId = 1; // TODO: 실제 서비스에서는 인증 정보에서 받아야 함
    const result = await toggleWish({
      shelterId: id ?? '',
      userId,
      isFavorite,
    });
    // 찜 추가/삭제 성공 시 하트 상태 변경
    if (result.success) {
      setIsFavorite(!isFavorite);
    }
    showToast(result.message);
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
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
      />
    </div>
  );
};

export default ShelterDetailPage;

const container = css`
  padding: 16px;
  margin-top: 0px;
  background: white;
`;
