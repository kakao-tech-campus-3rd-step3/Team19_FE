import { useState } from 'react';
import type { LocationState, Shelter, RouteData } from '../types/tmap';

export interface GuidancePoint {
  description: string;
  latitude: number;
  longitude: number;
  turnType?: number;
  pointType?: string;
  index?: number;
}

interface UseRouteCalculationProps {
  map: any;
  isMapFullyLoaded: (mapInstance: any) => boolean;
}

export const useRouteCalculation = ({ map, isMapFullyLoaded }: UseRouteCalculationProps) => {
  const [routePolyline, setRoutePolyline] = useState<any>(null);
  const [routeDataState, setRouteDataState] = useState<RouteData | null>(null);
  const [guidanceSteps, setGuidanceSteps] = useState<string[]>([]);
  const [guidancePoints, setGuidancePoints] = useState<GuidancePoint[]>([]);
  const [dottedSegments, setDottedSegments] = useState<any[] | null>(null);

  // Haversine distance (m)
  const haversineMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 기존 폴리라인/점선 제거 헬퍼
  const clearExistingRoute = () => {
    if (routePolyline) {
      try {
        if (Array.isArray(routePolyline)) {
          routePolyline.forEach((p) => p && p.setMap && p.setMap(null));
        } else if (routePolyline && routePolyline.setMap) {
          routePolyline.setMap(null);
        }
      } catch (err) {
        console.warn('기존 경로 제거 중 오류:', err);
      }
      setRoutePolyline(null);
    }
    if (dottedSegments && Array.isArray(dottedSegments)) {
      try {
        dottedSegments.forEach((seg) => seg && seg.setMap && seg.setMap(null));
      } catch {}
      setDottedSegments(null);
    }
  };

  // 보행자 경로 계산 API 호출
  const calculatePedestrianRoute = async (
    start: LocationState,
    destination: Shelter,
  ): Promise<RouteData> => {
    console.log('보행자 경로 계산 시작:', { start, destination });

    const requestBody = {
      startX: start.longitude,
      startY: start.latitude,
      endX: destination.longitude,
      endY: destination.latitude,
      startName: '현재위치',
      endName: destination.name,
      searchOption: 0, // 추천 경로
      reqCoordType: 'WGS84GEO',
      resCoordType: 'WGS84GEO',
    };

    console.log('API 요청 데이터:', requestBody);

    const response = await fetch('https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1', {
      method: 'POST',
      headers: {
        appKey: import.meta.env.VITE_TMAP_APP_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 응답 에러:', response.status, errorText);
      throw new Error(`경로 계산 실패: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API 응답 성공:', data);
    return data;
  };

  // 지도상의 Tmap LatLng 객체에서 위/경도 추출 (호환성 확보)
  const extractLatLng = (pt: any) => {
    if (!pt) return { lat: 0, lng: 0 };
    if (typeof pt.getLat === 'function' && typeof pt.getLng === 'function') {
      return { lat: pt.getLat(), lng: pt.getLng() };
    }
    if ('_lat' in pt && '_lng' in pt) return { lat: pt._lat, lng: pt._lng };
    if ('lat' in pt && 'lng' in pt) return { lat: pt.lat, lng: pt.lng };
    if ('latitude' in pt && 'longitude' in pt) return { lat: pt.latitude, lng: pt.longitude };
    return { lat: 0, lng: 0 };
  };

  // 경로를 지도에 표시 (경로 좌표 배열 반환)
  const displayRouteOnMap = (routeData: RouteData): any[] => {
    if (!map || !window.Tmapv3) {
      console.warn('지도 또는 TMAP SDK가 준비되지 않음');
      return [];
    }

    // 지도가 완전히 로드되었는지 확인
    if (!isMapFullyLoaded(map)) {
      console.warn('지도가 아직 완전히 로드되지 않음, 1초 후 재시도');
      setTimeout(() => displayRouteOnMap(routeData), 1000);
      return [];
    }

    console.log('경로 표시 시작');

    // 기존 경로 및 점선 제거
    clearExistingRoute();

    // 경로 좌표 배열 생성
    const pathCoordinates: any[] = [];

    // GeoJSON features에서 LineString만 추출
    routeData.features.forEach((feature: any) => {
      if (feature.geometry && feature.geometry.type === 'LineString') {
        const coordinates = feature.geometry.coordinates as number[][];
        coordinates.forEach((coord) => {
          // [경도, 위도] 형태를 Tmapv3.LatLng로 변환
          pathCoordinates.push(new window.Tmapv3.LatLng(coord[1], coord[0]));
        });
      }
    });

    console.log('경로 좌표 개수:', pathCoordinates.length);

    if (pathCoordinates.length > 0) {
      try {
        // 파란색 경로선
        const polyline = new window.Tmapv3.Polyline({
          path: pathCoordinates,
          strokeColor: '#2B70F9', // 파란색
          strokeWeight: 14,
          strokeOpacity: 0.9,
          map: map,
        });

        // 흰색 화살표 라인 (겹쳐서 화살표 표현)
        const arrowPolyline = new window.Tmapv3.Polyline({
          path: pathCoordinates,
          strokeColor: '#FFFFFF',
          strokeWeight: 9,
          strokeOpacity: 1,
          direction: true,
          map: map,
        });

        const allPolylines = [polyline, arrowPolyline];
        setRoutePolyline(allPolylines);
        console.log('파란색 경로 + 흰색 화살표 표시 완료');
      } catch (err: any) {
        console.error('Polyline 생성 중 오류:', err);
        const errorMessage = err?.message || err?.toString() || '';
        if (errorMessage.includes('No style loaded')) {
          console.log('지도 스타일 로드 대기 중, 2초 후 재시도');
          setTimeout(() => displayRouteOnMap(routeData), 2000);
        }
      }
    } else {
      console.warn('경로 좌표를 찾을 수 없습니다.');
    }

    return pathCoordinates;
  };

  // 경로 계산 및 표시 메인 함수
  const handleCalculateRoute = async (start: LocationState, destination: Shelter) => {
    try {
      console.log('경로 계산 시작');

      // 지도가 준비되었는지 한 번 더 확인
      if (!isMapFullyLoaded(map)) {
        console.warn('지도가 아직 완전히 로드되지 않음, 경로 계산 1초 후 재시도');
        setTimeout(() => handleCalculateRoute(start, destination), 1000);
        return;
      }

      // API 호출
      const routeResult = await calculatePedestrianRoute(start, destination);

      // 상태 저장
      setRouteDataState(routeResult);

      // 안내 문구/포인트 추출 (Point 타입)
      try {
        const steps: string[] = [];
        const points: GuidancePoint[] = [];
        routeResult.features.forEach((feature: any) => {
          if (feature.geometry && feature.geometry.type === 'Point') {
            const desc = feature.properties?.description?.toString()?.trim();
            const raw = feature.geometry.coordinates;
            if (desc) steps.push(desc);
            if (
              Array.isArray(raw) &&
              raw.length >= 2 &&
              typeof raw[0] === 'number' &&
              typeof raw[1] === 'number'
            ) {
              const coords = raw as unknown as number[];
              points.push({
                description: desc || '',
                latitude: coords[1],
                longitude: coords[0],
                turnType: feature.properties?.turnType as number | undefined,
                pointType: feature.properties?.pointType as string | undefined,
                index: feature.properties?.pointIndex as number | undefined,
              });
            }
          }
        });
        setGuidanceSteps(steps);
        setGuidancePoints(points);
      } catch (e) {
        console.warn('안내 문구 추출 중 오류', e);
        setGuidanceSteps([]);
        setGuidancePoints([]);
      }

      // 지도에 경로 표시 (pathCoordinates 반환)
      const pathCoordinates = displayRouteOnMap(routeResult);

      // 도착지 마커와 경로 끝점이 연결되지 않은 경우 점선(대체 연결선) 추가
      if (pathCoordinates && pathCoordinates.length > 0) {
        const lastPoint = pathCoordinates[pathCoordinates.length - 1];
        const { lat: lastLat, lng: lastLng } = extractLatLng(lastPoint);
        const destLat = destination.latitude;
        const destLng = destination.longitude;

        const gapMeters = haversineMeters(lastLat, lastLng, destLat, destLng);

        // 허용 임계치: 8미터 (필요시 조정)
        const GAP_THRESHOLD_M = 8;
        if (gapMeters > GAP_THRESHOLD_M) {
          try {
            // 도트(원) 마커로 연결: 일정 간격으로 작은 원형 마커를 생성
            const dots: any[] = [];

            const startLat = lastLat;
            const startLng = lastLng;
            const endLat = destLat;
            const endLng = destLng;

            const totalDist = haversineMeters(startLat, startLng, endLat, endLng);
            // 기존 산출값에 1.5배 적용 (maxDots로 제한)
            const dotSpacing = 12;
            const maxDots = 200;
            const approxCount = Math.floor(totalDist / dotSpacing);
            const count = Math.max(1, Math.min(maxDots, Math.floor(approxCount * 1.5)));

            // 하나의 도트 아이콘을 생성(캔버스)하여 재사용
            const createDotIcon = (diameter = 8, color = '#9CA3AF') => {
              const dpr = window.devicePixelRatio || 1;
              const canvas = document.createElement('canvas');
              canvas.width = diameter * dpr;
              canvas.height = diameter * dpr;
              canvas.style.width = `${diameter}px`;
              canvas.style.height = `${diameter}px`;
              const ctx = canvas.getContext('2d')!;
              ctx.scale(dpr, dpr);
              // 투명 배경
              ctx.clearRect(0, 0, diameter, diameter);
              // 그림자(선택적)
              // ctx.shadowColor = 'rgba(0,0,0,0.15)';
              // ctx.shadowBlur = 2;
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(diameter / 2, diameter / 2, diameter / 2, 0, Math.PI * 2);
              ctx.closePath();
              ctx.fill();
              return canvas.toDataURL('image/png');
            };

            const dotIconUrl = createDotIcon(8, '#9CA3AF');

            for (let i = 0; i <= count; i++) {
              const t = (i + 0.5) / (count + 1); // 도트들을 구간 중앙에 배치
              const lat = startLat + (endLat - startLat) * t;
              const lng = startLng + (endLng - startLng) * t;

              try {
                const marker = new window.Tmapv3.Marker({
                  position: new window.Tmapv3.LatLng(lat, lng),
                  iconSize: new window.Tmapv3.Size(8, 8),
                  icon: dotIconUrl,
                  map: map,
                  clickable: false,
                });
                dots.push(marker);
              } catch (markerErr) {
                console.warn('도트 마커 생성 실패:', markerErr);
              }
            }
            setDottedSegments(dots);
          } catch (err) {
            console.warn('점선 연결 생성 실패:', err);
          }
        }
      }

      console.log('경로 계산 및 표시 완료');
    } catch (err: any) {
      console.error('경로 계산 실패:', err);

      // 특정 에러에 대한 재시도 로직
      const errorMessage = err?.message || err?.toString() || '';
      if (errorMessage.includes('No style loaded')) {
        console.log('지도 스타일 문제로 인한 경로 계산 실패, 3초 후 재시도');
        setTimeout(() => handleCalculateRoute(start, destination), 3000);
      }
    }
  };

  return {
    handleCalculateRoute,
    routeData: routeDataState,
    guidanceSteps,
    guidancePoints,
  };
};
