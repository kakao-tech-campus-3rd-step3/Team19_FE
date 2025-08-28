/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useRef } from 'react';
import NavBar from './components/NavBar';
import MapOverlayButtons from './components/MapOverlayButtons';
import MapView from './components/MapView';
import { nearbyShelters } from '../../mock/nearbyShelters';

const HomePage = () => {
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);

  const handleMapReady = (map: kakao.maps.Map) => {
    mapInstanceRef.current = map;
  };

  const handleMyLocation = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
  };

  return (
    <div>
      <NavBar />
      <div css={mapWrapperStyle}>
        <MapView onMapReady={handleMapReady} shelters={nearbyShelters} />
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
