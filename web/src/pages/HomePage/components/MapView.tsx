/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef, useState } from 'react';
import loadingGif from '@/assets/images/loading.gif';
import ShelterInfoCard from '@/components/ShelterInfoCard';
import theme from '@/styles/theme';
import { typography } from '@/styles/typography';
import markerImage from '@/assets/images/marker.png';
import type { LocationState, Shelter } from '../../GuidePage/types/tmap';
import MapCache from '@/lib/MapCache'; // 추가: 전역 캐시

interface Props {
  onMapReady?: (map: any) => void;
  onUpdateMyLocation?: (lat: number, lng: number, moveCenter?: boolean) => void;
  shelters?: Shelter[];
}

const MapView = ({ onMapReady, onUpdateMyLocation, shelters = [] }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const shelterMarkersRef = useRef<any[]>([]); // 변경: 생성한 마커 보관
  const dismissCleanupRef = useRef<() => void | null>(null); // 추가: 이벤트 cleanup
  const [isMapReady, setIsMapReady] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  // 로딩/에러 상태
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  // 오버레이 페이드 아웃 상태
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [, setMapError] = useState<string | null>(null);
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

  // 쉼터 마커 추가
  const addShelterMarkers = (map: any) => {
    if (!map || !window.Tmapv3) {
      console.warn('addShelterMarkers: map 또는 Tmapv3 없음', { map, hasTmap: !!window.Tmapv3 });
      return;
    }

    // 기존 마커 제거
    try {
      shelterMarkersRef.current.forEach((m) => {
        try {
          m.setMap(null);
        } catch {}
      });
    } catch {}
    shelterMarkersRef.current = [];

    shelters.forEach((shelter, idx) => {
      try {
        const lat = shelter?.latitude != null ? Number(shelter.latitude) : NaN;
        const lng = shelter?.longitude != null ? Number(shelter.longitude) : NaN;
        if (!isFinite(lat) || !isFinite(lng)) {
          console.warn(`invalid coords, skip marker index=${idx}`, shelter);
          return;
        }

        const shelterMarker = new window.Tmapv3.Marker({
          position: new window.Tmapv3.LatLng(lat, lng),
          iconSize: new window.Tmapv3.Size(24, 35),
          icon: typeof markerImage === 'string' ? markerImage : undefined,
          map: map,
        });

        if (typeof (shelterMarker as any).on === 'function') {
          shelterMarker.on('click', () => setSelectedShelter(shelter));
        } else if ((window as any).Tmapv3?.event?.addListener) {
          (window as any).Tmapv3.event.addListener(shelterMarker, 'click', () =>
            setSelectedShelter(shelter),
          );
        }

        shelterMarkersRef.current.push(shelterMarker);
      } catch (err) {
        console.error('마커 생성 실패:', err, shelter);
      }
    });
  };

  // 지도 클릭/터치 시 정보창 닫기 핸들러 부착
  // 이제 cleanup 함수를 반환하도록 변경
  const attachMapDismissHandlers = (map: any) => {
    if (!map) return () => {};
    try {
      const container: HTMLElement | null = map.getDiv ? map.getDiv() : null;
      if (container) {
        const domDismiss = () => {
          setSelectedShelter(null);
        };
        container.addEventListener('click', domDismiss, { passive: true });
        container.addEventListener('touchend', domDismiss, { passive: true });
        container.addEventListener('mousedown', domDismiss, { passive: true });

        // cleanup
        return () => {
          try {
            container.removeEventListener('click', domDismiss);
            container.removeEventListener('touchend', domDismiss);
            container.removeEventListener('mousedown', domDismiss);
          } catch {}
        };
      }
    } catch {}
    return () => {};
  };

  // 지도 초기화 함수 (MapCache 사용하여 재사용)
  const initializeMap = async (location: LocationState) => {
    if (!mapRef.current) return;

    setIsLoadingMap(true);
    setMapError(null);
    try {
      const createFn = () =>
        new window.Tmapv3.Map(mapRef.current as HTMLElement, {
          center: new window.Tmapv3.LatLng(location.latitude, location.longitude),
          width: '100%',
          height: '100%',
          zoom: 15,
          zoomControl: true,
          scrollwheel: true,
        });

      const mapInstance = await MapCache.ensureMap(mapRef.current, createFn);

      if (!mapInstance) {
        setMapError('지도 인스턴스를 생성할 수 없습니다.');
        setIsLoadingMap(false);
        return;
      }

      // 재사용 시 중심 및 줌 보정
      try {
        if (isMapFullyLoaded(mapInstance)) {
          mapInstance.setCenter(new window.Tmapv3.LatLng(location.latitude, location.longitude));
          mapInstance.setZoom && mapInstance.setZoom(15);
        }
      } catch {}

      // mapInstance가 완전히 로드될 때까지 대기 후 초기 처리 실행
      const checkMapLoaded = () => {
        if (isMapFullyLoaded(mapInstance)) {
          mapInstanceRef.current = mapInstance;
          if (onMapReady) onMapReady(mapInstance);
          addShelterMarkers(mapInstance);
          if (onUpdateMyLocation) {
            onUpdateMyLocation(location.latitude, location.longitude, true);
          }
          // 기존에 붙어있던 핸들러 정리 후 재부착
          try {
            if (dismissCleanupRef.current) {
              dismissCleanupRef.current();
            }
          } catch {}
          dismissCleanupRef.current = attachMapDismissHandlers(mapInstance);
          setIsMapReady(true);
          // 페이드 아웃으로 전환
          setIsFadingOut(true);
          // CSS 전환 시간과 일치시킴 (아래 loadingOverlayStyle의 transition 시간과 동일하게 유지)
          const FADE_MS = 320;
          setTimeout(() => {
            setIsLoadingMap(false);
            setIsFadingOut(false);
          }, FADE_MS);
        } else {
          setTimeout(checkMapLoaded, 100);
        }
      };

      setTimeout(checkMapLoaded, 300);
    } catch (err: any) {
      console.error('지도 초기화 실패:', err);
      setMapError(err?.message || '지도 초기화 중 오류가 발생했습니다.');
      setIsLoadingMap(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const setupMap = async () => {
      try {
        if (!isMounted) return;

        // TMAP SDK 준비 대기
        const sdkOk = await waitForTmapSDK();
        if (!isMounted) return;
        if (!sdkOk) {
          setMapError('지도 SDK를 불러오지 못했습니다.');
          setIsLoadingMap(false);
          return;
        }

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
            setIsLoadingMap(false);
          },
          { enableHighAccuracy: true, timeout: 10000 },
        );
      } catch (err) {
        console.error('지도 설정 실패:', err);
        setMapError('지도 설정 중 오류가 발생했습니다.');
        setIsLoadingMap(false);
      }
    };

    setupMap();

    return () => {
      isMounted = false;
      // 언마운트 시 마커 DOM만 제거하고 map 인스턴스는 캐시에 유지 (재사용 목적)
      try {
        shelterMarkersRef.current.forEach((m) => m.setMap(null));
        shelterMarkersRef.current = [];
      } catch {}

      // 이벤트 핸들러 정리
      try {
        if (dismissCleanupRef.current) {
          dismissCleanupRef.current();
          dismissCleanupRef.current = null;
        }
      } catch {}

      // map DOM을 페이지 DOM에서 분리하되 인스턴스는 유지
      try {
        MapCache.detach();
      } catch {}
    };
  }, []);

  // shelters prop 변경 시 마커 갱신
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (isMapFullyLoaded(map) && window.Tmapv3) addShelterMarkers(map);
  }, [shelters]);

  // 지도 준비 완료되었을 때 현재 shelters로 마커 갱신 (shelters가 먼저 로드된 경우 대비)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (isMapReady && isMapFullyLoaded(map) && window.Tmapv3) {
      addShelterMarkers(map);
    }
  }, [isMapReady, shelters]);

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
      <div ref={mapRef} css={mapCanvas} />

      {/* 로딩/오류 오버레이 */}
      {(isLoadingMap || isFadingOut) && (
        <div
          css={loadingOverlayStyle}
          // opacity 제어로 페이드 인/아웃. isFadingOut true면 0으로 => fade out
          style={{ opacity: isFadingOut ? 0 : 1 }}
        >
          <div css={loadingContentStyle}>
            <img src={loadingGif} alt="loading" css={loadingImageStyle} />
          </div>
        </div>
      )}

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
  min-height: 0;
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

const loadingOverlayStyle = css`
  position: absolute;
  inset: 0;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  transition: opacity 320ms ease;
  pointer-events: none; /* 버튼 클릭을 방해하지 않도록 */
`;

const loadingContentStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const loadingImageStyle = css`
  width: 100%;
  object-fit: contain;
  z-index: 1300;
`;
