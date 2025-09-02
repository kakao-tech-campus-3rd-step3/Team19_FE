/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useRef } from 'react';
import MapOverlayButtons from './components/MapOverlayButtons';
import MapView from './components/MapView';
import { nearbyShelters } from '../../mock/nearbyShelters';
import theme from '../../styles/theme';

const HomePage = () => {
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);

  const handleMapReady = (map: kakao.maps.Map) => {
    mapInstanceRef.current = map;
  };

  const handleMyLocation = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const locPosition = new kakao.maps.LatLng(lat, lng);

          // 지도 중심 이동
          map.setCenter(locPosition);

          const marker = new kakao.maps.Marker({
            position: locPosition,
          });
          marker.setMap(map);
        },
        (error) => {
          console.error('위치 정보를 가져올 수 없습니다:', error);
        },
      );
    } else {
      alert('이 브라우저에서는 위치 정보가 지원되지 않습니다.');
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
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
  height: calc(100vh - ${theme.spacing.spacing16});
  padding-top: ${theme.spacing.spacing16};
  margin: 0 auto;
  background: #fff;
`;
