import { useState } from 'react';
import type { RefObject } from 'react';
import type { LocationState } from '../types/tmap';

export const useTmapSDK = (mapRef: RefObject<HTMLDivElement | null>) => {
  const [map, setMap] = useState<any>(null);

  // TMAP SDK 준비 대기
  const waitForTmapSDK = (): Promise<boolean> => {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 50;

      const checkSDK = () => {
        if (window.Tmapv3 && window.Tmapv3.Map) {
          console.log('TMAP SDK 준비 완료');
          resolve(true);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkSDK, 100);
        } else {
          console.error('TMAP SDK 로드 타임아웃');
          resolve(false);
        }
      };

      checkSDK();
    });
  };

  // 지도가 완전히 로드되었는지 확인
  const isMapFullyLoaded = (mapInstance: any): boolean => {
    try {
      return (
        mapInstance && mapInstance.getZoom && mapInstance.getCenter && mapInstance.getZoom() > 0
      );
    } catch (err) {
      console.warn('지도 상태 확인 중 오류:', err);
      return false;
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
          scrollwheel: true,
        });

        // 지도 로드 완료 이벤트 대기
        const checkMapLoaded = () => {
          // 지도가 완전히 로드되었는지 확인
          if (mapInstance && mapInstance.getZoom && mapInstance.getCenter) {
            setMap(mapInstance);
            console.log('지도 초기화 및 로드 완료');
            resolve();
          } else {
            // 아직 로드되지 않았으면 100ms 후 다시 체크
            setTimeout(checkMapLoaded, 100);
          }
        };

        // 지도 로드 완료 체크 시작 (약간의 딜레이 후)
        setTimeout(checkMapLoaded, 500);
      } catch (err) {
        console.error('지도 초기화 실패:', err);
        reject(err);
      }
    });
  };

  return {
    map,
    waitForTmapSDK,
    isMapFullyLoaded,
    initializeMapWithLocation,
  };
};
