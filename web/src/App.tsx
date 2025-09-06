/** @jsxImportSource @emotion/react */
import { css, Global } from '@emotion/react';
import './App.css';
import FindSheltersPage from './pages/FindSheltersPage';
import HomePage from './pages/HomePage';
import GuidePage from './pages/GuidePage';
import ShelterDetailPage from './pages/ShelterDetailPage';
import NavBar from './pages/HomePage/components/NavBar';
import { Route, Routes } from 'react-router-dom';
import theme from './styles/theme';

const App = () => {
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
          }

          #root {
            position: relative;
            height: calc(100vh - ${theme.spacing.spacing16}); /* NavBar를 제외한 높이 */
            padding-top: ${theme.spacing.spacing16}; /* NavBar 높이만큼 패딩 추가 */
            margin: 0 auto;
            background: white;
          }

          button,
          img {
            outline: none; /* 클릭 시 나타나는 윤곽선 제거 */
            box-shadow: none; /* 클릭 시 나타나는 그림자 제거 */
            -webkit-tap-highlight-color: transparent; /* 모바일 클릭 반응 제거 */
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
      <div css={appContainerStyle}>
        <NavBar />
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
          </Routes>
        </main>
      </div>
    </>
  );
};

export default App;

const appContainerStyle = css`
  width: 100%;
  height: 100%;
`;
