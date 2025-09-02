/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import './App.css';
import HomePage from './pages/homepage';
import NavBar from './pages/homepage/components/NavBar';
import theme from './styles/theme';

function App() {
  return (
    <div css={layoutStyle}>
      <NavBar />
      <main css={contentStyle}>
        <HomePage />
      </main>
    </div>
  );
}

export default App;

const layoutStyle = css`
  /* 앱 전체에 대한 스타일이 필요하다면 여기에 추가 */
`;

const contentStyle = css`
  /* NavBar의 높이만큼 상단에 여백을 주어 컨텐츠가 가려지지 않게 함 */
  padding-top: ${theme.spacing.spacing16};
`;
