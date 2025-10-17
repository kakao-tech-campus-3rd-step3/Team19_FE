/** @jsxImportSource @emotion/react */
import MapOverlayButtons from './components/MapOverlayButtons';
import MapView from './components/MapView';
import { nearbyShelters } from '@/mock/nearbyShelters';
import { useMap } from './hooks/useMap';
import theme from '@/styles/theme';
import { css } from '@emotion/react';

const HomePage = () => {
  // useMap에서 지도 준비 및 내 위치 이동 함수 가져오기
  const { handleMapReady, handleMyLocation, handleInitialLocation } = useMap();

  return (
    <div css={containerStyle}>
      {/* 지도 준비 시 handleMapReady를 넘기고, 쉼터 마커는 그대로 */}
      <MapView
        onMapReady={handleMapReady}
        onUpdateMyLocation={handleInitialLocation}
        shelters={nearbyShelters}
      />
      {/* 내 위치 버튼 클릭 시 handleMyLocation 호출 */}
      <MapOverlayButtons onMyLocation={handleMyLocation} />
    </div>
  );
};

export default HomePage;

const containerStyle = css`
  width: 100%;
  display: flex;
  height: calc(100vh - ${theme.spacing.spacing16});
  padding-top: ${theme.spacing.spacing16};
  overflow: hidden;
  position: relative;
`;
