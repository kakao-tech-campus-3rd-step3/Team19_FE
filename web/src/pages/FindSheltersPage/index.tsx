/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import ShelterList from './components/ShelterList';
import BottomControls from './components/BottomControls';
import ToastMessage from '../../components/ToastMessage';
import { useShelters } from './hooks/useShelters';
import emptyShelterImage from '@/assets/images/empty-shelter.png';
import theme from '@/styles/theme';

const FindSheltersPage = () => {
  const {
    shelters,
    favoriteIds,
    toastMessage,
    // TODO: 추후 무한 스크롤 구현 시 사용
    // visibleCount,
    hasMoreItems,
    handleToggleFavorite,
    handleLoadMore,
    isLoading,
    error,
  } = useShelters();

  if (isLoading) {
    return <div css={emptyStateStyle}>쉼터 정보를 불러오는 중입니다...</div>;
  }

  if (error) {
    // TODO: 실제 에러 메시지 및 에러 페이지로 대체 가능
    return (
      <div css={emptyStateStyle}>
        <p css={emptyTextStyle}>쉼터 정보를 불러오지 못했습니다.</p>
      </div>
    );
  }

  return (
    <>
      {shelters.length > 0 ? (
        // 쉼터 목록이 있을 때의 전체 화면 컨테이너
        <div css={pageContainerStyle}>
          <ShelterList
            shelters={shelters}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />
          <BottomControls hasMoreItems={hasMoreItems} onLoadMore={handleLoadMore} />
          {/* ToastMessage 컴포넌트 사용 */}
          <ToastMessage message={toastMessage} />
        </div>
      ) : (
        // 쉼터 목록이 없을 때의 전체 화면 컨테이너
        <div css={emptyStateStyle}>
          <p css={emptyTextStyle}>
            근처에 가까운 쉼터가
            <br /> 없습니다
          </p>
          <img src={emptyShelterImage} alt="이미지를 불러올 수 없습니다" css={emptyImageStyle} />
        </div>
      )}
    </>
  );
};

export default FindSheltersPage;

const pageContainerStyle = css`
  position: relative;
  height: 100%;
  margin: 0 auto;
  background: white;
  padding-top: 1vh;
`;

const emptyStateStyle = css`
  position: fixed;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  background: black;
  overflow: hidden;
`;

const emptyImageStyle = css`
  width: 200px;
  height: auto;
  margin-bottom: 16px;
`;

const emptyTextStyle = css`
  ${theme.typography.text1};
  color: ${theme.colors.text.white};
`;
