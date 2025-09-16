/** @jsxImportSource @emotion/react */
import { useEffect, useRef, useState } from 'react';
import { css } from '@emotion/react';
import { useLocation } from 'react-router-dom';
import { nearbyShelters } from '@/mock/nearbyShelters';
import theme from '@/styles/theme';

// TMAP SDK 타입 정의
declare global {
  interface Window {
    Tmapv3: any;
  }
}

interface LocationState {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface Shelter {
  shelterId: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: string;
  isOutdoors: boolean;
  operatingHours: {
    weekday: string;
    weekend: string;
  };
  averageRating: number;
  photoUrl: string;
}

interface RouteInfo {
  totalDistance: number; // 미터
  totalTime: number; // 초
}

interface RouteData {
  type: string;
  features: Array<{
    type: string;
    geometry: {
      type: string;
      coordinates: number[][] | number[][][];
    };
    properties: {
      index?: number;
      lineIndex?: number;
      pointIndex?: number;
      totalDistance?: number;
      totalTime?: number;
      distance?: number;
      time?: number;
      turnType?: number;
      pointType?: string;
      description?: string;
      name?: string;
    };
  }>;
}

const GuidePage = () => {
  const location = useLocation();
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<any>(null);
  
  // 위치 정보 상태
  const [currentLocation, setCurrentLocation] = useState<LocationState | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentLocationMarker, setCurrentLocationMarker] = useState<any>(null);
  
  // 타겟 대피소 정보 상태
  const [targetShelter, setTargetShelter] = useState<Shelter | null>(null);
  const [shelterMarker, setShelterMarker] = useState<any>(null);

  // 경로 정보 상태
  const [routeData, setRouteData] = useState<RouteData | null>(null); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [routePolyline, setRoutePolyline] = useState<any>(null);
  console.log('routeData 상태:', routeData);
  
  // 타겟 대피소 초기화
  useEffect(() => {
    // 라우터 state에서 대피소 정보 확인
    const routerState = location.state as { targetShelter?: Shelter } | null;
    
    if (routerState?.targetShelter) {
      console.log('전달받은 타겟 대피소:', routerState.targetShelter);
      setTargetShelter(routerState.targetShelter);
    } else {
      // 기본 대피소 설정 (첫 번째 대피소)
      const defaultShelter = nearbyShelters[0];
      console.log('기본 타겟 대피소 설정:', defaultShelter);
      setTargetShelter(defaultShelter);
    }
  }, [location.state]);

  // TMAP SDK 준비 상태 확인 함수
  const waitForTmapSDK = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 30; // 3초 대기
      
      const checkSDK = () => {
        attempts++;
        console.log(`TMAP SDK 확인 시도 ${attempts}/${maxAttempts}`);
        
        if (window.Tmapv3 && window.Tmapv3.Map) {
          console.log('TMAP SDK 준비 완료');
          resolve();
        } else if (attempts >= maxAttempts) {
          console.error('TMAP SDK 로드 시간 초과');
          reject(new Error('TMAP SDK 로드 시간이 초과되었습니다. 페이지를 새로고침해 주세요.'));
        } else {
          setTimeout(checkSDK, 100);
        }
      };
      
