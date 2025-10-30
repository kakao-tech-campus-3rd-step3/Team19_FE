import { useRef, useEffect } from 'react';
import myLocationMarker from '@/assets/images/myLocationMarker.png';
import MapCache from '@/lib/MapCache'; // 추가

export const useMap = () => {
  // TMAP SDK 타입으로 변경
  const mapInstanceRef = useRef<any>(null);
  const myMarkerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

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

  // 내 위치 마커 생성 및 갱신 함수
  const updateMyLocation = (lat: number, lng: number, moveCenter = false) => {
    const map = mapInstanceRef.current || MapCache.map;
    if (!map || !window.Tmapv3) return;

    // 지도가 완전히 로드되었는지 확인
    if (!isMapFullyLoaded(map)) {
      setTimeout(() => updateMyLocation(lat, lng, moveCenter), 500);
      return;
    }

    console.log('내 위치 마커 업데이트 시작:', { lat, lng });

    try {
      // MapCache를 통해 전역적으로 하나의 마커만 유지
      MapCache.updateMyMarkerPosition(lat, lng) ||
        MapCache.setMyMarkerOnMap(map, lat, lng, myLocationMarker);
    } catch (err) {
      console.error('내 위치 마커 갱신 에러:', err);
      setTimeout(() => updateMyLocation(lat, lng, moveCenter), 1000);
      return;
    }

    if (moveCenter) {
      try {
        map.setCenter(new window.Tmapv3.LatLng(lat, lng));
      } catch {}
    }
  };

  // 내 위치 버튼 클릭 시: 이미 표시 중인 내 위치 마커가 있으면 그 좌표로 센터 이동만 수행
  // 마커가 없거나 초기화 전이면 1회 측위 후 보정
  const handleMyLocation = () => {
    const map = mapInstanceRef.current || MapCache.map;
    if (!map || !window.Tmapv3) return;

    try {
      // MapCache에 저장된 전역 myMarker 확인
      const existingMarker = MapCache.myMarker || myMarkerRef.current;
      if (existingMarker && typeof existingMarker.getPosition === 'function') {
        const pos = existingMarker.getPosition();
        map.setCenter(pos);
        return;
      }
    } catch {}

    if (!navigator.geolocation) {
      alert('이 브라우저에서는 위치 정보가 지원되지 않습니다.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateMyLocation(position.coords.latitude, position.coords.longitude, true);
      },
      () => {
        alert('위치 정보를 가져올 수 없습니다.');
      },
    );
  };

  // 지도 준비 완료 시
  const handleMapReady = (map: any) => {
    mapInstanceRef.current = map;
    // MapCache와 동기화: 재사용 중이면 myMarker를 다시 map에 붙임
    try {
      if (MapCache.myMarker && typeof MapCache.myMarker.setMap === 'function') {
        MapCache.myMarker.setMap(map);
        // myMarkerRef도 동기화해서 기존 코드가 참조할 수 있게 함
        myMarkerRef.current = MapCache.myMarker;
      }
    } catch {}
  };

  const handleInitialLocation = (lat?: number, lng?: number, moveCenter: boolean = true) => {
    if (typeof lat === 'number' && typeof lng === 'number') {
      updateMyLocation(lat, lng, moveCenter);
      return;
    }

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateMyLocation(position.coords.latitude, position.coords.longitude, moveCenter);
      },
      (error) => {
        console.warn('초기 위치 획득 실패:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 300000,
      },
    );
  };

  // 위치 변경 시 내 위치 갱신 (watchPosition 사용)
  useEffect(() => {
    if (!navigator.geolocation) return;

    // 이미 감시 중이면 중복 시작 방지
    if (watchIdRef.current !== null) {
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        updateMyLocation(position.coords.latitude, position.coords.longitude, false);
      },
      (error) => {
        console.warn('실시간 위치 추적 오류:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000, // 배터리 절약을 위해 약간의 캐싱 허용
        timeout: 10000,
        // 일부 브라우저에서는 지원되지 않지만, 지원 시 이동 임계치 설정 가능
        // @ts-expect-error: non-standard but widely supported on Android Chrome
        distanceFilter: 3,
      },
    );

    watchIdRef.current = id as unknown as number;

    return () => {
      if (
        watchIdRef.current !== null &&
        navigator.geolocation &&
        navigator.geolocation.clearWatch
      ) {
        try {
          navigator.geolocation.clearWatch(watchIdRef.current);
        } catch {}
      }
      watchIdRef.current = null;
    };
  }, []);

  // 최초 1회 지도 중심 이동 (MapView에서 이미 마커를 추가하므로 여기서는 중심 이동만)
  useEffect(() => {
    handleInitialLocation();
  }, []);

  return {
    handleMapReady,
    handleMyLocation,
    handleInitialLocation,
  };
};
