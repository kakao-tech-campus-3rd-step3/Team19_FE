import { useRef, useEffect } from 'react';
import MapCache from '@/lib/MapCache';
import myLocationMarker from '@/assets/images/myLocationMarker.png';

export const useMap = () => {
  const mapInstanceRef = useRef<any>(null);
  const myMarkerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

  // 마지막 위치 업데이트 시간(쓰로틀)
  const lastUpdateTsRef = useRef<number>(0);
  const UPDATE_THROTTLE_MS = 800; // 앱에서는 800ms 정도로 제한

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

  // 내 위치 마커 생성 및 갱신 함수 (MapCache 사용)
  const updateMyLocation = async (lat: number, lng: number, moveCenter = false) => {
    const now = Date.now();
    if (now - lastUpdateTsRef.current < UPDATE_THROTTLE_MS) {
      // 쓰로틀: 너무 자주 호출되는 경우 위치만 기록하고 반환
      lastUpdateTsRef.current = now;
    } else {
      lastUpdateTsRef.current = now;
    }

    const map = mapInstanceRef.current || MapCache.map;
    // 앱에서 map이 없으면 MapCache.ensureSDKReady 후 재시도 최소화
    if (!map) {
      // SDK 준비를 보장하고, 이후 map이 생기면 update 다시 시도
      await MapCache.ensureSDKReady();
    }
    if (!map || !window.Tmapv3) return;

    if (!isMapFullyLoaded(map)) {
      // 느린 환경에서는 폴링을 짧게 반복하지 말고 백오프 적용
      setTimeout(() => updateMyLocation(lat, lng, moveCenter), 800);
      return;
    }

    try {
      // 1) 위치 업데이트 시도
      const updated = MapCache.updateMyMarkerPosition(lat, lng);

      // 1.5) MapCache에 최신 위치 명시적 저장: MapView에서 읽도록 보장
      try {
        // 안전하게 any로 할당 — MapCache에 해당 필드가 없으면 추가
        (MapCache as any).userLocation = { lat, lng };
        (MapCache as any).userLat = Number(lat);
        (MapCache as any).userLng = Number(lng);
        // lastCenter도 동기화
        (MapCache as any).lastCenter = { lat: Number(lat), lng: Number(lng) };
      } catch (e) {
        // ignore
      }

      // 2) 마커가 없거나 아이콘이 다르면(보장) 재생성/보정
      if (!updated || MapCache.lastIcon !== myLocationMarker) {
        MapCache.setMyMarkerOnMap(map, lat, lng, myLocationMarker);
      }

      // 내위치 마커는 항상 최상단에 위치하도록 zIndex 보장
      try {
        const mm = MapCache.myMarker;
        if (mm) {
          if (typeof mm.setZIndex === 'function') {
            mm.setZIndex(3000);
          } else {
            // SDK에 따라 직접 프로퍼티로 지정되는 경우 처리
            (mm as any).zIndex = 3000;
          }
        }
      } catch (zErr) {
        // 무시
      }

      myMarkerRef.current = MapCache.myMarker;
    } catch (err) {
      console.error('내 위치 마커 갱신 에러:', err);
    }

    if (moveCenter) {
      try {
        map.setCenter(new window.Tmapv3.LatLng(lat, lng));
        // 내 위치 버튼 클릭 시 기본 줌 레벨(15)로 설정
        if (typeof map.setZoom === 'function') {
          map.setZoom(15);
        }
      } catch {}
    }
  };

  // 컴포넌트 마운트 시 SDK 미리 준비(앱에서 느린 초기 로딩을 줄임)
  useEffect(() => {
    MapCache.ensureSDKReady().then((ok) => {
      if (!ok) {
        console.warn('useMap: SDK 준비 실패(타임아웃)');
      }
    });
  }, []);

  // 내 위치 버튼: 전역 마커 위치로 센터 이동하거나 측위 요청
  const handleMyLocation = () => {
    const map = mapInstanceRef.current || MapCache.map;
    if (!map || !window.Tmapv3) return;

    try {
      const existingMarker = MapCache.myMarker || myMarkerRef.current;
      if (existingMarker && typeof existingMarker.getPosition === 'function') {
        const pos = existingMarker.getPosition();
        map.setCenter(pos);
        // 내 위치 버튼 클릭 시 기본 줌 레벨(15)로 설정
        if (typeof map.setZoom === 'function') {
          map.setZoom(15);
        }
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

  // 지도 준비 완료 시: MapCache와 동기화 (마커가 있으면 재부착 및 아이콘 보정)
  const handleMapReady = (map: any) => {
    mapInstanceRef.current = map;
    try {
      // ensureMap을 통해 이미 캐시된 map과 div가 재사용되므로 여기선 마커만 재부착
      if (MapCache.myMarker && typeof MapCache.myMarker.setMap === 'function') {
        MapCache.myMarker.setMap(map);
        // myLocationMarker가 lastIcon에 남아있지 않으면 보정
        if (MapCache.lastIcon && typeof MapCache.myMarker.setIcon === 'function') {
          try {
            MapCache.myMarker.setIcon(MapCache.lastIcon);
          } catch {}
        }
        // 재부착 시에도 내위치 마커가 최상위가 되도록 zIndex 보장
        try {
          if (typeof MapCache.myMarker.setZIndex === 'function') MapCache.myMarker.setZIndex(3000);
          else (MapCache.myMarker as any).zIndex = 3000;
        } catch {}
        myMarkerRef.current = MapCache.myMarker;
      }
    } catch (err) {
      console.warn('handleMapReady 동기화 중 오류', err);
    }
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
        // 쓰로틀 내에서 updateMyLocation이 자체 제어
        updateMyLocation(position.coords.latitude, position.coords.longitude, false);
      },
      (error) => {
        console.warn('실시간 위치 추적 오류:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 10000,
        // @ts-expect-error
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
