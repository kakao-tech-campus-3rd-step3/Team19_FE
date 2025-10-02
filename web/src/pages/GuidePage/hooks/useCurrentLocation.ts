import { useRef, useState } from 'react';
import type { LocationState } from '../types/tmap';

interface UseCurrentLocationProps {
  map: any;
  isMapFullyLoaded: (mapInstance: any) => boolean;
}

export const useCurrentLocation = ({ map, isMapFullyLoaded }: UseCurrentLocationProps) => {
  const [currentLocation, setCurrentLocation] = useState<LocationState | null>(null);
  const [currentLocationMarker, setCurrentLocationMarker] = useState<any>(null);
  const watchIdRef = useRef<number | null>(null);

  // 현재 위치 획득
  const getCurrentLocation = (): Promise<LocationState> => {
    return new Promise((resolve, reject) => {
      console.log('현재 위치 획득 시작');

      if (!navigator.geolocation) {
        reject(new Error('이 브라우저는 위치 서비스를 지원하지 않습니다.'));
        return;
      }

      const timeoutId = setTimeout(() => {
        reject(new Error('위치 획득이 시간 초과되었습니다.'));
      }, 10000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          const locationData: LocationState = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          console.log('현재 위치 획득 성공:', locationData);
          resolve(locationData);
        },
        (error) => {
          clearTimeout(timeoutId);
          console.error('위치 획득 실패:', error);
          let errorMessage = '위치를 가져올 수 없습니다.';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = '위치 접근 권한이 거부되었습니다.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = '위치 정보를 사용할 수 없습니다.';
              break;
            case error.TIMEOUT:
              errorMessage = '위치 요청이 시간 초과되었습니다.';
              break;
          }

          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 300000,
        },
      );
    });
  };

  // 현재 위치 마커 업데이트
  const updateCurrentLocationMarker = (location: LocationState) => {
    if (!map || !window.Tmapv3) return;

    // 지도가 완전히 로드되었는지 확인
    if (!isMapFullyLoaded(map)) {
      console.warn('지도가 아직 완전히 로드되지 않음, 마커 생성 500ms 후 재시도');
      setTimeout(() => updateCurrentLocationMarker(location), 500);
      return;
    }

    console.log('현재 위치 마커 업데이트 시작:', location);

    if (currentLocationMarker) {
      try {
        currentLocationMarker.setMap(null);
      } catch (err) {
        console.warn('기존 현재 위치 마커 제거 중 오류:', err);
      }
    }

    try {
      const marker = new window.Tmapv3.Marker({
        position: new window.Tmapv3.LatLng(location.latitude, location.longitude),
        color: '#007bff', // Blue for current location
        iconSize: new window.Tmapv3.Size(24, 24),
        map: map,
      });

      setCurrentLocationMarker(marker);
      console.log('현재 위치 마커 업데이트 완료');
    } catch (err) {
      console.error('현재 위치 마커 생성 중 오류:', err);
    }
  };

  // 실시간 위치 추적 시작
  const startWatchingPosition = (onUpdate?: (loc: LocationState) => void) => {
    if (!navigator.geolocation) {
      console.warn('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      return;
    }

    // 이미 감시 중이면 중복 시작 방지
    if (watchIdRef.current !== null) {
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationState = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        setCurrentLocation(locationData);
        updateCurrentLocationMarker(locationData);
        if (onUpdate) onUpdate(locationData);
      },
      (error) => {
        console.warn('실시간 위치 추적 오류:', error);
      },
      {
        enableHighAccuracy: true,
        // 배터리 절약 및 과도한 업데이트 방지를 위해 약간의 캐싱 허용
        maximumAge: 2000,
        timeout: 10000,
        // 일부 브라우저에서는 지원되지 않지만, 지원 시 이동 임계치 설정 가능
        // @ts-expect-error: non-standard but widely supported on Android Chrome
        distanceFilter: 3,
      },
    );

    watchIdRef.current = id as unknown as number;
  };

  // 실시간 위치 추적 중지
  const stopWatchingPosition = () => {
    if (watchIdRef.current !== null && navigator.geolocation && navigator.geolocation.clearWatch) {
      try {
        navigator.geolocation.clearWatch(watchIdRef.current);
      } catch {}
    }
    watchIdRef.current = null;
  };

  return {
    currentLocation,
    setCurrentLocation,
    getCurrentLocation,
    updateCurrentLocationMarker,
    startWatchingPosition,
    stopWatchingPosition,
  };
};
