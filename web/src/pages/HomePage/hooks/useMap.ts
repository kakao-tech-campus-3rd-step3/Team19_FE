import { useRef, useEffect } from 'react';
import myLocationMarker from '@/assets/images/myLocationMarker.png';

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
    const map = mapInstanceRef.current;
    if (!map || !window.Tmapv3) return;

    // 지도가 완전히 로드되었는지 확인
    if (!isMapFullyLoaded(map)) {
      console.warn('지도가 아직 완전히 로드되지 않음, 내 위치 마커 생성 500ms 후 재시도');
      setTimeout(() => updateMyLocation(lat, lng, moveCenter), 500);
      return;
    }

    console.log('내 위치 마커 업데이트 시작:', { lat, lng });

    const locPosition = new window.Tmapv3.LatLng(lat, lng);

    // 기존 마커 제거
    if (myMarkerRef.current) {
      try {
        myMarkerRef.current.setMap(null);
      } catch (err) {
        console.warn('기존 내 위치 마커 제거 중 오류:', err);
      }
    }

    try {
      // 새 마커 생성
      myMarkerRef.current = new window.Tmapv3.Marker({
        position: locPosition,
        iconSize: new window.Tmapv3.Size(50, 50),
        icon: myLocationMarker,
        map: map,
      });

      console.log('내 위치 마커 업데이트 완료');
    } catch (err) {
      console.error('내 위치 마커 생성 중 오류:', err);
      // 마커 생성 실패 시 재시도
      setTimeout(() => updateMyLocation(lat, lng, moveCenter), 1000);
      return;
    }

    if (moveCenter) {
      map.setCenter(locPosition);
    }
  };

  // 내 위치 버튼 클릭 시
  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateMyLocation(position.coords.latitude, position.coords.longitude, true);
        },
        () => {
          alert('위치 정보를 가져올 수 없습니다.');
        },
      );
    } else {
      alert('이 브라우저에서는 위치 정보가 지원되지 않습니다.');
    }
  };

  // 지도 준비 완료 시
  const handleMapReady = (map: any) => {
    mapInstanceRef.current = map;
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

  // 최초 1회 지도 중심 이동
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateMyLocation(position.coords.latitude, position.coords.longitude, true);
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
    }
  }, []);

  return {
    handleMapReady,
    handleMyLocation,
  };
};
