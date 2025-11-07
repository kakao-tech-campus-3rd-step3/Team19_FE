/** @jsxImportSource @emotion/react */
import MapOverlayButtons from './components/MapOverlayButtons';
import MapView from './components/MapView';
import { getCurrentWeather } from '@/api/weatherApi';
import { useMap } from './hooks/useMap';
import theme from '@/styles/theme';
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { FaTemperatureHalf, FaTemperatureArrowUp, FaTemperatureArrowDown } from 'react-icons/fa6';

const HomePage = () => {
  const { handleMapReady, handleMyLocation, handleInitialLocation } = useMap();
  const [] = useState<any[]>([]);
  const [weather, setWeather] = useState<any | null>(null);
  const [, setWeatherError] = useState<string | null>(null);

  // 온도 구간 및 색상 (요청하신 명세 반영)
  // 35°C 이상: 진한 빨강 (#FF0000)
  // 25~34°C: 주황 (#FFA500)
  // 18~24°C: 청록 (#00C2A8)
  // 17°C 이하: 파랑 (#1E90FF)
  const getTempColor = (t: number | null | undefined) => {
    if (typeof t !== 'number' || Number.isNaN(t)) return '#000000';
    if (t >= 35) return '#FF0000';
    if (t >= 25) return '#FFA500';
    if (t >= 18) return '#00a323ff';
    return '#1E90FF';
  };

  // 아이콘 매핑: 온도 범위에 따라 아이콘 선택
  const getTempIcon = (t: number | null | undefined) => {
    if (typeof t !== 'number' || Number.isNaN(t)) return FaTemperatureHalf;
    if (t >= 35) return FaTemperatureArrowUp; // 매우 덥다
    if (t >= 25) return FaTemperatureArrowUp; // 따뜻/덥다 (주황)
    if (t >= 18) return FaTemperatureHalf; // 쾌적 (청록)
    return FaTemperatureArrowDown; // 춥다
  };

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

  // badgeSize를 변경하면 아이콘과 글자 크기가 같이 바뀝니다.
  const badgeSize = '2.5rem';
  const tempSize = '2.2rem';

  return (
    <div css={containerStyle}>
      {weather && (
        <div css={weatherBox}>
          <div css={weatherBadge}>
            {(() => {
              const Icon = getTempIcon(weather.temperature);
              // 아이콘과 텍스트를 같은 크기로 맞추기: badgeSize를 fontSize로 사용
              return (
                <div css={weatherIconBox} style={{ width: badgeSize, height: badgeSize }}>
                  <Icon style={{ fontSize: badgeSize, color: getTempColor(weather.temperature) }} />
                </div>
              );
            })()}
            <div
              css={weatherTemp}
              style={{
                color: getTempColor(weather.temperature),
                fontSize: tempSize,
                lineHeight: 1,
              }}
            >
              {Math.trunc(Number(weather.temperature))}°
            </div>
          </div>
        </div>
      )}
      {/* MapView 내부에서 바운딩 박스 기반으로 쉼터 조회 수행 */}
      <MapView onMapReady={handleMapReady} onUpdateMyLocation={handleInitialLocation} />
      <MapOverlayButtons onMyLocation={handleMyLocation} />
    </div>
  );
};

export default HomePage;

const weatherBadge = css`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(4px);
`;

const weatherIconBox = css`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  flex: 0 0 auto;
`;

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
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const weatherTemp = css`
  font-weight: 800;
  /* font-size은 badgeSize로 인라인에서 제어합니다 */
  /* 글자 색상은 inline 스타일(getTempColor)로 제어합니다 */
  color: inherit;
  padding: 0;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
`;
