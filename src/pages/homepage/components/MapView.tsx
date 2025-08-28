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
          };

          const map = new window.kakao.maps.Map(container, mapOption);
          mapInstanceRef.current = map;
          if (onMapReady) onMapReady(map);

          // 내 위치 마커
          const myMarker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(latitude, longitude),
          });
          myMarker.setMap(map);

          // 쉼터 마커 이미지
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

      {/* 선택된 쉼터 정보 카드 */}
      {selectedShelter && (
        <div css={infoCardStyle}>
          <div css={cardTop}>
            <img
              src={
                selectedShelter.photoUrl && selectedShelter.photoUrl.trim() !== ''
                  ? selectedShelter.photoUrl
                  : 'src/assets/images/NoImage.png'
              }
              alt={selectedShelter.name || 'shelter'}
              css={thumbnail}
            />
            <div css={infoText}>
              <p className="name">{selectedShelter.name}</p>
              <p>거리: {selectedShelter.distance}</p>
              <p>별점: {selectedShelter.averageRating} ⭐</p>
              <p>운영시간: 08:00 ~ 21:00</p>
            </div>
          </div>
          <button css={startButton}>안내 시작</button>
        </div>
      )}
    </div>
  );
};

export default MapView;

/* 스타일 */
const mapStyle = css`
  width: 100%;
  height: 100%;
  margin: 0;
  position: relative;
`;

const mapCanvas = css`
  width: 100%;
  height: 100%;
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

/* 카드 스타일 */
const infoCardStyle = css`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 95%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1000;
`;

const cardTop = css`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-bottom: 8px;
`;

const thumbnail = css`
  width: 40%;
  height: 230px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 12px;
`;

const infoText = css`
  flex: 1;
  text-align: left;

  p {
    margin: 2px 0;
    font-size: 2rem;
    font-weight: bold;
    color: #555;
  }

  .name {
    font-size: 2.2rem;
    color: #337afdff;
    margin-bottom: 6px;
  }
`;

const startButton = css`
  margin-top: 10px;
  width: 100%;
  background: #e53935;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-size: 2.6rem;
  font-weight: bold;
  cursor: pointer;
`;
