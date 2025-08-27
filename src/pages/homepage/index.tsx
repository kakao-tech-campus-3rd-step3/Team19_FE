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
        <button css={myLocationButtonStyle}>내위치</button>
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
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end; /* 모든 버튼을 오른쪽으로 정렬 */
`;

// 내 위치 버튼 스타일
const myLocationButtonStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  width: 8rem;
  padding: 0.5rem 0.5rem;
  background-color: #337afdff;
  color: white;
  border: 1px solid #ccccccff;
  border-radius: 20px;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 0.75rem; /* 아래 버튼과 간격 */
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
