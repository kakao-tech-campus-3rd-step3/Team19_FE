/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import NavBar from './components/NavBar';

const HomePage = () => {
  return (
    <div>
      <NavBar />
      {/* 여기에 지도 및 다른 UI 컴포넌트가 추가될 예정 */}
      <div id="map" css={mapStyle}></div>
      <div css={otherContentStyle}>{/* '내위치 & 가까운 쉼터 찾기' 버튼 등 */}</div>
    </div>
  );
};

export default HomePage;

const mapStyle = css`
  /* 지도 스타일 */
`;

const otherContentStyle = css`
  /* 하단 슬라이드 정보 등 */
`;
