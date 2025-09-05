/** @jsxImportSource @emotion/react */
import { css, Global } from '@emotion/react';
import './App.css';
import FindSheltersPage from './pages/FindSheltersPage';
import HomePage from './pages/HomePage';
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
          }

          #root {
            position: relative;
            height: calc(100vh - ${theme.spacing.spacing16}); /* NavBar를 제외한 높이 */
            padding-top: ${theme.spacing.spacing16}; /* NavBar 높이만큼 패딩 추가 */
            margin: 0 auto;
            background: white;
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
