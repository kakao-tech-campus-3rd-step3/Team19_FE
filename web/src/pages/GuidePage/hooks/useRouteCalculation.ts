import { useState } from 'react';
import type { LocationState, Shelter, RouteData } from '../types/tmap';

interface UseRouteCalculationProps {
  map: any;
  isMapFullyLoaded: (mapInstance: any) => boolean;
}

export const useRouteCalculation = ({ map, isMapFullyLoaded }: UseRouteCalculationProps) => {
  const [routePolyline, setRoutePolyline] = useState<any>(null);
  const [routeDataState, setRouteDataState] = useState<RouteData | null>(null);
  const [guidanceSteps, setGuidanceSteps] = useState<string[]>([]);

  // 보행자 경로 계산 API 호출
  const calculatePedestrianRoute = async (start: LocationState, destination: Shelter): Promise<RouteData> => {
    console.log('보행자 경로 계산 시작:', { start, destination });

    const requestBody = {
      startX: start.longitude,
      startY: start.latitude,
      endX: destination.longitude,
      endY: destination.latitude,
      startName: "현재위치",
      endName: destination.name,
      searchOption: 0, // 추천 경로
      reqCoordType: "WGS84GEO",
      resCoordType: "WGS84GEO"
    };

    console.log('API 요청 데이터:', requestBody);

    const response = await fetch('https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1', {
      method: 'POST',
      headers: {
        'appKey': import.meta.env.VITE_TMAP_APP_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
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

  // 경로를 지도에 표시 (지도 로드 상태 확인 포함)
  const displayRouteOnMap = (routeData: RouteData) => {
    if (!map || !window.Tmapv3) {
      console.warn('지도 또는 TMAP SDK가 준비되지 않음');
      return;
    }

    // 지도가 완전히 로드되었는지 확인
    if (!isMapFullyLoaded(map)) {
      console.warn('지도가 아직 완전히 로드되지 않음, 1초 후 재시도');
      setTimeout(() => displayRouteOnMap(routeData), 1000);
      return;
    }

    console.log('경로 표시 시작');

    // 기존 경로 라인 제거
    if (routePolyline) {
      try {
        routePolyline.setMap(null);
      } catch (err) {
        console.warn('기존 경로 제거 중 오류:', err);
      }
    }

    // 경로 좌표 배열 생성
    const pathCoordinates: any[] = [];

    // GeoJSON features에서 LineString만 추출
    routeData.features.forEach(feature => {
      if (feature.geometry.type === 'LineString') {
        const coordinates = feature.geometry.coordinates as number[][];
        coordinates.forEach(coord => {
          // [경도, 위도] 형태를 Tmapv3.LatLng로 변환
          pathCoordinates.push(new window.Tmapv3.LatLng(coord[1], coord[0]));
        });
      }
    });

    console.log('경로 좌표 개수:', pathCoordinates.length);

    if (pathCoordinates.length > 0) {
      try {
        // Polyline 생성
        const polyline = new window.Tmapv3.Polyline({
          path: pathCoordinates,
          strokeColor: "#FF0000", // 빨간색 경로
          strokeWeight: 6,
          strokeOpacity: 0.8,
          map: map
        });

        setRoutePolyline(polyline);
        console.log('경로 표시 완료');
      } catch (err: any) {
        console.error('Polyline 생성 중 오류:', err);
        // 스타일이 로드되지 않은 경우 재시도
        const errorMessage = err?.message || err?.toString() || '';
        if (errorMessage.includes('No style loaded')) {
          console.log('지도 스타일 로드 대기 중, 2초 후 재시도');
          setTimeout(() => displayRouteOnMap(routeData), 2000);
        }
      }
    } else {
      console.warn('경로 좌표를 찾을 수 없습니다.');
    }
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

      // 안내 문구 추출 (Point 타입의 description)
      try {
        const steps: string[] = [];
        routeResult.features.forEach((feature) => {
          if (feature.geometry.type === 'Point') {
            const desc = feature.properties?.description?.toString()?.trim();
            if (desc) steps.push(desc);
          }
        });
        setGuidanceSteps(steps);
      } catch (e) {
        console.warn('안내 문구 추출 중 오류', e);
        setGuidanceSteps([]);
      }

      // 지도에 경로 표시
      displayRouteOnMap(routeResult);

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
    guidanceSteps
  };
};
