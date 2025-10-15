/** @jsxImportSource @emotion/react */
import { css, Global } from '@emotion/react';
import './App.css';
import FindSheltersPage from './pages/FindSheltersPage';
import HomePage from './pages/HomePage';
import GuidePage from './pages/GuidePage';
import ShelterDetailPage from './pages/ShelterDetailPage';
import NavBar from './components/NavBar';
import { Route, Routes, useLocation } from 'react-router-dom';
import ScrollToTopButton from './components/ScrollToTopButton';
import { useEffect } from 'react';
import MyPage from './pages/MyPage';
import WishListPage from './pages/WishListPage';
import MyReviewPage from './pages/MyReviewPage';
import EditProfilePage from './pages/EditProfilePage';
import EditReviewPage from './pages/EditReviewPage';
import WriteReviewPage from './pages/WriteReviewPage';
import ErrorPage from './pages/ErrorPage';
import { ErrorBoundary } from 'react-error-boundary';
import AuthPage from './pages/AuthPage';
import ScrollToTop from './components/ScrollToTop';
import theme from './styles/theme';

// 에러 발생 시 보여줄 fallback 컴포넌트
function ErrorFallback({ error }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <ErrorPage
      status={500}
      error={'Internal Server Error'}
      message={error.message}
      path={window.location.pathname}
    />
  );
}

const App = () => {
  const location = useLocation();

  // 라우트 변경 시 스크롤 맨 위로 이동
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <>
      {/* 전역 스타일 정의 및 적용 */}
      <Global
        styles={css`
          html,
          body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            background: white;
            user-select: none; /* 텍스트 선택 비활성화 */
            /* Safe area 대응 */
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
    }
          }

          #root {
            position: relative;
            height: calc(100vh - ${theme.spacing.spacing32}); /* NavBar를 제외한 높이 */
            padding-top: ${theme.spacing.spacing16}; /* NavBar 높이만큼 패딩 추가 */

            margin: 0 auto;
            background: white;
            /* Safe area 대응 */
            padding-bottom: env(safe-area-inset-bottom);
          }

          * {
            outline: none !important;
            box-shadow: none !important;
            -webkit-tap-highlight-color: transparent !important;
          }

          button,
          img,
          input,
          textarea,
          a {
            outline: none !important;
            box-shadow: none !important;
            -webkit-tap-highlight-color: transparent !important;
          }

          button:focus,
          img:focus {
            outline: none; /* 포커스 시 나타나는 윤곽선 제거 */
            box-shadow: none; /* 포커스 시 나타나는 그림자 제거 */
          }

          button:active,
          img:active {
            outline: none; /* 활성화 상태에서 윤곽선 제거 */
            box-shadow: none; /* 활성화 상태에서 그림자 제거 */
          }

          button:focus-visible {
            outline: none; /* 브라우저 기본 focus-visible 스타일 제거 */
            box-shadow: none; /* 클릭 시 파란색 반응 제거 */
          }
        `}
      />
      <NavBar />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <div css={appContainerStyle}>
          <main>
            <Routes>
              {/* path="/": 기본 주소일 때 HomePage를 보여줌 */}
              <Route path="/" element={<HomePage />} />
              {/* path="/find-shelters": 주소창에 /find-shelters를 입력하면 FindSheltersPage를 보여줌. */}
              <Route path="/find-shelters" element={<FindSheltersPage />} />
              {/* path="/guide": 주소창에 /guide를 입력하면 GuidePage를 보여줌. */}
              <Route path="/guide" element={<GuidePage />} />
              {/* path="/shelter-detail/:id": 쉼터 상세 페이지 추가 */}
              <Route path="/shelter-detail/:id" element={<ShelterDetailPage />} />
              {/* path="/my-page": 마이페이지 추가 */}
              <Route path="/mypage" element={<MyPage />} />
              {/* path="/wishlist": 찜 목록 페이지 라우트 추가 */}
              <Route path="/wishlist" element={<WishListPage />} />
              {/* path="/myreviews": 내가 쓴 리뷰 목록 페이지 라우트 추가 */}
              <Route path="/myreviews" element={<MyReviewPage />} />
              {/* path="/edit-profile": 프로필 수정 페이지 추가 */}
              <Route path="/edit-profile" element={<EditProfilePage />} />
              {/* path="/edit-review/:id": 리뷰 수정 페이지 추가 */}
              <Route path="/edit-review/:id" element={<EditReviewPage />} />
              {/* path="/write-review/:shelterId": 리뷰 작성 페이지 추가 */}
              <Route path="/write-review/:shelterId" element={<WriteReviewPage />} />
              {/* path="/auth": 로그인/회원가입 페이지 추가 */}
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/error"
                element={
                  <ErrorPage
                    status={(location.state as any)?.status || 404}
                    error={(location.state as any)?.error || 'Not Found'}
                    message={(location.state as any)?.message || '페이지를 찾을 수 없습니다.'}
                    path={location.pathname}
                  />
                }
              />
            </Routes>
          </main>
          <ScrollToTopButton /> {/* 맨 위로 가기 버튼 */}
        </div>
      </ErrorBoundary>
      <ScrollToTop />
    </>
  );
};

export default App;

const appContainerStyle = css`
  width: 100%;
  height: 100%;
  padding-bottom: env(safe-area-inset-bottom);
`;
