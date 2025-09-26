import { useRef, useEffect } from 'react';
import myLocationMarker from '@/assets/images/myLocationMarker.png';
import type { LocationState } from '../../GuidePage/types/tmap';

export const useMap = () => {
  // TMAP SDK 타입으로 변경
  const mapInstanceRef = useRef<any>(null);
  const myMarkerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

  // 내 위치 마커 생성 및 갱신 함수
  const updateMyLocation = (lat: number, lng: number, moveCenter = false) => {
    const map = mapInstanceRef.current;
    if (!map || !window.Tmapv3) return;

    const locPosition = new window.Tmapv3.LatLng(lat, lng);

    // 마커가 없으면 새로 생성
    if (!myMarkerRef.current) {
      myMarkerRef.current = new window.Tmapv3.Marker({
        position: locPosition,
        iconSize: new window.Tmapv3.Size(50, 50),
        icon: myLocationMarker,
        map: map,
      });
    } else {
      // 마커가 있으면 위치만 갱신
      myMarkerRef.current.setPosition(locPosition);
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
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        updateMyLocation(position.coords.latitude, position.coords.longitude, false);
      },
      () => {},
      {
        enableHighAccuracy: true,
        maximumAge: 2000, // 배터리 절약을 위해 약간의 캐싱 허용
        timeout: 10000,
      },
    );
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  // 최초 1회 지도 중심 이동
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateMyLocation(position.coords.latitude, position.coords.longitude, true);
        },
        () => {},
      );
    }
  }, []);

  return {
    handleMapReady,
    handleMyLocation,
  };
};
