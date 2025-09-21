import type { LocationState } from '../types/tmap';

/**
 * 두 지점 간의 거리를 하버사인 공식으로 계산합니다 (미터 단위)
 * @param a 첫 번째 위치
 * @param b 두 번째 위치
 * @returns 거리 (미터)
 */
export const haversineDistanceMeters = (a: LocationState, b: LocationState): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000; // 지구 반지름 (미터)
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
};
