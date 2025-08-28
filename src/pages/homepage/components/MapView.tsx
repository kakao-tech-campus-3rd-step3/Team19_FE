/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef, useState } from 'react';

interface Shelter {
  shelterId: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: string;
  isOpened: boolean;
  isOutdoors: boolean;
  averageRating: number;
  photoUrl: string;
}

interface Props {
  onMapReady?: (map: kakao.maps.Map) => void;
  shelters?: Shelter[];
}

const MapView = ({ onMapReady, shelters = [] }: Props) => {
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPermissionDenied(false);
        const { latitude, longitude } = pos.coords;

        window.kakao.maps.load(() => {
          const container = document.getElementById('map');
          if (!container) return;

          const mapOption = {
            center: new window.kakao.maps.LatLng(latitude, longitude),
            level: 3,
          };

          const map = new window.kakao.maps.Map(container, mapOption);
          mapInstanceRef.current = map;
          if (onMapReady) onMapReady(map);

          // 내 위치 마커 표시
          const myMarker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(latitude, longitude),
          });
          myMarker.setMap(map);

          // 쉼터 마커 이미지 정보
          const imageSrc =
            'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png';
          const imageSize = new window.kakao.maps.Size(24, 35);

          // 쉼터 마커 생성
          shelters.forEach((shelter) => {
            const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);
            const markerPosition = new window.kakao.maps.LatLng(
              shelter.latitude,
              shelter.longitude,
            );

            const marker = new window.kakao.maps.Marker({
              map: map,
              position: markerPosition,
              title: shelter.name,
              image: markerImage,
            });

            const infowindow = new window.kakao.maps.InfoWindow({
              content: `<div style="padding:5px; text-align:center;">${shelter.name}</div>`,
            });
            window.kakao.maps.event.addListener(marker, 'click', () => {
              infowindow.open(map, marker);
            });
          });
        });
      },
      () => {
        setPermissionDenied(true); // 권한 거부 시 안내
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [onMapReady, shelters]);

  if (permissionDenied) {
    return (
      <div css={mapStyle}>
        <p css={deniedStyle}>
          위치 권한이 필요합니다.
          <br />
          위치 권한을 허용해 주세요.
        </p>
      </div>
    );
  }

  return <div id="map" css={mapStyle}></div>;
};

export default MapView;

const mapStyle = css`
  width: 100%;
  height: 100%;
  margin: 0;
  position: relative;
`;

const deniedStyle = css`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #333;
  background: #fff;
  text-align: center;
`;
