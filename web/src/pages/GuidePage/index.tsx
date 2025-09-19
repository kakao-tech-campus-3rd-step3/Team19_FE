/** @jsxImportSource @emotion/react */
import { useEffect, useRef, useState } from 'react';
import { css } from '@emotion/react';
import { useLocation } from 'react-router-dom';
import { nearbyShelters } from '@/mock/nearbyShelters';
import type { LocationState, Shelter } from './types/tmap';
import { useTmapSDK } from './hooks/useTmapSDK';
import { useCurrentLocation } from './hooks/useCurrentLocation';
import { useRouteCalculation } from './hooks/useRouteCalculation';

const GuidePage = () => {
  const location = useLocation();
  const mapRef = useRef<HTMLDivElement>(null);
  
  // TMAP SDK Hook 사용
  const { map, waitForTmapSDK, isMapFullyLoaded, initializeMapWithLocation } = useTmapSDK(mapRef);
  
  // 현재 위치 Hook 사용
  const { currentLocation, setCurrentLocation, getCurrentLocation, updateCurrentLocationMarker, startWatchingPosition, stopWatchingPosition } = useCurrentLocation({
    map,
    isMapFullyLoaded
  });

  // 경로 계산 Hook 사용
  const { handleCalculateRoute } = useRouteCalculation({
    map,
    isMapFullyLoaded
  });
  
  // 타겟 대피소 정보 상태
  const [targetShelter, setTargetShelter] = useState<Shelter | null>(null);
  const [shelterMarker, setShelterMarker] = useState<any>(null);
  const lastRecalcTimeRef = useRef<number>(0);
  const lastRecalcLocationRef = useRef<LocationState | null>(null);

  // 위치 간 거리 계산 (미터)
  const haversineDistanceMeters = (a: LocationState, b: LocationState): number => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371000; // meters
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  };

  // 경로 재계산 조건부 실행 (스팸 방지)
  const maybeRecalculateRoute = (loc: LocationState, shelter: Shelter) => {
    const now = Date.now();
    const MIN_INTERVAL_MS = 5000; // 5초 간격 제한
    const MIN_MOVE_METERS = 10;   // 10m 이상 이동 시

    if (now - lastRecalcTimeRef.current < MIN_INTERVAL_MS) {
      return;
    }

    if (lastRecalcLocationRef.current) {
      const moved = haversineDistanceMeters(lastRecalcLocationRef.current, loc);
      if (moved < MIN_MOVE_METERS) {
        return;
      }
    }

    lastRecalcTimeRef.current = now;
    lastRecalcLocationRef.current = loc;

    // 지도 영역 조정 후 경로 계산
    fitMapToBounds(loc, shelter);
    handleCalculateRoute(loc, shelter);
  };

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
        color: "#dc3545", // Red for shelter
        iconSize: new window.Tmapv3.Size(28, 28),
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
        startWatchingPosition((loc) => {
          // 필요 시 여기서 추가 UI 업데이트 가능
          if (loc && targetShelter) {
            // 경로 재계산은 스팸 방지 로직으로 제어
            maybeRecalculateRoute(loc, targetShelter);
          }
        });
        
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
      console.log('조건 충족 - 지도 영역 조정 및 경로 계산 시작');
      maybeRecalculateRoute(currentLocation, targetShelter);
    }
  }, [currentLocation, targetShelter, map]);

  return (
    <div css={containerStyle}>
      <div css={mapContainerStyle}>
        <div 
          ref={mapRef} 
          css={mapStyle}
        />
      </div>
    </div>
  );
};

const containerStyle = css`
  width: 100%;
  height: 100vh;
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

export default GuidePage;
