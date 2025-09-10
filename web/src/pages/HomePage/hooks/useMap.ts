import { useRef, useEffect } from 'react';
import myLocationMarker from '@/assets/images/myLocationMarker.png';

export const useMap = () => {
  const mapInstanceRef = useRef<any>(null);
  const myMarkerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

  // 내 위치 마커 생성 및 갱신 함수
  const updateMyLocation = (lat: number, lng: number, moveCenter = false) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const locPosition = new window.kakao.maps.LatLng(lat, lng);

    // 마커가 없으면 새로 생성
    if (!myMarkerRef.current) {
      const myMarkerImage = new window.kakao.maps.MarkerImage(
        myLocationMarker,
        new window.kakao.maps.Size(50, 50),
        { offset: new window.kakao.maps.Point(25, 50) },
      );
      myMarkerRef.current = new window.kakao.maps.Marker({
        position: locPosition,
        image: myMarkerImage,
      });
      myMarkerRef.current.setMap(map);
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

  // 1초마다 내 위치 갱신
  useEffect(() => {
    if (!navigator.geolocation) return;

    watchIdRef.current = window.setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateMyLocation(position.coords.latitude, position.coords.longitude, false);
        },
        () => {},
      );
    }, 1000);

    return () => {
      if (watchIdRef.current) clearInterval(watchIdRef.current);
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
