/** @jsxImportSource @emotion/react */
import MapOverlayButtons from './components/MapOverlayButtons';
import MapView from './components/MapView';
import { getCurrentWeather } from '@/api/weatherApi';
import { useMap } from './hooks/useMap';
import theme from '@/styles/theme';
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';

const HomePage = () => {
  const { handleMapReady, handleMyLocation, handleInitialLocation } = useMap();
  const [] = useState<any[]>([]);
  const [weather, setWeather] = useState<any | null>(null);
  const [, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!navigator.geolocation) {
      setWeatherError('위치 정보 미지원');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (!mounted) return;
        try {
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
          console.error('위치 기반 초기화 실패', err);
        }
      },
      (err) => {
        console.warn('geolocation 에러', err);
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
      {weather && (
        <div css={weatherBox}>
          <div css={weatherTemp}>{weather.temperature.toFixed(1)}°C</div>
        </div>
      )}
      {/* MapView 내부에서 바운딩 박스 기반으로 쉼터 조회 수행 */}
      <MapView onMapReady={handleMapReady} onUpdateMyLocation={handleInitialLocation} />
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
