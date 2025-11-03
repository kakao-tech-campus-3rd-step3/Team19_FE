/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef, useState } from 'react';
import loadingGif from '@/assets/images/loading.gif';
import ShelterInfoCard from '@/components/ShelterInfoCard';
import theme from '@/styles/theme';
import { typography } from '@/styles/typography';
import markerImage from '@/assets/images/marker.png';
import type { LocationState, Shelter } from '../../GuidePage/types/tmap';
import MapCache from '@/lib/MapCache';
import { getSheltersByBbox } from '@/api/shelterApi';

interface Props {
  onMapReady?: (map: any) => void;
  onUpdateMyLocation?: (lat: number, lng: number, moveCenter?: boolean) => void;
  shelters?: Shelter[]; // (이제 MapView가 자체 조회하므로 props로 내려받은 목록은 optional)
}

const MapView = ({ onMapReady }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const shelterMarkersRef = useRef<any[]>([]);
  const clusterMarkersRef = useRef<any[]>([]);
  const dismissCleanupRef = useRef<() => void | null>(null);
  const [, setIsMapReady] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [, setMapError] = useState<string | null>(null);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);

  // 서버에서 내려온 현재 레이어
  const currentModeRef = useRef<'cluster' | 'detail' | null>(null);
  const currentFeaturesRef = useRef<any[]>([]);

  // 디바운스/변화 감지
  const lastCenterRef = useRef<{ lat: number; lng: number } | null>(null);
  const lastZoomRef = useRef<number | null>(null);
  const fetchTimerRef = useRef<number | null>(null);
  const pollTimerRef = useRef<number | null>(null);
  const DEBOUNCE_MS = 300;
  // 페이징 기본값 — 필요시 값 조정 또는 props로 노출 가능
  const PAGE_DEFAULT = 0;
  const pageRef = useRef<number>(PAGE_DEFAULT);

  // TMAP SDK 준비(기존)
  const waitForTmapSDK = (): Promise<boolean> => {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 50;
      const checkSDK = () => {
        if (window.Tmapv3 && window.Tmapv3.Map) {
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

  const isMapFullyLoaded = (mapInstance: any): boolean => {
    try {
      return (
        mapInstance && mapInstance.getZoom && mapInstance.getCenter && mapInstance.getZoom() > 0
      );
    } catch (err) {
      return false;
    }
  };

  // helper: bbox 계산 (여러 SDK 메서드에 대응) + 4개 꼭짓점 반환
  const calcBboxFromMap = (map: any) => {
    const tryExtract = (p: any) => {
      if (!p) return null;
      if (typeof p.getLat === 'function' && typeof p.getLng === 'function') {
        return { lat: Number(p.getLat()), lng: Number(p.getLng()) };
      }
      if (typeof p.lat === 'number' && typeof p.lng === 'number') return { lat: p.lat, lng: p.lng };
      if (typeof p.y === 'number' && typeof p.x === 'number') return { lat: p.y, lng: p.x };
      if (typeof p._lat === 'number' && typeof p._lng === 'number')
        return { lat: p._lat, lng: p._lng };
      if (typeof p.latitude === 'number' && typeof p.longitude === 'number')
        return { lat: p.latitude, lng: p.longitude };
      if (Array.isArray(p) && p.length >= 2) return { lat: Number(p[0]), lng: Number(p[1]) };
      return null;
    };

    try {
      // 1) getBounds() -> try to get four corners
      if (typeof map.getBounds === 'function') {
        const b = map.getBounds();
        const swRaw = b.getSouthWest ? b.getSouthWest() : (b._southWest ?? b.southWest ?? null);
        const neRaw = b.getNorthEast ? b.getNorthEast() : (b._northEast ?? b.northEast ?? null);
        const sw = tryExtract(swRaw);
        const ne = tryExtract(neRaw);
        if (
          sw &&
          ne &&
          isFinite(sw.lat) &&
          isFinite(sw.lng) &&
          isFinite(ne.lat) &&
          isFinite(ne.lng)
        ) {
          const minLat = Math.min(sw.lat, ne.lat);
          const maxLat = Math.max(sw.lat, ne.lat);
          const minLng = Math.min(sw.lng, ne.lng);
          const maxLng = Math.max(sw.lng, ne.lng);
          // compute NW and SE explicitly
          const nw = { lat: maxLat, lng: minLng };
          const se = { lat: minLat, lng: maxLng };
          return { minLat, minLng, maxLat, maxLng, corners: { sw, nw, ne, se } };
        }
      }

      // 2) getExtent()
      if (typeof map.getExtent === 'function') {
        const e = map.getExtent();
        const minLat = Number(e.minY ?? e.south ?? e.minLat);
        const maxLat = Number(e.maxY ?? e.north ?? e.maxLat);
        const minLng = Number(e.minX ?? e.west ?? e.minLng);
        const maxLng = Number(e.maxX ?? e.east ?? e.maxLng);
        if ([minLat, maxLat, minLng, maxLng].every((v) => isFinite(v))) {
          const sw = { lat: minLat, lng: minLng };
          const ne = { lat: maxLat, lng: maxLng };
          const nw = { lat: maxLat, lng: minLng };
          const se = { lat: minLat, lng: maxLng };
          return { minLat, minLng, maxLat, maxLng, corners: { sw, nw, ne, se } };
        }
      }

      // 3) fallback: center + zoom 기반 근사 bbox
      const c = map.getCenter ? map.getCenter() : null;
      const center = tryExtract(c) ?? { lat: 0, lng: 0 };
      const zoom =
        typeof map.getZoom === 'function'
          ? Number(map.getZoom())
          : Number(lastZoomRef.current ?? 13);
      const spanDeg = Math.max(0.005, Math.min(20, 360 / Math.pow(2, Math.max(1, zoom))));
      const half = spanDeg / 2;
      const minLat = center.lat - half;
      const maxLat = center.lat + half;
      const minLng = center.lng - half;
      const maxLng = center.lng + half;
      const sw = { lat: minLat, lng: minLng };
      const ne = { lat: maxLat, lng: maxLng };
      const nw = { lat: maxLat, lng: minLng };
      const se = { lat: minLat, lng: maxLng };
      console.warn('[calcBboxFromMap] fallback bbox used', { center, zoom, spanDeg });
      return { minLat, minLng, maxLat, maxLng, corners: { sw, nw, ne, se } };
    } catch (err) {
      const c = map.getCenter ? map.getCenter() : null;
      const center = tryExtract(c) ?? { lat: 0, lng: 0 };
      const span = 0.5;
      const minLat = center.lat - span;
      const maxLat = center.lat + span;
      const minLng = center.lng - span;
      const maxLng = center.lng + span;
      const sw = { lat: minLat, lng: minLng };
      const ne = { lat: maxLat, lng: maxLng };
      const nw = { lat: maxLat, lng: minLng };
      const se = { lat: minLat, lng: maxLng };
      console.error('calcBboxFromMap error, fallback used', err);
      return { minLat, minLng, maxLat, maxLng, corners: { sw, nw, ne, se } };
    }
  };

  // attach map drag/zoom listeners if SDK event API available
  const mapListenersRef = useRef<any[]>([]);
  const attachMapEventListeners = (map: any) => {
    try {
      const tmapEvent = (window as any).Tmapv3?.event;
      if (tmapEvent && typeof tmapEvent.addListener === 'function') {
        const onDragEnd = tmapEvent.addListener(map, 'dragend', () => scheduleFetch(map));
        const onZoomEnd = tmapEvent.addListener(map, 'zoomend', () => scheduleFetch(map));
        mapListenersRef.current.push(onDragEnd, onZoomEnd);
      }
    } catch (e) {
      // ignore - poll fallback remains
    }
  };
  const detachMapEventListeners = () => {
    try {
      const tmapEvent = (window as any).Tmapv3?.event;
      if (tmapEvent && typeof tmapEvent.removeListener === 'function') {
        mapListenersRef.current.forEach((ln) => {
          try {
            tmapEvent.removeListener(ln);
          } catch {}
        });
      }
      mapListenersRef.current = [];
    } catch {}
  };

  // 서버 응답을 화면에 렌더
  const clearAllMarkers = () => {
    try {
      shelterMarkersRef.current.forEach((m) => {
        try {
          m.setMap(null);
        } catch {}
      });
      shelterMarkersRef.current = [];
    } catch {}
    try {
      clusterMarkersRef.current.forEach((c) => {
        try {
          c.setMap(null);
        } catch {}
      });
      clusterMarkersRef.current = [];
    } catch {}
  };

  const renderDetailFeatures = (map: any, features: any[]) => {
    clearAllMarkers();
    features.forEach((f) => {
      try {
        const lat = Number(f.latitude);
        const lng = Number(f.longitude);
        if (!isFinite(lat) || !isFinite(lng)) return;
        const marker = new window.Tmapv3.Marker({
          position: new window.Tmapv3.LatLng(lat, lng),
          iconSize: new window.Tmapv3.Size(28, 38),
          icon: typeof markerImage === 'string' ? markerImage : undefined,
          map,
        });
        if (typeof (marker as any).on === 'function') {
          marker.on('click', () => setSelectedShelter(f));
        } else if ((window as any).Tmapv3?.event?.addListener) {
          (window as any).Tmapv3.event.addListener(marker, 'click', () => setSelectedShelter(f));
        }
        shelterMarkersRef.current.push(marker);
      } catch (err) {
        // ignore
      }
    });
  };

  const renderClusterFeatures = (map: any, features: any[]) => {
    clearAllMarkers();
    // 간단한 원형 오버레이 + 텍스트를 사용 (Marker 대신 CustomOverlay 필요 시 변경)
    features.forEach((f) => {
      try {
        const lat = Number(f.latitude);
        const lng = Number(f.longitude);
        const count = Number(f.count ?? 0);
        if (!isFinite(lat) || !isFinite(lng)) return;

        // Create a simple DOM element for cluster
        const el = document.createElement('div');
        el.style.minWidth = '44px';
        el.style.height = '44px';
        el.style.background = 'rgba(70,170,70,0.9)';
        el.style.borderRadius = '50%';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.color = '#fff';
        el.style.fontWeight = '700';
        el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.25)';
        el.innerText = String(count);

        // Tmap 커스텀 오버레이 생성 방식이 다양하므로 marker로 우회 가능하면 마커에 HTML 넣기
        const customMarker = new window.Tmapv3.Marker({
          position: new window.Tmapv3.LatLng(lat, lng),
          icon: undefined,
          map,
        });

        // attach DOM overlay near marker if available
        try {
          const div = customMarker.getDiv ? customMarker.getDiv() : null;
          if (div && div.parentElement) {
            // 포지션된 요소가 아니면 별도 오버레이로 처리
            const overlay = document.createElement('div');
            overlay.style.position = 'absolute';
            overlay.appendChild(el);
            // fallback: append to map container and position on click/refresh (skip complex positioning)
            // As fallback we simply set marker icon as data-URL or use default marker with count via CSS is complex.
          } else {
            // fallback: set marker icon to default marker (ignoring HTML) — still provides clickable spot
          }
        } catch {}

        // 클릭 시 확대 동작을 권장(맵 센터/줌 조정)
        try {
          if (typeof (customMarker as any).on === 'function') {
            customMarker.on('click', () => {
              // 클러스터 클릭 시 맵을 해당 위치로 센터 + 한 단계 줌 인
              try {
                map.setCenter(new window.Tmapv3.LatLng(lat, lng));
                const z = map.getZoom ? map.getZoom() : null;
                if (typeof z === 'number') map.setZoom(z + 2);
              } catch {}
            });
          } else if ((window as any).Tmapv3?.event?.addListener) {
            (window as any).Tmapv3.event.addListener(customMarker, 'click', () => {
              try {
                map.setCenter(new window.Tmapv3.LatLng(lat, lng));
                const z = map.getZoom ? map.getZoom() : null;
                if (typeof z === 'number') map.setZoom(z + 2);
              } catch {}
            });
          }
        } catch {}

        clusterMarkersRef.current.push(customMarker);
      } catch {}
    });
  };

  // 서버 호출: bbox + zoom
  const fetchByBbox = async (map: any) => {
    if (!map) return;
    try {
      const rawZoom =
        typeof map.getZoom === 'function' ? map.getZoom() : (lastZoomRef.current ?? 13);
      const zoom = Number(rawZoom);
      const bboxRes = calcBboxFromMap(map);
      const bbox = {
        minLat: Number(bboxRes.minLat),
        minLng: Number(bboxRes.minLng),
        maxLat: Number(bboxRes.maxLat),
        maxLng: Number(bboxRes.maxLng),
      };
      const corners = bboxRes.corners ?? null;
      console.debug('[fetchByBbox] corners:', corners, 'bbox:', bbox, 'zoom:', zoom);

      // 최종 방어: 모든 값이 유한한 숫자인지 확인. 아니면 호출 건너뜀.
      const vals = [bbox.minLat, bbox.minLng, bbox.maxLat, bbox.maxLng, zoom].map((v) => Number(v));
      if (!vals.every((v) => isFinite(v))) {
        console.warn('[fetchByBbox] invalid params after calc, skip API call', { bbox, zoom });
        return;
      }

      // 안전 범위: 지나치게 큰 bbox는 서버 부담이므로 차단
      const spanLat = Math.abs(bbox.maxLat - bbox.minLat);
      const spanLng = Math.abs(bbox.maxLng - bbox.minLng);
      if (spanLat > 60 || spanLng > 60) {
        console.warn('[fetchByBbox] bbox too large, skip API call', { spanLat, spanLng });
        return;
      }

      const minLat = Number(bbox.minLat);
      const minLng = Number(bbox.minLng);
      const maxLat = Number(bbox.maxLat);
      const maxLng = Number(bbox.maxLng);

      // call API (page/size 추가)
      const res = await getSheltersByBbox({
        minLat,
        minLng,
        maxLat,
        maxLng,
        zoom,
      });
      console.debug('[fetchByBbox] api response:', res);

      const mode =
        res?.mode ?? (res?.features && Array.isArray(res.features) ? 'detail' : 'cluster');
      const features = res?.features ?? [];

      currentModeRef.current = mode;
      currentFeaturesRef.current = features;

      if (mode === 'detail') {
        renderDetailFeatures(map, features);
      } else {
        renderClusterFeatures(map, features);
      }
    } catch (err) {
      console.error('fetchByBbox error', err);
    }
  };

  // 디바운스 래퍼: 지도 변화가 멈춘 뒤 호출
  const scheduleFetch = (map: any) => {
    if (fetchTimerRef.current) {
      window.clearTimeout(fetchTimerRef.current);
    }
    // 지도 이동/줌 시 새 검색은 page를 초기화
    pageRef.current = PAGE_DEFAULT;
    fetchTimerRef.current = window.setTimeout(() => {
      fetchByBbox(map);
    }, DEBOUNCE_MS);
  };

  // 지도 초기화 (MapCache 기반, 기존 코드 재사용)
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
          zoom: 13,
          zoomControl: true,
          scrollwheel: true,
        });

      const mapInstance = await MapCache.ensureMap(mapRef.current, createFn);
      if (!mapInstance) {
        setMapError('지도 인스턴스를 생성할 수 없습니다.');
        setIsLoadingMap(false);
        return;
      }

      try {
        if (isMapFullyLoaded(mapInstance)) {
          mapInstance.setCenter(new window.Tmapv3.LatLng(location.latitude, location.longitude));
          mapInstance.setZoom && mapInstance.setZoom(13);
        }
      } catch {}

      // wait until map reports loaded then attach listeners
      const checkMapLoaded = () => {
        if (isMapFullyLoaded(mapInstance)) {
          mapInstanceRef.current = mapInstance;
          if (onMapReady) onMapReady(mapInstance);

          // 초기 fetch
          scheduleFetch(mapInstance);

          // attach listeners for drag/zoom end (best-effort)
          attachMapEventListeners(mapInstance);

          // poll map center/zoom change (간단한 방법: 폴링 + 디바운스)
          if (pollTimerRef.current === null) {
            pollTimerRef.current = window.setInterval(() => {
              try {
                const map = mapInstanceRef.current;
                if (!map) return;
                const c = map.getCenter ? map.getCenter() : null;
                const lat = c ? (c.lat ?? c.y ?? 0) : 0;
                const lng = c ? (c.lng ?? c.x ?? 0) : 0;
                const z = map.getZoom ? map.getZoom() : null;

                const lastC = lastCenterRef.current;
                const lastZ = lastZoomRef.current;

                const moved =
                  !lastC || Math.abs(lastC.lat - lat) > 1e-6 || Math.abs(lastC.lng - lng) > 1e-6;
                const zoomed = lastZ === null || z !== lastZ;

                if (moved || zoomed) {
                  lastCenterRef.current = { lat, lng };
                  lastZoomRef.current = z;
                  scheduleFetch(map);
                }
              } catch (e) {}
            }, 250);
          }

          // attach click/touch handlers cleanup
          try {
            if (dismissCleanupRef.current) dismissCleanupRef.current();
          } catch {}
          dismissCleanupRef.current = (() => {
            try {
              const container: HTMLElement | null = mapInstance.getDiv
                ? mapInstance.getDiv()
                : null;
              if (container) {
                const domDismiss = () => setSelectedShelter(null);
                container.addEventListener('click', domDismiss, { passive: true });
                container.addEventListener('touchend', domDismiss, { passive: true });
                container.addEventListener('mousedown', domDismiss, { passive: true });
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
          })();

          setIsMapReady(true);
          setIsFadingOut(true);
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
        const sdkOk = await waitForTmapSDK();
        if (!isMounted) return;
        if (!sdkOk) {
          setMapError('지도 SDK를 불러오지 못했습니다.');
          setIsLoadingMap(false);
          return;
        }
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
      try {
        shelterMarkersRef.current.forEach((m) => m.setMap(null));
        shelterMarkersRef.current = [];
      } catch {}
      try {
        clusterMarkersRef.current.forEach((m) => m.setMap(null));
        clusterMarkersRef.current = [];
      } catch {}
      try {
        if (dismissCleanupRef.current) {
          dismissCleanupRef.current();
          dismissCleanupRef.current = null;
        }
      } catch {}
      // detach listeners
      try {
        detachMapEventListeners();
      } catch {}
      try {
        MapCache.detach();
      } catch {}
      if (pollTimerRef.current) {
        window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      if (fetchTimerRef.current) {
        window.clearTimeout(fetchTimerRef.current);
        fetchTimerRef.current = null;
      }
    };
  }, []);

  // 선택된 쉼터 정보창 렌더링 (기존)
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
      {(isLoadingMap || isFadingOut) && (
        <div css={loadingOverlayStyle} style={{ opacity: isFadingOut ? 0 : 1 }}>
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

/* 스타일 (기존 그대로) */
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
  pointer-events: none;
`;
const loadingContentStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;
const loadingImageStyle = css`
  width: 100%;
  object-fit: contain;
  z-index: 1300;
`;
