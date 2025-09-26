/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef, useState } from 'react';
import ShelterInfoCard from '@/components/ShelterInfoCard';
import theme from '@/styles/theme';
import { typography } from '@/styles/typography';
import markerImage from '@/assets/images/marker.png';
import type { LocationState, Shelter } from '../../GuidePage/types/tmap';

interface Props {
  onMapReady?: (map: any) => void;
  onUpdateMyLocation?: (lat: number, lng: number, moveCenter?: boolean) => void;
  shelters?: Shelter[];
}

const MapView = ({ onMapReady, onUpdateMyLocation, shelters = [] }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);

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

  // 지도 초기화 함수
  const initializeMap = async (location: LocationState) => {
    if (!mapRef.current) return;

    try {
      const center = new window.Tmapv3.LatLng(location.latitude, location.longitude);

      const mapInstance = new window.Tmapv3.Map(mapRef.current, {
        center: center,
        width: '100%',
        height: '100%',
        zoom: 15, // TODO: 반응형 줌 - 인접 쉼터(예: 3개) 좌표를 bounds로 계산해 모두 화면에 보이도록 fitBounds 적용. 사용자의 현재 위치도 포함해 margin(상하좌우) 고려하여 자동 줌/센터 설정할 것.
        zoomControl: true,
        scrollwheel: true,
      });

      // 지도 로드 완료 대기
      const checkMapLoaded = () => {
        if (isMapFullyLoaded(mapInstance)) {
          mapInstanceRef.current = mapInstance;
          if (onMapReady) onMapReady(mapInstance);
          addShelterMarkers(mapInstance);
          if (onUpdateMyLocation) {
            onUpdateMyLocation(location.latitude, location.longitude, true);
          }
          attachMapDismissHandlers(mapInstance);
        } else {
          setTimeout(checkMapLoaded, 100);
        }
      };

      setTimeout(checkMapLoaded, 500);
    } catch (err) {
      console.error('지도 초기화 실패:', err);
    }
  };

  // 쉼터 마커 추가
  const addShelterMarkers = (map: any) => {
    if (!map || !window.Tmapv3) return;

    shelters.forEach((shelter) => {
      try {
        const shelterMarker = new window.Tmapv3.Marker({
          position: new window.Tmapv3.LatLng(shelter.latitude, shelter.longitude),
          iconSize: new window.Tmapv3.Size(24, 35),
          icon: markerImage, // 이미지 URL 사용
          map: map,
        });

        // 마커 클릭 이벤트
        shelterMarker.on('click', () => {
          setSelectedShelter(shelter);
        });
      } catch (err) {
        console.error('마커 생성 실패:', err);
      }
    });
  };

  // 지도 클릭/터치 시 정보창 닫기 핸들러 부착
  const attachMapDismissHandlers = (map: any) => {
    if (!map) return;

    // DOM 레벨 보강: getDiv()에 네이티브 이벤트 바인딩 (가장 안정적)
    try {
      const container: HTMLElement | null = map.getDiv ? map.getDiv() : null;
      if (container) {
        const domDismiss = () => {
          setSelectedShelter(null);
        };
        container.addEventListener('click', domDismiss, { passive: true });
        container.addEventListener('touchend', domDismiss, { passive: true });
        container.addEventListener('mousedown', domDismiss, { passive: true });
      }
    } catch {}
  };

  useEffect(() => {
    let isMounted = true;

    const setupMap = async () => {
      try {
        if (!isMounted) return;

        // TMAP SDK 준비 대기
        await waitForTmapSDK();
        if (!isMounted) return;

        // 현재 위치 획득
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            if (!isMounted) return;

            setPermissionDenied(false);
            const locationData: LocationState = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            };

            await initializeMap(locationData);
          },
          () => {
            if (!isMounted) return;
            setPermissionDenied(true);
          },
          { enableHighAccuracy: true, timeout: 10000 },
        );
      } catch (err) {
        console.error('지도 설정 실패:', err);
      }
    };

    setupMap();

    return () => {
      isMounted = false;
    };
  }, []);

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
      <div ref={mapRef} css={mapCanvas}></div>

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
