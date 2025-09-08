import { useRef } from 'react';

export const useMap = () => {
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);

  const handleMapReady = (map: kakao.maps.Map) => {
    mapInstanceRef.current = map;
  };

  const handleMyLocation = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const locPosition = new kakao.maps.LatLng(lat, lng);

          // 지도 중심을 내 위치로 이동
          map.setCenter(locPosition);
        },
        (error) => {
          console.error('위치 정보를 가져올 수 없습니다:', error);
        },
      );
    } else {
      alert('이 브라우저에서는 위치 정보가 지원되지 않습니다.');
    }
  };

  return {
    handleMapReady,
    handleMyLocation,
  };
};
