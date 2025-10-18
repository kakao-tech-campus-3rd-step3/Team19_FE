/** @jsxImportSource @emotion/react */
import MapOverlayButtons from './components/MapOverlayButtons';
import MapView from './components/MapView';
import { getNearbyShelters } from '@/api/shelterApi';
import { useMap } from './hooks/useMap';
import theme from '@/styles/theme';
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';

const HomePage = () => {
  // useMap에서 지도 준비 및 내 위치 이동 함수 가져오기
  const { handleMapReady, handleMyLocation, handleInitialLocation } = useMap();
  const [shelters, setShelters] = useState<any[]>([]);
  const [, setShelterError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!navigator.geolocation) {
      setShelterError('위치 정보 미지원');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (!mounted) return;
        try {
          const res = await getNearbyShelters({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          const list = Array.isArray(res) ? res : (res?.items ?? res?.shelters ?? res?.data ?? []);
          if (!mounted) return;
          setShelters(list);
        } catch (err) {
          console.error('getNearbyShelters 실패', err);
          setShelterError('쉼터 조회 실패');
        }
      },
      (err) => {
        console.warn('geolocation 에러', err);
        setShelterError('위치 권한 거부 또는 오류');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div css={containerStyle}>
      {/* 지도 준비 시 handleMapReady를 넘기고, 쉼터 마커는 그대로 */}
      <MapView
        onMapReady={handleMapReady}
        onUpdateMyLocation={handleInitialLocation}
        shelters={shelters}
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
  height: calc(100vh - ${theme.spacing.spacing16} - env(safe-area-inset-bottom));
  padding-top: ${theme.spacing.spacing16};
  overflow: hidden;
  position: relative;
`;
