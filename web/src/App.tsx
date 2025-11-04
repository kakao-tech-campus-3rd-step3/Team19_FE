/** @jsxImportSource @emotion/react */
import { css, Global } from '@emotion/react';
import './App.css';
import FindSheltersPage from './pages/FindSheltersPage';
import HomePage from './pages/HomePage';
import GuidePage from './pages/GuidePage';
import ShelterDetailPage from './pages/ShelterDetailPage';
import NavBar from './components/NavBar';
import { Route, Routes, useLocation } from 'react-router-dom';
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
import MapCache from '@/lib/MapCache';

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

  // 앱 시작 시 선제적으로 토큰 재발급 시도 (7일 내 로그인 유지)
  useEffect(() => {
    tryReissueTokensSilently().catch(() => {
      // 실패해도 조용히 처리 (이미 함수 내부에서 처리됨)
    });
  }, []); // 마운트 시 한 번만 실행

  // 라우트 변경 시 스크롤 맨 위로 이동
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  // GuidePage에서는 NavBar를 자체적으로 렌더링하므로 여기서는 제외
  const shouldShowNavBar = location.pathname !== '/guide';

  // 앱 시작 시 Tmap SDK 로드 및 백그라운드 맵 초기화 (한 번만)
  useEffect(() => {
    (async () => {
      try {
        const sdkOk = await MapCache.ensureSDKReady(20000);
        if (!sdkOk) return;

        // 사용자 위치 얻기 시도 (타임아웃 3000ms). 실패 시 null 반환
        const getUserCoords = async (): Promise<{ lat: number; lng: number } | null> => {
          if (!navigator.geolocation) return null;
          return new Promise((resolve) => {
            let resolved = false;
            const onSuccess = (pos: GeolocationPosition) => {
              if (resolved) return;
              resolved = true;
              resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            };
            const onError = () => {
              if (resolved) return;
              resolved = true;
              resolve(null);
            };
            navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 3000 });
            // 안전 타임아웃 (브라우저가 콜백을 안줄 경우 대비)
            setTimeout(() => {
              if (resolved) return;
              resolved = true;
              resolve(null);
            }, 3200);
          });
        };

        const coords = await getUserCoords();
        const root = document.getElementById('map-root') ?? MapCache.getPersistentRoot();

        // 생성 시 가능한 경우 사용자의 좌표로 생성, 아니면 서울 폴백
        const centerLat = coords?.lat ?? 37.5665;
        const centerLng = coords?.lng ?? 126.978;

        await MapCache.ensureMap(root as HTMLElement, () => {
          return new (window as any).Tmapv3.Map(root as HTMLElement, {
            center: new (window as any).Tmapv3.LatLng(centerLat, centerLng),
            width: '1px',
            height: '1px',
            zoom: 13,
            zoomControl: false,
            scrollwheel: false,
          });
        });

        // 이미 맵이 만들어진 후 동적으로 위치 보정이 필요하면 강제 setCenter
        try {
          const map = MapCache.map as any;
          if (map && coords) {
            map.setCenter(new (window as any).Tmapv3.LatLng(coords.lat, coords.lng));
          }
        } catch {}
      } catch (err) {
        console.warn('앱 레벨 맵 초기화 실패:', err);
      }
    })();
  }, []);

  return (
    <>
      {/* 전역 스타일 정의 및 적용 */}
      <Global
        styles={css`
          html,
          body,
          #root {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            background: white;
            user-select: none;
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
      {/* Persistent map container: 앱 전체에서 언마운트되지 않도록 최상단에 고정 */}
      <div id="map-root" data-persistent-map-root />
      {shouldShowNavBar && <NavBar />}
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <div css={appContainerStyle} data-scroll-container>
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
        </div>
        {/* <ScrollToTopButton /> 맨 위로 가기 버튼 => 없는게 좋을 듯 합니다 */}
      </ErrorBoundary>
      <ScrollToTop />
    </>
  );
};

export default App;

const appContainerStyle = css`
  width: 100%;
  height: 100%;
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  max-width: 500px; // App.css의 루트(#root) 레이아웃 너비와 동일하게 설정하여 좌우가 튀어나가지 않도록 함
  overflow: auto;
`;
