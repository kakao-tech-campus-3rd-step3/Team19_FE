/** @jsxImportSource @emotion/react */
import { useEffect, useRef, useState } from 'react';
import { css } from '@emotion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { nearbyShelters } from '@/mock/nearbyShelters';
import type { LocationState, Shelter } from './types/tmap';
import { useTmapSDK } from './hooks/useTmapSDK';
import { useCurrentLocation } from './hooks/useCurrentLocation';
import { useRouteCalculation } from './hooks/useRouteCalculation';
import type { GuidancePoint } from './hooks/useRouteCalculation';
import theme from '@/styles/theme';

const GuidePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const reachedPointIndexRef = useRef<number>(-1);
  
  // TMAP SDK Hook 사용
  const { map, waitForTmapSDK, isMapFullyLoaded, initializeMapWithLocation } = useTmapSDK(mapRef);
  
  // 현재 위치 Hook 사용
  const { currentLocation, setCurrentLocation, getCurrentLocation, updateCurrentLocationMarker, startWatchingPosition, stopWatchingPosition } = useCurrentLocation({
    map,
    isMapFullyLoaded
  });

  // 경로 계산 Hook 사용
  const { handleCalculateRoute, guidanceSteps, guidancePoints } = useRouteCalculation({
    map,
    isMapFullyLoaded
  });
  const [activeGuidance, setActiveGuidance] = useState<string | null>(null);
  const [hasArrived, setHasArrived] = useState<boolean>(false);
  
  // 타겟 대피소 정보 상태
  const [targetShelter, setTargetShelter] = useState<Shelter | null>(null);
  const [shelterMarker, setShelterMarker] = useState<any>(null);
  const hasInitialRouteCalculatedRef = useRef<boolean>(false);

  // 타겟 대피소 초기화
  useEffect(() => {
    const routerState = location.state as { targetShelter?: Shelter } | null;
    
    if (routerState?.targetShelter) {
      console.log('전달받은 타겟 대피소:', routerState.targetShelter);
      setTargetShelter(routerState.targetShelter);
    } else {
      const defaultShelter = nearbyShelters[0];
      console.log('기본 타겟 대피소 설정:', defaultShelter);
      setTargetShelter(defaultShelter);
    }
  }, [location.state]);

  // 대피소 마커 업데이트
  const updateShelterMarker = (shelter: Shelter) => {
    if (!map || !window.Tmapv3) return;

    // 지도가 완전히 로드되었는지 확인
    if (!isMapFullyLoaded(map)) {
      console.warn('지도가 아직 완전히 로드되지 않음, 대피소 마커 생성 500ms 후 재시도');
      setTimeout(() => updateShelterMarker(shelter), 500);
      return;
    }

    console.log('대피소 마커 업데이트 시작:', shelter.name);

    if (shelterMarker) {
      try {
        shelterMarker.setMap(null);
      } catch (err) {
        console.warn('기존 대피소 마커 제거 중 오류:', err);
      }
    }

    try {
      const marker = new window.Tmapv3.Marker({
        position: new window.Tmapv3.LatLng(shelter.latitude, shelter.longitude),
        iconSize: new window.Tmapv3.Size(40, 53.33),
        icon: window.Tmapv3.asset.Icon.get('arrival'),
        map: map
      });

      setShelterMarker(marker);
      console.log('대피소 마커 업데이트 완료');
    } catch (err) {
      console.error('대피소 마커 생성 중 오류:', err);
    }
  };

  // 지도 영역 조정
  const fitMapToBounds = (userLocation: LocationState, shelter: Shelter) => {
    if (!map || !window.Tmapv3) return;

    // 지도가 완전히 로드되었는지 확인
    if (!isMapFullyLoaded(map)) {
      console.warn('지도가 아직 완전히 로드되지 않음, 영역 조정 500ms 후 재시도');
      setTimeout(() => fitMapToBounds(userLocation, shelter), 500);
      return;
    }

    console.log('지도 영역 조정 시작');

    try {
      const bounds = new window.Tmapv3.LatLngBounds();
      bounds.extend(new window.Tmapv3.LatLng(userLocation.latitude, userLocation.longitude));
      bounds.extend(new window.Tmapv3.LatLng(shelter.latitude, shelter.longitude));

      const padding = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
      };

      map.fitBounds(bounds, padding);
      console.log('지도 영역 조정 완료');
    } catch (err) {
      console.error('지도 영역 조정 중 오류:', err);
    }
  };

  // 메인 설정 함수
  useEffect(() => {
    let isMounted = true;

    const setupMap = async () => {
      try {
        if (!isMounted) return;
        
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
          currentLocationData = await getCurrentLocation();
          setCurrentLocation(currentLocationData);
          console.log('초기 위치 획득 완료:', currentLocationData);
        } catch (locationErr) {
          console.warn('초기 위치 획득 실패, 서울로 기본 설정:', locationErr);
        }
        
        if (!isMounted) return;
        
        // 현재 위치 기반으로 지도 초기화
        await initializeMapWithLocation(currentLocationData);
        
        if (!isMounted) return;
        
        // 현재 위치가 있으면 즉시 마커 표시
        if (currentLocationData) {
          updateCurrentLocationMarker(currentLocationData);
        }

        // 실시간 위치 추적 시작 (마운트 동안 유지)
        // 위치 변경은 별도 effect에서 처리하여 최신 guidancePoints를 사용
        startWatchingPosition();
        
      } catch (err) {
        console.error('지도 설정 실패:', err);
      }
    };

    setupMap();

    return () => {
      isMounted = false;
      // 실시간 위치 추적 중지
      stopWatchingPosition();
    };
  }, []);

  // 지도가 준비되고 타겟 대피소가 있을 때 대피소 마커 표시
  useEffect(() => {
    if (map && targetShelter) {
      updateShelterMarker(targetShelter);
    }
  }, [map, targetShelter]);

  // 지도가 준비되거나 현재 위치가 바뀔 때 현재 위치 마커 표시
  useEffect(() => {
    if (map && currentLocation) {
      updateCurrentLocationMarker(currentLocation);
    }
  }, [map, currentLocation]);

  // 현재 위치와 타겟 대피소가 모두 준비되면 초기 1회 지도 영역 조정 및 경로 계산
  useEffect(() => {
    if (currentLocation && targetShelter && map) {
      if (!hasInitialRouteCalculatedRef.current) {
        console.log('초기 1회 - 지도 영역 조정 및 경로 계산 실행');
        fitMapToBounds(currentLocation, targetShelter);
        handleCalculateRoute(currentLocation, targetShelter);
        hasInitialRouteCalculatedRef.current = true;
      }
    }
  }, [currentLocation, targetShelter, map]);

  // 경로 계산 후 안내 포인트/문구 초기화
  useEffect(() => {
    if (guidanceSteps && guidanceSteps.length > 0) {
      setActiveGuidance(guidanceSteps[0]);
    }
  }, [guidanceSteps]);

  // 새 경로 포인트가 설정되면 진행 상태 초기화
  useEffect(() => {
    reachedPointIndexRef.current = -1;
  }, [guidancePoints]);

  // 현재 위치 또는 안내 포인트 변경 시, 도달 여부를 평가하여 안내 문구 갱신
  useEffect(() => {
    if (!currentLocation) return;

    // 목적지 도착 확인
    if (targetShelter && checkArrival(currentLocation, targetShelter)) {
      setHasArrived(true);
      setActiveGuidance('목적지에 도착하셨습니다.\n경로 안내를 종료합니다.');
      return;
    }

    // 일반 안내 포인트 도달 확인
    if (guidancePoints.length > 0) {
      const nearest = getReachableGuidancePoint(currentLocation, guidancePoints);
      if (nearest) {
        setActiveGuidance(nearest.description || guidanceSteps[0] || null);
      }
    }
  }, [currentLocation, guidancePoints, guidanceSteps, targetShelter]);

  // 사용자가 도달한 안내 포인트를 계산
  const getReachableGuidancePoint = (loc: LocationState, points: GuidancePoint[]) => {
    // 다음 목표 포인트만 체크(이미 지난 포인트는 건너뜀)
    const nextIndex = Math.min(reachedPointIndexRef.current + 1, points.length - 1);
    if (nextIndex < 0 || nextIndex >= points.length) return null;

    const target = points[nextIndex];
    const distance = haversineDistanceMeters(
      { latitude: loc.latitude, longitude: loc.longitude, accuracy: loc.accuracy },
      { latitude: target.latitude, longitude: target.longitude, accuracy: 0 }
    );

    const THRESHOLD_M = 15; // 15m 이내 접근 시 도달로 간주
    if (distance <= THRESHOLD_M) {
      reachedPointIndexRef.current = nextIndex;
      return target;
    }
    return null;
  };

  // 거리 계산 함수 (재사용)
  const haversineDistanceMeters = (a: LocationState, b: LocationState): number => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  };

  // 목적지 도착 여부 확인
  const checkArrival = (loc: LocationState, shelter: Shelter) => {
    const distance = haversineDistanceMeters(
      { latitude: loc.latitude, longitude: loc.longitude, accuracy: loc.accuracy },
      { latitude: shelter.latitude, longitude: shelter.longitude, accuracy: 0 }
    );
    const ARRIVAL_THRESHOLD_M = 20; // 20m 이내 도착으로 간주
    return distance <= ARRIVAL_THRESHOLD_M;
  };

  // 도착 확인 버튼 클릭 핸들러
  const handleArrivalConfirm = () => {
    navigate('/');
  };

  // NOTE: guidancePoints를 훅에서 직접 꺼내지 못해, 임시로 window에 저장된 routeData를 확장하거나
  // 별도 반환을 추가해야 한다. 여기서는 훅 내에 guidancePoints 상태를 노출했다고 가정.

  return (
    <div css={containerStyle}>
      <div css={mapContainerStyle}>
        <div 
          ref={mapRef} 
          css={mapStyle}
        />
        {(activeGuidance || guidanceSteps.length > 0) && (
          <div css={guidanceBarStyle}>
            <div css={guidanceContentStyle}>
              <div css={guidanceTextStyle}>{activeGuidance || guidanceSteps[0]}</div>
              {hasArrived && (
                <button css={confirmButtonStyle} onClick={handleArrivalConfirm}>
                  확인
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const containerStyle = css`
  width: 100%;
  height: calc(100vh - ${theme.spacing.spacing16});
  position: relative;
`;

const mapContainerStyle = css`
  width: 100%;
  height: 100%;
  position: relative;
`;

const mapStyle = css`
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
`;

const guidanceBarStyle = css`
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 16px;
  background: ${theme.colors.button.black};
  color: ${theme.colors.text.white};
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-height: 48px;
`;

const guidanceContentStyle = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const guidanceTextStyle = css`
  font-size: ${theme.typography.guide1.fontSize};
  font-weight: ${theme.typography.guide1.fontWeight};
  line-height: ${theme.typography.guide1.lineHeight};
  white-space: pre-line;
  word-break: keep-all;
  overflow-wrap: anywhere;
`;

const confirmButtonStyle = css`
  background: ${theme.colors.button.red};
  color: ${theme.colors.text.white};
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: ${theme.typography.guide2.fontSize};
  font-weight: ${theme.typography.guide2.fontWeight};
  line-height: ${theme.typography.guide2.lineHeight};
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease;
  align-self: center;
  
  &:hover {
    background: #b71c1c;
  }
  
  &:active {
    background: #d32f2f;
  }
`;

export default GuidePage;
