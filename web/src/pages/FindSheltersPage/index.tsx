/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import theme from '@/styles/theme';
import { nearbyShelters } from '@/mock/nearbyShelters';
import ShelterList from './components/ShelterList';
import BottomControls from './components/BottomControls';
import ToastMessage from './components/ToastMessage';
import { useShelters } from './hooks/useShelters';

const FindSheltersPage = () => {
  const {
    favoriteIds,
    toastMessage,
    visibleCount,
    showScrollToTop,
    hasMoreItems,
    handleToggleFavorite,
    handleLoadMore,
    handleScrollToTop,
  } = useShelters();

  return (
    <div css={containerStyle}>
      <ShelterList
        shelters={nearbyShelters.slice(0, visibleCount)}
        favoriteIds={favoriteIds}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* 하단 버튼 영역 컴포넌트 분리 */}
      <BottomControls
        hasMoreItems={hasMoreItems}
        onLoadMore={handleLoadMore}
        showScrollToTop={showScrollToTop}
        onScrollToTop={handleScrollToTop}
      />

      {/* ToastMessage 컴포넌트 사용 */}
      <ToastMessage message={toastMessage} />
    </div>
  );
};

export default FindSheltersPage;

const containerStyle = css`
  position: relative;
  padding: ${theme.spacing.spacing18} 0;
  margin: 0 auto;
  background: white;
  height: calc(100vh - ${theme.spacing.spacing18} - ${theme.spacing.spacing18});
`;
