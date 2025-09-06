/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef, useState } from 'react';
import ShelterInfoCard from '@/components/ShelterInfoCard';
import theme from '@/styles/theme';
import { typography } from '@/styles/typography';
import marker from '@/assets/images/marker.png';
import myLocationMarker from '@/assets/images/myLocationMarker.png';

// Shelter 인터페이스
interface Shelter {
  shelterId: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: string;
  isOutdoors: boolean;
  operatingHours: {
    weekday: string;
    weekend: string;
  };
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
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);

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
            draggable: true,
          };

          const map = new window.kakao.maps.Map(container, mapOption);
          mapInstanceRef.current = map;
          if (onMapReady) onMapReady(map);

          // 내 위치 마커 이미지 설정
          const myMarkerImageSrc = myLocationMarker; // 이미지 경로
          const myMarkerImageSize = new window.kakao.maps.Size(50, 50); // 이미지 크기
          const myMarkerImageOptions = { offset: new window.kakao.maps.Point(25, 50) }; // 중심점 설정

          const myMarkerImage = new window.kakao.maps.MarkerImage(
            myMarkerImageSrc,
            myMarkerImageSize,
            myMarkerImageOptions,
          );

          const myMarker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(latitude, longitude),
            image: myMarkerImage, // 사용자 정의 이미지 설정
          });

          myMarker.setMap(map);

          // 쉼터 마커 이미지 설정
          const imageSrc = marker;
          const imageSize = new window.kakao.maps.Size(24, 35);

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

            // 마커 클릭 시 해당 쉼터 정보 상태 업데이트
            window.kakao.maps.event.addListener(marker, 'click', () => {
              setSelectedShelter(shelter);
            });
          });

          // 지도 클릭 시 선택 해제
          window.kakao.maps.event.addListener(map, 'click', () => {
            setSelectedShelter(null);
          });
        });
      },
      () => {
        setPermissionDenied(true);
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

  return (
    <div css={mapStyle}>
      <div id="map" css={mapCanvas}></div>

      {selectedShelter && (
        <ShelterInfoCard
          shelter={selectedShelter}
          variant="home"
          onStart={() => {
            console.log('안내 시작 클릭됨:', selectedShelter.name);
          }}
        />
      )}
    </div>
  );
};

export default MapView;

/* 스타일 */
const mapStyle = css`
  width: 100%;
  height: calc(100vh - ${theme.spacing.spacing16});
  margin: 0;
  position: relative;
`;

const mapCanvas = css`
  width: 100%;
  height: 100%;
`;

const deniedStyle = css`
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: ${theme.colors.text.black};
  background: ${theme.colors.button.white};
  ${typography.text1};
`;
