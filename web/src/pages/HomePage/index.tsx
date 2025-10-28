/** @jsxImportSource @emotion/react */
import MapOverlayButtons from './components/MapOverlayButtons';
import MapView from './components/MapView';
import { getNearbyShelters } from '@/api/shelterApi';
import { getCurrentWeather } from '@/api/weatherApi';
import { useMap } from './hooks/useMap';
import theme from '@/styles/theme';
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';

const HomePage = () => {
  // useMap에서 지도 준비 및 내 위치 이동 함수 가져오기
  const { handleMapReady, handleMyLocation, handleInitialLocation } = useMap();
  const [shelters, setShelters] = useState<any[]>([]);
  const [, setShelterError] = useState<string | null>(null);
  const [weather, setWeather] = useState<any | null>(null);
  const [, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!navigator.geolocation) {
      setShelterError('위치 정보 미지원');
      setWeatherError('위치 정보 미지원');
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
          // 현재 위치 기반 기온 조회
          try {
            const w = await getCurrentWeather({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
            if (!mounted) return;
            setWeather(w);
          } catch (we) {
            console.error('getCurrentWeather 실패', we);
            setWeatherError('날씨 조회 실패');
          }
        } catch (err) {
          console.error('getNearbyShelters 실패', err);
          setShelterError('쉼터 조회 실패');
        }
      },
      (err) => {
        console.warn('geolocation 에러', err);
        setShelterError('위치 권한 거부 또는 오류');
        setWeatherError('위치 권한 거부 또는 오류');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div css={containerStyle}>
      {/* 좌측 상단 날씨 표시 */}
      {weather && (
        <div css={weatherBox}>
          <div css={weatherTemp}>{weather.temperature.toFixed(1)}°C</div>
        </div>
      )}
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
  height: calc(
    100vh - ${theme.spacing.spacing16} - env(safe-area-inset-bottom) - env(safe-area-inset-top)
  );
  padding-top: calc(${theme.spacing.spacing16} + env(safe-area-inset-top));
  overflow: hidden;
  position: relative;
`;

/* 좌측 상단 날씨 박스 */
const weatherBox = css`
  position: absolute;
  left: 6px;
  top: calc(${theme.spacing.spacing16} + env(safe-area-inset-top));

  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const weatherTemp = css`
  font-weight: 700;
  font-size: 2.3rem;
  color: #ff7700ff;
`;
