/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef } from 'react';
import NavBar from './components/NavBar';

const HomePage = () => {
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) return;

    window.kakao.maps.load(() => {
      const container = document.getElementById('map');
      if (!container) return;

      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.978),
        level: 3,
      };

      const map = new window.kakao.maps.Map(container, options);
      mapInstanceRef.current = map;
    });
  }, []);

  const handleMyLocation = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!navigator.geolocation) {
      alert('이 브라우저에서는 위치 기능을 지원하지 않아요.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const here = new window.kakao.maps.LatLng(latitude, longitude);
        map.setCenter(here);
        const marker = new window.kakao.maps.Marker({ position: here });
        marker.setMap(map);
      },
      () => alert('위치 권한을 허용해 주세요. (HTTPS 환경 권장)'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div>
      <NavBar />
      <div css={mapWrapperStyle}>
        <div id="map" css={mapStyle}></div>
        <div css={overlayButtonStyle}>
          <button css={myLocationButtonStyle} onClick={handleMyLocation}>
            내위치
          </button>
          <button css={findShelterButtonStyle}>가까운 쉼터 찾기</button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

// 지도와 버튼을 감싸는 래퍼
const mapWrapperStyle = css`
  position: relative;
  width: 100vw;
  max-width: 720px;
  height: 100vh;
  margin: 0 auto;
  background: #fff;
`;

// 지도 스타일
const mapStyle = css`
  width: 100%;
  height: 100%;
  margin: 0;
`;

// 버튼 오버레이 스타일
const overlayButtonStyle = css`
  position: absolute;
  left: 50%;
  bottom: 2rem;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column; // 세로 정렬
  align-items: stretch;
  z-index: 10;
`;

// 내 위치 버튼 스타일
const myLocationButtonStyle = css`
  align-self: flex-end;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  width: 8rem;
  min-width: 7rem;
  padding: 0.5rem 0.5rem;
  background-color: #337afdff;
  color: white;
  border: 1px solid #ccccccff;
  border-radius: 20px;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 0.75rem; // 아래 버튼과 간격
`;

// 쉼터 찾기 버튼 스타일
const findShelterButtonStyle = css`
  width: 100%;
  min-width: 425px;
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
