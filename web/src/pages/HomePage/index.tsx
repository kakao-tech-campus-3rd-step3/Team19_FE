/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import MapOverlayButtons from './components/MapOverlayButtons';
import MapView from './components/MapView';
import { nearbyShelters } from '../../mock/nearbyShelters';
import theme from '../../styles/theme';
import { useMap } from './hooks/useMap';

const HomePage = () => {
  const { handleMapReady, handleMyLocation } = useMap();

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