      checkSDK();
    });
  };

  // 현재 위치 획득 함수
  const getCurrentLocation = (): Promise<LocationState> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('이 브라우저는 위치 서비스를 지원하지 않습니다.'));
        return;
      }

      console.log('현재 위치 요청 시작');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: LocationState = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          console.log('현재 위치 획득 성공:', location);
          resolve(location);
        },
        (error) => {
          let errorMessage = '위치를 가져올 수 없습니다.';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = '위치 접근 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해 주세요.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = '위치 정보를 사용할 수 없습니다.';
              break;
            case error.TIMEOUT:
              errorMessage = '위치 요청 시간이 초과되었습니다.';
              break;
          }
          
          console.error('위치 획득 실패:', errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5분
        }
      );
    });
  };

  // 현재 위치 마커 생성/업데이트 함수
  const updateCurrentLocationMarker = (location: LocationState) => {
    if (!map || !window.Tmapv3) return;

    // 기존 마커 제거
    if (currentLocationMarker) {
      currentLocationMarker.setMap(null);
    }

    // 새 마커 생성
    const marker = new window.Tmapv3.Marker({
      position: new window.Tmapv3.LatLng(location.latitude, location.longitude),
      // 기본 원형 아이콘 사용 (이미지 경로 없이)
      color: "#007bff", // 파란색으로 설정
      iconSize: new window.Tmapv3.Size(24, 24),
      map: map
    });

    setCurrentLocationMarker(marker);
    console.log('현재 위치 마커 업데이트 완료');
  };

  // 대피소 마커 생성/업데이트 함수
  const updateShelterMarker = (shelter: Shelter) => {
    if (!map || !window.Tmapv3) return;

    console.log('대피소 마커 업데이트 시작:', shelter.name);

    // 기존 마커 제거
    if (shelterMarker) {
      shelterMarker.setMap(null);
    }

    // 새 마커 생성
    const marker = new window.Tmapv3.Marker({
      position: new window.Tmapv3.LatLng(shelter.latitude, shelter.longitude),
      color: "#dc3545", // 빨간색으로 설정 (대피소)
      iconSize: new window.Tmapv3.Size(28, 28),
      map: map
    });

    // 마커에 정보 윈도우 추가
    const infoWindow = new window.Tmapv3.InfoWindow({
      position: new window.Tmapv3.LatLng(shelter.latitude, shelter.longitude),
      content: `
        <div style="padding: 8px; min-width: 200px; font-family: Arial, sans-serif;">
          <h4 style="margin: 0 0 8px 0; color: #333; font-size: 14px;">${shelter.name}</h4>
          <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">📍 ${shelter.address}</p>
          <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">📏 ${shelter.distance}</p>
          <p style="margin: 0; color: #666; font-size: 12px;">⭐ ${shelter.averageRating}</p>
        </div>
      `,
      type: 1,
      visible: true
    });

    infoWindow.setMap(map);

    setShelterMarker(marker);
    console.log('대피소 마커 업데이트 완료');
  };

  // 지도 중심을 현재 위치로 이동
  const moveMapToCurrentLocation = (location: LocationState) => {
    if (!map) return;

    const center = new window.Tmapv3.LatLng(location.latitude, location.longitude);
    map.setCenter(center);
    map.setZoom(18); // 현재 위치는 더 가깝게
    
    console.log('지도 중심 이동 완료:', location);
  };

  // 현재 위치와 대피소를 모두 포함하는 영역으로 지도 조정
  const fitMapToBounds = (userLocation: LocationState, shelter: Shelter) => {
    if (!map || !window.Tmapv3) return;

    console.log('지도 영역 조정 시작');

    // 경계 영역 계산
    const bounds = new window.Tmapv3.LatLngBounds();
    bounds.extend(new window.Tmapv3.LatLng(userLocation.latitude, userLocation.longitude));
    bounds.extend(new window.Tmapv3.LatLng(shelter.latitude, shelter.longitude));

    // 여백을 위한 padding 설정
    const padding = {
      top: 80,
      right: 50,
      bottom: 120,
      left: 50
    };

    map.fitBounds(bounds, padding);
    console.log('지도 영역 조정 완료');
  };

  // 보행자 경로 계산 API 호출
  const calculatePedestrianRoute = async (start: LocationState, destination: Shelter): Promise<RouteData> => {
    console.log('보행자 경로 계산 시작:', { start, destination });

    const requestBody = {
      startX: start.longitude,
      startY: start.latitude,
      endX: destination.longitude,
      endY: destination.latitude,
      startName: "현재위치",
      endName: destination.name,
      searchOption: 0, // 추천 경로
      reqCoordType: "WGS84GEO",
      resCoordType: "WGS84GEO"
    };

    console.log('API 요청 데이터:', requestBody);

    const response = await fetch('https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1', {
      method: 'POST',
      headers: {
        'appKey': import.meta.env.VITE_TMAP_APP_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 응답 에러:', response.status, errorText);
      throw new Error(`경로 계산 실패: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API 응답 성공:', data);
    return data;
  };

  // 경로를 지도에 표시
  const displayRouteOnMap = (routeData: RouteData) => {
    if (!map || !window.Tmapv3) return;

    console.log('경로 표시 시작');

    // 기존 경로 라인 제거
    if (routePolyline) {
      routePolyline.setMap(null);
    }

    // 경로 좌표 배열 생성
    const pathCoordinates: any[] = [];

    // GeoJSON features에서 LineString만 추출
    routeData.features.forEach(feature => {
      if (feature.geometry.type === 'LineString') {
        const coordinates = feature.geometry.coordinates as number[][];
        coordinates.forEach(coord => {
          // [경도, 위도] 형태를 Tmapv3.LatLng로 변환
          pathCoordinates.push(new window.Tmapv3.LatLng(coord[1], coord[0]));
        });
      }
    });

    console.log('경로 좌표 개수:', pathCoordinates.length);

    if (pathCoordinates.length > 0) {
      // Polyline 생성
      const polyline = new window.Tmapv3.Polyline({
        path: pathCoordinates,
        strokeColor: "#FF0000", // 빨간색 경로
        strokeWeight: 6,
        strokeOpacity: 0.8,
        map: map
      });

      setRoutePolyline(polyline);
      console.log('경로 표시 완료');
    } else {
      console.warn('경로 좌표를 찾을 수 없습니다.');
    }
  };

  // 경로 정보 추출 및 업데이트
  const extractRouteInfo = (routeData: RouteData): RouteInfo => {
    // 출발지 정보에서 totalDistance와 totalTime 추출
    const startFeature = routeData.features.find(feature => 
      feature.properties.pointType === 'SP' || feature.properties.totalDistance
    );

    const totalDistance = startFeature?.properties.totalDistance || 0;
    const totalTime = startFeature?.properties.totalTime || 0;

    console.log('경로 정보:', { totalDistance, totalTime });

    return { totalDistance, totalTime };
  };

  // 현재 위치 획득 및 지도 업데이트
  const handleGetCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      setLocationError(null);

      const location = await getCurrentLocation();
      setCurrentLocation(location);
      
      // 지도가 준비되어 있으면 즉시 업데이트
      if (map) {
        updateCurrentLocationMarker(location);
        moveMapToCurrentLocation(location);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '위치 획득에 실패했습니다.';
      setLocationError(errorMessage);
    } finally {
      setLocationLoading(false);
    }
  };

  // 경로 계산 및 표시 메인 함수
  const handleCalculateRoute = async (start: LocationState, destination: Shelter) => {
    try {
      setRouteLoading(true);
      setRouteError(null);
      
      console.log('경로 계산 시작');
      
      // 기존 경로 정보 초기화
      setRouteData(null);
      setRouteInfo(null);

      // API 호출
      const routeResult = await calculatePedestrianRoute(start, destination);
      setRouteData(routeResult);

      // 경로 정보 추출
      const routeInfoResult = extractRouteInfo(routeResult);
      setRouteInfo(routeInfoResult);

      // 지도에 경로 표시
      displayRouteOnMap(routeResult);

      console.log('경로 계산 및 표시 완료');

    } catch (err) {
      console.error('경로 계산 실패:', err);
      const errorMessage = err instanceof Error ? err.message : '경로 계산에 실패했습니다.';
      setRouteError(errorMessage);
    } finally {
      setRouteLoading(false);
    }
  };

  // 지도 초기화 함수 (위치 기반)
  const initializeMapWithLocation = (location?: LocationState | null): Promise<void> => {
    return new Promise((resolve, reject) => {
      console.log('지도 초기화 시작', location ? '- 현재 위치 기준' : '- 서울 기준');
      
      if (!mapRef.current) {
        reject(new Error('지도 컨테이너를 찾을 수 없습니다.'));
        return;
      }

      if (!window.Tmapv3 || !window.Tmapv3.Map) {
        reject(new Error('TMAP SDK가 준비되지 않았습니다.'));
        return;
      }

      try {
        // 현재 위치가 있으면 그 위치를, 없으면 서울시청을 기본 좌표로 사용
        const center = location 
          ? new window.Tmapv3.LatLng(location.latitude, location.longitude)
          : new window.Tmapv3.LatLng(37.566481622437934, 126.98502302169841);
        
        const mapInstance = new window.Tmapv3.Map(mapRef.current, {
          center: center,
          width: '100%',
          height: '100%',
          zoom: location ? 17 : 15, // 현재 위치가 있으면 더 가깝게
          zoomControl: true,
          scrollwheel: true
        });

        setMap(mapInstance);
        console.log('지도 초기화 완료');
        resolve();
      } catch (err) {
        console.error('지도 초기화 실패:', err);
        reject(err);
      }
    });
  };

  useEffect(() => {
    let isMounted = true; // 컴포넌트 마운트 상태 추적

    const setupMap = async () => {
      try {
        if (!isMounted) return;
        
        setIsLoading(true);
        setError(null);
        
        // TMAP SDK 준비 상태 확인
        await waitForTmapSDK();
        
        if (!isMounted) return;
        
        // DOM이 준비될 때까지 약간 대기
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!isMounted) return;
        
        // 먼저 현재 위치 획득 시도
        let currentLocationData: LocationState | null = null;
        try {
          console.log('초기 위치 획득 시작');
          setLocationLoading(true);
          currentLocationData = await getCurrentLocation();
          setCurrentLocation(currentLocationData);
          console.log('초기 위치 획득 완료:', currentLocationData);
        } catch (locationErr) {
          console.warn('초기 위치 획득 실패, 서울로 기본 설정:', locationErr);
        } finally {
          setLocationLoading(false);
        }
        
        if (!isMounted) return;
        
        // 현재 위치 기반으로 지도 초기화
        await initializeMapWithLocation(currentLocationData);
        
        if (!isMounted) return;
        
        // 현재 위치가 있으면 즉시 마커 표시
        if (currentLocationData) {
          updateCurrentLocationMarker(currentLocationData);
        }
        
      } catch (err) {
        console.error('지도 설정 실패:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : '지도 로드에 실패했습니다.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    setupMap();

    // cleanup 함수
    return () => {
      isMounted = false;
    };
  }, []);

  // 지도가 준비되고 타겟 대피소가 있을 때 대피소 마커 표시
  useEffect(() => {
    if (map && targetShelter) {
      updateShelterMarker(targetShelter);
    }
  }, [map, targetShelter]);

  // 지도가 준비되었고 현재 위치가 있을 때 마커와 중심 위치 업데이트
  useEffect(() => {
    if (map && currentLocation) {
      updateCurrentLocationMarker(currentLocation);
      
      // 타겟 대피소가 있으면 둘 다 보이도록 영역 조정, 없으면 현재 위치로 이동
      if (targetShelter) {
        fitMapToBounds(currentLocation, targetShelter);
      } else {
        moveMapToCurrentLocation(currentLocation);
      }
    }
  }, [map, currentLocation, targetShelter]);

  // 현재 위치와 타겟 대피소가 모두 준비되면 경로 계산
  useEffect(() => {
    if (currentLocation && targetShelter && map) {
      console.log('조건 충족 - 자동 경로 계산 시작');
      handleCalculateRoute(currentLocation, targetShelter);
    }
  }, [currentLocation, targetShelter, map]);

  if (error) {
    return (
      <div css={containerStyle}>
        <div css={errorStyle}>
          <h2>❌ 오류 발생</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            css={retryButtonStyle}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

    return (
      <div css={containerStyle}>
        {/* 지도 컨테이너 */}
        <div css={mapContainerStyle}>
          {isLoading && (
            <div css={loadingStyle}>
              <div css={loadingSpinnerStyle}></div>
              <p>지도를 로딩중입니다...</p>
              {locationLoading && <p>📍 현재 위치를 찾는 중...</p>}
              {routeLoading && <p>🛤️ 경로를 계산중입니다...</p>}
            </div>
          )}
          <div 
            ref={mapRef} 
            css={mapStyle}
            style={{ visibility: isLoading ? 'hidden' : 'visible' }}
          />
          
          {/* 현재 위치 버튼 */}
          {!isLoading && (
            <button 
              css={locationButtonStyle}
              onClick={handleGetCurrentLocation}
              disabled={locationLoading}
              title="현재 위치로 이동"
            >
              {locationLoading ? (
                <div css={locationButtonSpinnerStyle}></div>
              ) : (
                '📍'
              )}
            </button>
          )}
          
          {/* 위치 에러 메시지 */}
          {locationError && (
            <div css={locationErrorStyle}>
              <p>⚠️ {locationError}</p>
              <button 
                onClick={() => setLocationError(null)}
                css={errorCloseButtonStyle}
              >
                ✕
              </button>
            </div>
          )}

          {/* 경로 에러 메시지 */}
          {routeError && (
            <div css={routeErrorStyle}>
              <p>🛤️ {routeError}</p>
              <div css={routeErrorButtonsStyle}>
                <button 
                  onClick={() => currentLocation && targetShelter && handleCalculateRoute(currentLocation, targetShelter)}
                  css={retryRouteButtonStyle}
                  disabled={routeLoading}
                >
                  다시 시도
                </button>
                <button 
                  onClick={() => setRouteError(null)}
                  css={errorCloseButtonStyle}
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* 경로 계산 중 표시 */}
          {routeLoading && !isLoading && (
            <div css={routeLoadingStyle}>
              <div css={routeLoadingSpinnerStyle}></div>
              <p>경로 계산 중...</p>
            </div>
          )}
          
          {/* 타겟 대피소 및 경로 정보 */}
          {!isLoading && (
            <div css={locationInfoStyle}>
              {targetShelter && (
                <div css={shelterInfoStyle}>
                  <h4>🏠 목적지: {targetShelter.name}</h4>
                  <p>📍 {targetShelter.address}</p>
                  <div css={shelterMetaStyle}>
                    <span>⭐ {targetShelter.averageRating}</span>
                    {targetShelter.isOutdoors && <span css={outdoorsBadgeStyle}>야외</span>}
                  </div>
                </div>
              )}
              
              {/* 경로 정보 */}
              {routeInfo && (
                <div css={routeInfoPanelStyle}>
                  <h4>🛤️ 경로 정보</h4>
                  <div css={routeStatsStyle}>
                    <div css={routeStatItemStyle}>
                      <span css={routeStatLabelStyle}>거리</span>
                      <span css={routeStatValueStyle}>
                        {routeInfo.totalDistance > 1000 
                          ? `${(routeInfo.totalDistance / 1000).toFixed(1)}km`
                          : `${Math.round(routeInfo.totalDistance)}m`
                        }
                      </span>
                    </div>
                    <div css={routeStatItemStyle}>
                      <span css={routeStatLabelStyle}>예상 시간</span>
                      <span css={routeStatValueStyle}>
                        {routeInfo.totalTime > 60 
                          ? `${Math.round(routeInfo.totalTime / 60)}분`
                          : `${routeInfo.totalTime}초`
                        }
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => currentLocation && targetShelter && handleCalculateRoute(currentLocation, targetShelter)}
                    css={recalculateButtonStyle}
                    disabled={routeLoading}
                  >
                    {routeLoading ? '계산 중...' : '경로 다시 계산'}
                  </button>
                </div>
              )}
              
              {currentLocation && (
                <div css={currentLocationInfoStyle}>
                  <p>📍 현재 위치: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}</p>
                  <p>정확도: {Math.round(currentLocation.accuracy)}m</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
};

const containerStyle = css`
  display: flex;
  flex-direction: column;
  height: calc(100vh - ${theme.spacing.spacing16});
  width: 100%;
  margin: 0;
  position: relative;
`;

const mapContainerStyle = css`
  flex: 1;
  position: relative;
  overflow: hidden;
`;

const mapStyle = css`
  width: 100%;
  height: 100%;
`;

const loadingStyle = css`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  z-index: 1000;
`;

const loadingSpinnerStyle = css`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const errorStyle = css`
  text-align: center;
  padding: 40px;
  color: #d32f2f;
  
  h2 {
    font-size: 24px;
    margin-bottom: 16px;
  }
  
  p {
    font-size: 16px;
    margin-bottom: 24px;
  }
`;

  const retryButtonStyle = css`
    background-color: #007bff;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    
    &:hover {
      background-color: #0056b3;
    }
  `;
  
  const locationButtonStyle = css`
    position: absolute;
    top: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
    background-color: white;
    border: 2px solid #007bff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    transition: all 0.3s ease;
    
    &:hover:not(:disabled) {
      background-color: #007bff;
      transform: scale(1.1);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `;
  
  const locationButtonSpinnerStyle = css`
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  
  const locationErrorStyle = css`
    position: absolute;
    top: 80px;
    left: 20px;
    right: 20px;
    background-color: #ffebee;
    color: #d32f2f;
    border: 1px solid #ffcdd2;
    border-radius: 8px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    
    p {
      margin: 0;
      font-size: 14px;
      flex: 1;
    }
  `;
  
  const errorCloseButtonStyle = css`
    background: none;
    border: none;
    color: #d32f2f;
    font-size: 18px;
    cursor: pointer;
    padding: 4px;
    margin-left: 8px;
    border-radius: 4px;
    
    &:hover {
      background-color: rgba(211, 47, 47, 0.1);
    }
  `;
  
  const locationInfoStyle = css`
    position: absolute;
    bottom: 20px;
    left: 20px;
    right: 20px;
    background-color: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    max-height: 40vh;
    overflow-y: auto;
  `;

  const shelterInfoStyle = css`
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 12px;
    margin-bottom: 12px;
    
    h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
      color: #333;
      font-weight: bold;
    }
    
    p {
      margin: 4px 0;
      font-size: 13px;
      color: #666;
    }
  `;

  const currentLocationInfoStyle = css`
    p {
      margin: 2px 0;
      font-size: 11px;
      color: #999;
    }
    
    @media (max-width: 768px) {
      p {
        font-size: 10px;
      }
    }
  `;

  const routeErrorStyle = css`
    position: absolute;
    top: 140px;
    left: 20px;
    right: 20px;
    background-color: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
    border-radius: 8px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    
    p {
      margin: 0;
      font-size: 14px;
      flex: 1;
    }
  `;

  const routeErrorButtonsStyle = css`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 12px;
  `;

  const retryRouteButtonStyle = css`
    background-color: #ffc107;
    color: #212529;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    
    &:hover:not(:disabled) {
      background-color: #ffb300;
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `;

  const routeLoadingStyle = css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    background-color: rgba(255, 255, 255, 0.9);
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 1001;
    
    p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
  `;

  const routeLoadingSpinnerStyle = css`
    width: 24px;
    height: 24px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #ffc107;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  const routeInfoPanelStyle = css`
    border-top: 1px solid #e0e0e0;
    border-bottom: 1px solid #e0e0e0;
    padding: 12px 0;
    margin: 12px 0;
    
    h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      color: #333;
      font-weight: bold;
    }
  `;

  const routeStatsStyle = css`
    display: flex;
    gap: 24px;
    margin-bottom: 16px;
  `;

  const routeStatItemStyle = css`
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
  `;

  const routeStatLabelStyle = css`
    font-size: 12px;
    color: #999;
    margin-bottom: 4px;
  `;

  const routeStatValueStyle = css`
    font-size: 18px;
    font-weight: bold;
    color: #333;
  `;

  const recalculateButtonStyle = css`
    width: 100%;
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    
    &:hover:not(:disabled) {
      background-color: #0056b3;
    }
    
    &:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
  `;

  const shelterMetaStyle = css`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 8px;
    
    span {
      font-size: 13px;
      color: #666;
    }
  `;

  const outdoorsBadgeStyle = css`
    background-color: #dc3545;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: bold;
  `;

export default GuidePage;
