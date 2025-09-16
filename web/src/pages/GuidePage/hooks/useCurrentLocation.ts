import { useState } from 'react';
import type { LocationState } from '../types/tmap';

interface UseCurrentLocationProps {
  map: any;
  isMapFullyLoaded: (mapInstance: any) => boolean;
}

export const useCurrentLocation = ({ map, isMapFullyLoaded }: UseCurrentLocationProps) => {
  const [currentLocation, setCurrentLocation] = useState<LocationState | null>(null);
  const [currentLocationMarker, setCurrentLocationMarker] = useState<any>(null);

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
            accuracy: position.coords.accuracy
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
          maximumAge: 300000
        }
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
        color: "#007bff", // Blue for current location
        iconSize: new window.Tmapv3.Size(24, 24),
        map: map
      });

      setCurrentLocationMarker(marker);
      console.log('현재 위치 마커 업데이트 완료');
    } catch (err) {
      console.error('현재 위치 마커 생성 중 오류:', err);
    }
  };

  return {
    currentLocation,
    setCurrentLocation,
    getCurrentLocation,
    updateCurrentLocationMarker
  };
};
