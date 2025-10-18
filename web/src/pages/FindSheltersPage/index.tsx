/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import ShelterList from './components/ShelterList';
import ToastMessage from '@/components/ToastMessage';
import emptyShelterImage from '@/assets/images/empty-shelter.png';
import { useShelters } from './hooks/useShelters';
import { toggleWish } from '@/api/wishApi';
import theme from '@/styles/theme';
import { nearbyShelters } from '@/mock/nearbyShelters'; // 임시 목데이터 사용

const FindSheltersPage = () => {
  const {
    shelters,
    favoriteIds,
    toastMessage,
    isLoading,
    error,
    isFetchingMore,
    handleLoadMore,
    handleToggleFavorite,
  } = useShelters();

  // API 호출(toggleWish) -> 성공 시 훅의 로컬 토글 호출
  const handleToggleWithApi = async (shelterId: number, isFavorite: boolean) => {
    try {
      await toggleWish({ shelterId, isFavorite });
      // 로컬 UI 즉시 반영
      handleToggleFavorite(shelterId);
    } catch (err) {
      console.error('[FindSheltersPage] toggleWish error', err);
      // 실패 시 사용자 알림
      // ToastMessage는 상단에서 toastMessage로 보여주므로 set을 원하면 훅에 setToastMessage 추가 사용
    }
  };

  if (isLoading) return <div css={pageContainerStyle}>로딩 중...</div>;
  if (error)
    return (
      <div css={pageContainerStyle}>
        <div css={emptyTextStyle}>근처 쉼터를 불러올 수 없습니다.</div>
      </div>
    );

  // Fallback: API 데이터가 없으면 nearbyShelters(목) 사용
  const visibleShelters = shelters.length > 0 ? shelters : nearbyShelters;

  return (
    <>
      {visibleShelters.length > 0 ? (
        <div css={pageContainerStyle}>
          <ShelterList
            // 개발/테스트용: 실제 API 데이터가 없을 때 nearbyShelters로 대체
            shelters={visibleShelters}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleWithApi} // 시그니처: (shelterId, isFavorite)
            onLoadMore={handleLoadMore}
            isFetchingMore={isFetchingMore}
          />
          {toastMessage && <ToastMessage message={toastMessage} />}
        </div>
      ) : (
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
  display: flex;
  height: calc(100vh - ${theme.spacing.spacing16});
  margin-top: ${theme.spacing.spacing16};
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
