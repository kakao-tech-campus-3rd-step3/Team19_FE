/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ShelterList from './components/ShelterList';
import emptyShelterImage from '@/assets/images/empty-shelter2.gif';
import { useShelters } from './hooks/useShelters';
import { toggleWish } from '@/api/wishApi';
import theme from '@/styles/theme';
import { checkLoginStatus } from '@/api/userApi';
import { useNavigate } from 'react-router-dom';

const FindSheltersPage = () => {
  const [hasScroll, setHasScroll] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  const {
    shelters, // 전체 목록 (빈 상태 판단용)
    visibleShelters, // 화면에 실제로 렌더할 항목
    favoriteIds,
    isLoading,
    error,
    isFetchingMore,
    handleLoadMore,
    handleToggleFavorite,
  } = useShelters();

  // API 호출(toggleWish) -> 성공 시 훅의 로컬 토글 호출
  const handleToggleWithApi = async (shelterId: number, isFavorite: boolean) => {
    // ==== 로그인 검증 추가 ====
    const isLoggedIn = await checkLoginStatus();
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    try {
      await toggleWish({ shelterId, isFavorite });
      // 로컬 UI 즉시 반영
      handleToggleFavorite(shelterId);
    } catch (err: any) {
      if (err?.status === 403 || err?.status === 401) {
        setShowLoginModal(true);
        return;
      }
      console.error('[FindSheltersPage] toggleWish error', err);
      // 기타 에러 사용자 알림
    }
  };

  const handleLoginConfirm = () => {
    setShowLoginModal(false);
    navigate('/auth');
  };

  const handleLoginCancel = () => {
    setShowLoginModal(false);
  };

  useEffect(
    () => {
      const checkScroll = () => {
        // 문서 높이가 뷰포트보다 크면 스크롤 존재
        setHasScroll(document.documentElement.scrollHeight > window.innerHeight);
      };
      checkScroll();
      window.addEventListener('resize', checkScroll);
      window.addEventListener('load', checkScroll);
      // 페이지 내용(예: shelters) 변경 시에도 확인되게끔 이벤트 외에 effect 의존성에서 처리
      return () => {
        window.removeEventListener('resize', checkScroll);
        window.removeEventListener('load', checkScroll);
      };
    },
    [
      /* 빈 배열로 mount 시와 resize/load 이벤트로만 체크; 필요 시 shelters 의존성 추가 */
    ],
  );

  if (isLoading) return <div css={pageContainerStyle(hasScroll)}>로딩 중...</div>;
  if (error)
    return (
      <div css={pageContainerStyle(hasScroll)}>
        <div css={emptyTextStyle}>근처 쉼터를 불러올 수 없습니다.</div>
      </div>
    );

  return (
    <>
      {shelters.length > 0 ? (
        <div css={pageContainerStyle(hasScroll)}>
          <ShelterList
            shelters={visibleShelters}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleWithApi} // 시그니처: (shelterId, isFavorite)
            onLoadMore={handleLoadMore}
            isFetchingMore={isFetchingMore}
          />
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
    </>
  );
};

export default FindSheltersPage;

const pageContainerStyle = (hasScroll: boolean) => css`
  position: relative;
  display: flex;
  flex-direction: column; /* 세로 스택: 카드가 자연스럽게 아래로 쌓이며 높이 확장 허용 */
  align-items: stretch; /* 내부 블록이 너비/높이를 자유롭게 가지도록 함 */
  width: 100%;
  box-sizing: border-box;
  padding-top: calc(${theme.spacing.spacing16} + env(safe-area-inset-top));
  background: white;
  /* 스크롤이 있을 때만 하단 안전영역 만큼 패딩 확보 */
  padding-bottom: ${hasScroll ? 'env(safe-area-inset-bottom)' : '0'};
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
