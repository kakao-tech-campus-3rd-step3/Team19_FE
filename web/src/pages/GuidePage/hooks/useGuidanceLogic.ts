import { useRef } from 'react';
import type { LocationState, Shelter } from '../types/tmap';
import type { GuidancePoint } from './useRouteCalculation';
import { haversineDistanceMeters } from '../utils/geoUtils';

/**
 * 안내 로직을 관리하는 커스텀 훅
 */
export const useGuidanceLogic = () => {
  const reachedPointIndexRef = useRef<number>(-1);

  /**
   * 사용자가 도달한 안내 포인트를 계산
   * @param loc 현재 위치
   * @param points 안내 포인트 배열
   * @returns 도달한 포인트 또는 null
   */
  const getReachableGuidancePoint = (loc: LocationState, points: GuidancePoint[]) => {
    // 다음 목표 포인트만 체크(이미 지난 포인트는 건너뜀)
    const nextIndex = Math.min(reachedPointIndexRef.current + 1, points.length - 1);
    if (nextIndex < 0 || nextIndex >= points.length) return null;

    const target = points[nextIndex];
    const distance = haversineDistanceMeters(
      { latitude: loc.latitude, longitude: loc.longitude, accuracy: loc.accuracy },
      { latitude: target.latitude, longitude: target.longitude, accuracy: 0 },
    );

    const THRESHOLD_M = 15; // 15m 이내 접근 시 도달로 간주
    if (distance <= THRESHOLD_M) {
      reachedPointIndexRef.current = nextIndex;
      return target;
    }
    return null;
  };

  /**
   * 목적지 도착 여부 확인
   * @param loc 현재 위치
   * @param shelter 목적지 대피소
   * @returns 도착 여부
   */
  const checkArrival = (loc: LocationState, shelter: Shelter) => {
    const distance = haversineDistanceMeters(
      { latitude: loc.latitude, longitude: loc.longitude, accuracy: loc.accuracy },
      { latitude: shelter.latitude, longitude: shelter.longitude, accuracy: 0 },
    );
    const ARRIVAL_THRESHOLD_M = 20; // 20m 이내 도착으로 간주
    return distance <= ARRIVAL_THRESHOLD_M;
  };

  return {
    getReachableGuidancePoint,
    checkArrival,
  };
};
