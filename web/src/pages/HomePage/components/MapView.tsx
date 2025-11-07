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
import { fetchSheltersByBbox, getAllShelters } from '@/api/shelterApi';

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
  const clusterOverlaysRef = useRef<HTMLDivElement[]>([]); // <-- 추가: DOM 오버레이 추적
  const dismissCleanupRef = useRef<() => void | null>(null);
  const [, setIsMapReady] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  // 재진입 시 로딩 화면을 표시하지 않기 위해 초기 상태를 체크
  const [isLoadingMap, setIsLoadingMap] = useState(() => MapCache.map === null);
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
        // 기본: dragend, zoomend
        const onDragEnd = tmapEvent.addListener(map, 'dragend', () => scheduleFetch(map));
        const onZoomEnd = tmapEvent.addListener(map, 'zoomend', () => scheduleFetch(map));
        mapListenersRef.current.push(onDragEnd, onZoomEnd);
        // 추가 폴백 이벤트들 (SDK마다 이벤트명이 다를 수 있어 여러 이벤트를 시도)
        try {
          const onMoveEnd = tmapEvent.addListener(map, 'moveend', () => scheduleFetch(map));
          const onCenterChanged = tmapEvent.addListener(map, 'center_changed', () =>
            scheduleFetch(map),
          );
          const onBoundsChanged = tmapEvent.addListener(map, 'bounds_changed', () =>
            scheduleFetch(map),
          );
          mapListenersRef.current.push(onMoveEnd, onCenterChanged, onBoundsChanged);
        } catch {}
      }
      // DOM-level 폴백: SDK 이벤트가 없거나 동작하지 않을 경우 map div의 mouseup/touchend로 보완
      try {
        const container: HTMLElement | null = map.getDiv ? map.getDiv() : mapRef.current;
        if (container) {
          const onEnd = () => {
            try {
              scheduleFetch(map);
            } catch {}
          };
          container.addEventListener('mouseup', onEnd, { passive: true });
          container.addEventListener('touchend', onEnd, { passive: true });
          // 저장된 핸들러 제거용으로 저장
          mapListenersRef.current.push({
            remove: () => container.removeEventListener('mouseup', onEnd),
          });
          mapListenersRef.current.push({
            remove: () => container.removeEventListener('touchend', onEnd),
          });
        }
      } catch {}
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
            // SDK 리스너 객체면 removeListener로 제거
            if (typeof ln === 'object' && ln && typeof ln.remove === 'function') {
              try {
                ln.remove();
              } catch {}
            } else {
              tmapEvent.removeListener(ln);
            }
          } catch {}
        });
      }
      // DOM 폴백으로 들어온 항목(remove 함수 포함)도 실행
      try {
        mapListenersRef.current.forEach((ln) => {
          try {
            if (typeof ln === 'object' && ln && typeof ln.remove === 'function') ln.remove();
          } catch {}
        });
      } catch {}
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
    // DOM 오버레이 제거
    try {
      const container = mapRef.current;
      clusterOverlaysRef.current.forEach((el: HTMLDivElement) => {
        try {
          if (container && container.contains(el)) container.removeChild(el);
        } catch {}
      });
      clusterOverlaysRef.current = [];
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

  // DOM 오버레이 방식으로 원형 + 숫자 렌더 (크기는 count에 따라 스케일)
  const renderClusterFeatures = (map: any, features: any[]) => {
    clearAllMarkers();

    // computeClusterSize는 renderClusterFeatures 내부에서 재사용하므로
    // createOverlayElement 바깥에 정의하여 폴백에서도 사용 가능하게 함
    const computeClusterSize = (count: number) => {
      // 기존 raw 계산(극단적 차이 허용)은 유지하되 최종 크기를 1/8로 축소
      const base = 8; // 축소된 최소 지름(px)
      const maxSize = 640; // 내부 raw에 대한 캡(원래 값 그대로 유지)
      const sqrtPart = Math.sqrt(Math.max(0, count)) * 8;
      const logPart = Math.log10(Math.max(1, count)) * 72;
      const raw = Math.round(28 + sqrtPart + logPart); // 원래 raw 기반
      // 1/8 스케일 적용
      const scaled = Math.round(raw / 8);
      const size = Math.min(maxSize, Math.max(base, scaled));
      // 폰트/그림자/테두리도 size 기준으로 계산
      const fontSize = Math.max(8, Math.min(48, Math.round(size * 0.22)));
      const shadowBlur = Math.max(3, Math.round(size * 0.06));
      const borderPx = Math.max(1, Math.round(Math.min(size * 0.08, 12)));
      return { size, fontSize, shadowBlur, borderPx };
    };

    const latLngToContainerPoint = (mapInst: any, lat: number, lng: number) => {
      try {
        if (!mapInst) return null;
        // Tmapv3 Projection or map methods
        if ((window as any).Tmapv3?.Projection && (window as any).Tmapv3.Projection.lngLatToPoint) {
          try {
            const p = (window as any).Tmapv3.Projection.lngLatToPoint([lng, lat]);
            if (p && typeof p[0] === 'number' && typeof p[1] === 'number')
              return { x: p[0], y: p[1] };
          } catch {}
        }
        if (typeof mapInst.latLngToPoint === 'function') {
          const p = mapInst.latLngToPoint(new window.Tmapv3.LatLng(lat, lng));
          if (p && typeof p.x === 'number' && typeof p.y === 'number') return { x: p.x, y: p.y };
        }
        if (typeof mapInst.fromLatLngToPoint === 'function') {
          const p = mapInst.fromLatLngToPoint(new window.Tmapv3.LatLng(lat, lng));
          if (p && typeof p.x === 'number' && typeof p.y === 'number') return { x: p.x, y: p.y };
        }
        if (mapInst.getProjection && typeof mapInst.getProjection === 'function') {
          const proj = mapInst.getProjection();
          if (proj && typeof proj.fromLatLngToPoint === 'function') {
            const p = proj.fromLatLngToPoint(new window.Tmapv3.LatLng(lat, lng));
            if (p && typeof p.x === 'number' && typeof p.y === 'number') return { x: p.x, y: p.y };
          }
        }
      } catch {}
      return null;
    };

    const positionOverlay = (mapInst: any, el: HTMLDivElement, lat: number, lng: number) => {
      const container = mapRef.current;
      if (!container) return false;
      const pt = latLngToContainerPoint(mapInst, lat, lng);
      if (pt) {
        el.style.position = 'absolute';
        el.style.left = `${Math.round(pt.x)}px`;
        el.style.top = `${Math.round(pt.y)}px`;
        el.style.transform = 'translate(-50%, -50%)';
        if (!container.contains(el)) container.appendChild(el);
        return true;
      }
      return false;
    };

    const createOverlayElement = (count: number, color: string) => {
      const { size, fontSize, shadowBlur, borderPx } = computeClusterSize(count);

      const el = document.createElement('div');
      el.className = 'cluster-overlay';
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.borderRadius = '50%';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.pointerEvents = 'auto';
      el.style.boxSizing = 'border-box';
      el.style.fontWeight = '800';
      el.style.color = '#ffffff';
      el.style.fontFamily = 'Arial, Helvetica, sans-serif';
      el.style.fontSize = `${fontSize}px`;
      el.style.background = color.indexOf('rgba') === 0 ? color : color;
      el.style.opacity = '0.95';
      el.style.boxShadow = `0 ${Math.round(shadowBlur / 2)}px ${shadowBlur * 2}px rgba(0,0,0,0.22)`;
      el.style.border = `${borderPx}px solid rgba(255,255,255,0.95)`;
      el.textContent = String(count);
      return el;
    };

    features.forEach((f: any, _idx: number) => {
      try {
        const lat = Number(f.latitude);
        const lng = Number(f.longitude);
        const count = Number(f.count ?? 0);
        if (!isFinite(lat) || !isFinite(lng)) return;

        // color 계산 (기존 코드) ...
        let color = '';
        if (count >= 9000) {
          color = 'rgba(220, 38, 38, 0.92)'; // 빨강
        } else if (count >= 4000) {
          color = 'rgba(255, 140, 0, 0.88)'; // 주황
        } else if (count >= 2000) {
          color = 'rgba(255, 190, 50, 0.86)'; // 주황-노랑 사이
        } else if (count >= 300) {
          color = 'rgba(70, 170, 70, 0.82)'; // 초록
        } else if (count <= 60) {
          color = 'rgba(0, 123, 255, 0.74)'; // 파랑
        } else {
          // 31 ~ 299 구간: 연한 초록(기본)
          color = 'rgba(106, 190, 120, 0.8)';
        }

        const overlay = createOverlayElement(count, color);
        const placed = positionOverlay(map, overlay, lat, lng);

        if (placed) {
          overlay.addEventListener('click', (ev) => {
            ev.stopPropagation();
            try {
              map.setCenter(new window.Tmapv3.LatLng(lat, lng));
              const z =
                typeof map.getZoom === 'function' ? map.getZoom() : (lastZoomRef.current ?? 13);
              if (typeof z === 'number') map.setZoom(z + 2);
            } catch {}
          });
          clusterOverlaysRef.current.push(overlay);
        } else {
          // 폴백: SVG 아이콘도 카운트 기반 크기를 사용하도록 변경
          // debug 로깅 추가
          // eslint-disable-next-line no-console
          console.debug('[cluster] positionOverlay failed, using marker fallback', {
            lat,
            lng,
            count,
          });

          const { size: svgSize, fontSize: svgFont } = computeClusterSize(count);
          // svgFont를 텍스트 크기로 사용 => TS 경고 제거 및 일관성 유지
          const textSize = Math.max(12, Math.round(svgFont));
          const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${svgSize}' height='${svgSize}' viewBox='0 0 ${svgSize} ${svgSize}'>
            <circle cx='${svgSize / 2}' cy='${svgSize / 2}' r='${Math.max(4, svgSize / 2 - 2)}' fill='${color}' stroke='rgba(0,0,0,0.08)' stroke-width='2' />
            <text x='50%' y='50%' font-family='Arial, Helvetica, sans-serif' font-size='${textSize}' fill='#fff' font-weight='700' dominant-baseline='middle' text-anchor='middle'>${count}</text>
          </svg>`;
          const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
          const blobUrl = URL.createObjectURL(blob);
          const marker = new window.Tmapv3.Marker({
            position: new window.Tmapv3.LatLng(lat, lng),
            icon: blobUrl,
            iconSize: new window.Tmapv3.Size(svgSize, svgSize),
            map,
          });
          try {
            (marker as any).__svgBlobUrl = blobUrl;
          } catch {}
          if (typeof (marker as any).on === 'function') {
            marker.on('click', () => {
              try {
                map.setCenter(new window.Tmapv3.LatLng(lat, lng));
                const z =
                  typeof map.getZoom === 'function' ? map.getZoom() : (lastZoomRef.current ?? 13);
                if (typeof z === 'number') map.setZoom(z + 2);
              } catch {}
            });
          } else if ((window as any).Tmapv3?.event?.addListener) {
            (window as any).Tmapv3.event.addListener(marker, 'click', () => {
              try {
                map.setCenter(new window.Tmapv3.LatLng(lat, lng));
                const z =
                  typeof map.getZoom === 'function' ? map.getZoom() : (lastZoomRef.current ?? 13);
                if (typeof z === 'number') map.setZoom(z + 2);
              } catch {}
            });
          }
          clusterMarkersRef.current.push(marker);
        }
      } catch {}
    });

    // 업데이트: drag/zoom 시 오버레이 위치 재계산
    const updatePositions = () => {
      try {
        const mapInst = mapInstanceRef.current || map;
        clusterOverlaysRef.current.forEach((el: HTMLDivElement, i: number) => {
          const f = features[i];
          if (!f) return;
          positionOverlay(mapInst, el, Number(f.latitude), Number(f.longitude));
        });
      } catch {}
    };
    try {
      const tmapEvent = (window as any).Tmapv3?.event;
      if (tmapEvent && typeof tmapEvent.addListener === 'function') {
        const l1 = tmapEvent.addListener(map, 'dragend', updatePositions);
        const l2 = tmapEvent.addListener(map, 'zoomend', updatePositions);
        mapListenersRef.current.push(l1, l2);
      }
    } catch {}
    setTimeout(updatePositions, 50);
  };

  // 서버 호출: zoom 레벨에 따라 분기
  const fetchByBbox = async (map: any) => {
    if (!map) return;
    try {
      const rawZoom =
        typeof map.getZoom === 'function' ? map.getZoom() : (lastZoomRef.current ?? 13);
      const zoom = Number(rawZoom);

      console.debug('[fetchByBbox] zoom level:', zoom);

      // zoom >= 13: 실제 API로 detail 모드 (쉼터 마커)
      if (zoom >= 13) {
        // Robust한 좌표 추출 헬퍼
        const tryExtract = (p: any) => {
          if (!p) return null;
          if (typeof p.getLat === 'function' && typeof p.getLng === 'function') {
            return { lat: Number(p.getLat()), lng: Number(p.getLng()) };
          }
          if (typeof p.lat === 'number' && typeof p.lng === 'number')
            return { lat: p.lat, lng: p.lng };
          if (typeof p.y === 'number' && typeof p.x === 'number') return { lat: p.y, lng: p.x };
          if (typeof p._lat === 'number' && typeof p._lng === 'number')
            return { lat: p._lat, lng: p._lng };
          if (typeof p.latitude === 'number' && typeof p.longitude === 'number')
            return { lat: p.latitude, lng: p.longitude };
          if (Array.isArray(p) && p.length >= 2) return { lat: Number(p[0]), lng: Number(p[1]) };
          return null;
        };

        // 지도 중앙 좌표 가져오기
        const centerRaw =
          typeof map.getCenter === 'function'
            ? map.getCenter()
            : ((MapCache as any).lastCenter ?? lastCenterRef.current);

        const center = tryExtract(centerRaw);

        if (!center || !isFinite(center.lat) || !isFinite(center.lng)) {
          console.warn('[fetchByBbox] invalid map center coordinates, skipping api call.', {
            centerRaw,
            center,
          });
          return;
        }

        console.debug('[fetchByBbox] detail mode - fetching shelters at center:', center);

        // API 호출: /api/shelters/all?latitude={latitude}&longitude={longitude}
        const res = await getAllShelters({
          latitude: center.lat,
          longitude: center.lng,
        });

        console.debug('[fetchByBbox] detail mode - api response:', res);

        // 응답이 배열인지 확인
        if (!Array.isArray(res)) {
          console.warn('[fetchByBbox] unexpected response format, expected array:', res);
          return;
        }

        const features = res;
        currentModeRef.current = 'detail';
        currentFeaturesRef.current = features;

        // detail 모드로 렌더링
        renderDetailFeatures(map, features);
      }
      // zoom < 13: mock 데이터로 cluster 모드
      else {
        const bboxRes = calcBboxFromMap(map);
        const bbox = {
          minLat: Number(bboxRes.minLat),
          minLng: Number(bboxRes.minLng),
          maxLat: Number(bboxRes.maxLat),
          maxLng: Number(bboxRes.maxLng),
        };

        console.debug('[fetchByBbox] cluster mode - bbox:', bbox, 'zoom:', zoom);

        // 최종 방어: 모든 값이 유한한 숫자인지 확인
        const vals = [bbox.minLat, bbox.minLng, bbox.maxLat, bbox.maxLng, zoom].map((v) =>
          Number(v),
        );
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

        const payload: any = {
          minLat: bbox.minLat,
          minLng: bbox.minLng,
          maxLat: bbox.maxLat,
          maxLng: bbox.maxLng,
          zoom,
        };

        // mock 데이터로 호출
        const FORCE_USE_MOCK = true;
        const res = await fetchSheltersByBbox(payload, FORCE_USE_MOCK);

        console.debug('[fetchByBbox] cluster mode - mock response:', res);

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
    if (!mapRef.current) {
      console.error('[MapView] mapRef.current가 null입니다!');
      return;
    }

    // 재진입 시 지도가 이미 있으면 로딩 화면 생략
    const isReentry = MapCache.map !== null;
    console.log('[MapView] initializeMap 시작:', { isReentry, location });
    if (!isReentry) {
      setIsLoadingMap(true);
    }
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

      console.log('[MapView] MapCache.ensureMap 호출, mapRef.current:', mapRef.current);
      const mapInstance = await MapCache.ensureMap(mapRef.current, createFn);
      if (!mapInstance) {
        console.error('[MapView] 지도 인스턴스 생성 실패');
        setMapError('지도 인스턴스를 생성할 수 없습니다.');
        setIsLoadingMap(false);
        return;
      }
      console.log('[MapView] mapInstance 획득 완료:', mapInstance);

      // 재진입 시에는 지도 상태가 이미 복원되었으므로 초기 위치 설정 스킵
      if (!isReentry) {
        try {
          if (isMapFullyLoaded(mapInstance)) {
            mapInstance.setCenter(new window.Tmapv3.LatLng(location.latitude, location.longitude));
            mapInstance.setZoom && mapInstance.setZoom(15);
          }
        } catch {}
      }

      // wait until map reports loaded then attach listeners
      const checkMapLoaded = () => {
        if (isMapFullyLoaded(mapInstance)) {
          mapInstanceRef.current = mapInstance;
          if (onMapReady) onMapReady(mapInstance);

          // 재진입 시 지도 렌더링 강제 갱신 (로그인 후 흰 화면 문제 해결)
          if (isReentry) {
            // requestAnimationFrame을 사용하여 브라우저 렌더링 사이클에 맞춤
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                try {
                  // 지도 리프레시 강제 실행
                  if (typeof mapInstance.updateSize === 'function') {
                    mapInstance.updateSize();
                  } else if (typeof mapInstance.refresh === 'function') {
                    mapInstance.refresh();
                  } else if (typeof mapInstance.repaint === 'function') {
                    mapInstance.repaint();
                  }
                  // 지도가 제대로 렌더링되었는지 확인 후 쉼터 조회
                  scheduleFetch(mapInstance);
                } catch {}
              });
            });
          } else {
            // 최초 로드 시에는 일반적으로 처리
            scheduleFetch(mapInstance);
          }

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
                // drag 폴백: 마우스 업/터치 엔드 시 fetch 예약 (짧은 디바운스로 중복 방지)
                const onEnd = () => scheduleFetch(mapInstance);
                container.addEventListener('mouseup', onEnd, { passive: true });
                container.addEventListener('touchend', onEnd, { passive: true });
                return () => {
                  try {
                    container.removeEventListener('click', domDismiss);
                    container.removeEventListener('touchend', domDismiss);
                    container.removeEventListener('mousedown', domDismiss);
                    container.removeEventListener('mouseup', onEnd);
                    container.removeEventListener('touchend', onEnd);
                  } catch {}
                };
              }
            } catch {}
            return () => {};
          })();

          setIsMapReady(true);

          // 재진입 시에는 로딩 화면을 즉시 숨김 (또는 매우 짧게)
          if (isReentry) {
            setIsLoadingMap(false);
            setIsFadingOut(false);
          } else {
            setIsFadingOut(true);
            const FADE_MS = 320;
            setTimeout(() => {
              setIsLoadingMap(false);
              setIsFadingOut(false);
            }, FADE_MS);
          }
        } else {
          setTimeout(checkMapLoaded, 100);
        }
      };
      // 재진입 시에는 지연 시간 단축 (즉시 실행)
      setTimeout(checkMapLoaded, isReentry ? 50 : 300);
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

        // 재진입 체크: 지도가 이미 있으면 로딩 화면을 표시하지 않음
        const isReentry = MapCache.map !== null;
        if (isReentry) {
          // 재진입 시 로딩 화면을 확실히 숨김
          setIsLoadingMap(false);
          setIsFadingOut(false);
        }

        const sdkOk = await waitForTmapSDK();
        if (!isMounted) return;
        if (!sdkOk) {
          setMapError('지도 SDK를 불러오지 못했습니다.');
          setIsLoadingMap(false);
          return;
        }

        // 재진입 시 지도가 이미 있으면 위치 조회 스킵 (마지막 상태 복원)
        if (isReentry) {
          // lastCenter가 있으면 복원, 없으면 현재 위치 조회
          if (MapCache.lastCenter) {
            // 지도 상태가 이미 복원되었으므로 위치 조회 없이 바로 초기화
            const locationData: LocationState = {
              latitude: MapCache.lastCenter.lat,
              longitude: MapCache.lastCenter.lng,
              accuracy: 0,
            };
            await initializeMap(locationData);
            return;
          } else {
            // 재진입이지만 lastCenter가 없는 경우 (로그인 후 첫 진입 등)
            // 현재 위치를 조회하여 지도 초기화
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
            return;
          }
        }

        // 최초 로드 시에만 위치 조회
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
