/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import NavBar from './components/NavBar';

const HomePage = () => {
  return (
    <div>
      <NavBar />
      {/* 여기에 지도 및 다른 UI 컴포넌트가 추가될 예정 */}
      <div id="map" css={mapStyle}></div>
      <div css={otherContentStyle}>
        {/* '내위치 & 가까운 쉼터 찾기' 버튼 등 */}
        <button css={findShelterButtonStyle}>가까운 쉼터 찾기</button>
      </div>
    </div>
  );
};

export default HomePage;

const mapStyle = css`
  width: 100%;
  height: 500px;
  /* 지도 스타일 */
`;

const otherContentStyle = css`
  /* 하단 슬라이드 정보 등 */
`;

const findShelterButtonStyle = css`
  width: 100%;
  padding: 1.25rem 1rem;
  background-color: black;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 2.6rem;
  font-weight: bold;
  cursor: pointer;

  // 720px 이상의 화면에서는 스타일을 조절합니다.
  @media (min-width: 720px) {
    width: 650px;
    padding: 1rem 1rem;
    font-size: 4rem;
  }
`;
