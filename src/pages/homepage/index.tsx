/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useRef } from 'react';
import NavBar from './components/NavBar';
import MapOverlayButtons from './components/MapOverlayButtons';
import MapView from './components/MapView';

const HomePage = () => {
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);

  const handleMapReady = (map: kakao.maps.Map) => {
    mapInstanceRef.current = map;
  };

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
        <MapView onMapReady={handleMapReady} />
        <MapOverlayButtons onMyLocation={handleMyLocation} />
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
