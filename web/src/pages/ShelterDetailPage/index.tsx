/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import ToastMessage from '../FindSheltersPage/components/ToastMessage';
import ShelterDetailInfo from './components/ShelterDetailInfo';
import ShelterReviewSection from './components/ShelterReviewSection';
import { useShelterDetail } from './hooks/useShelterDetail';

const ShelterDetailPage = () => {
  const { id } = useParams();

  // 커스텀 훅을 호출하여 페이지에 필요한 모든 데이터를 가져옴
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
    onToggleFavorite,
    onGuideStart,
  } = useShelterDetail(id);

  // Toast 상태 추가
  const [toast, setToast] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  const showToast = (message: string) => {
    setToast({ open: true, message });
    setTimeout(() => setToast({ open: false, message: '' }), 1500);
  };

  // 찜 버튼 클릭 핸들러
  const handleToggleFavorite = () => {
    onToggleFavorite();
    if (isFavorite) {
      showToast('찜 목록에서\n삭제되었습니다');
    } else {
      showToast('찜 목록에\n추가되었습니다');
    }
  };

  // 로딩 중일 때의 UI
  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div css={container}>
      {/* Toast 메시지 */}
      {toast.open && <ToastMessage message={toast.message} />}

      {/* 쉼터 정보 컴포넌트 */}
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

      {/* 리뷰 섹션 컴포넌트 */}
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

/* 페이지 전체 컨테이너 스타일 */
const container = css`
  padding: 16px;
  margin-top: 0px;
  background: white;
`;
