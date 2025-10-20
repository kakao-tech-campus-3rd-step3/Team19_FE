export interface CurrentWeather {
  temperature: number;
  baseDate: string; // YYYYMMDD
  baseTime: string; // HHMM
}

import { apiClient } from './client';

/**
 * 현재 위치 기반 기온 조회
 * GET /api/weather/current?latitude={latitude}&longitude={longitude}
 */
export async function getCurrentWeather({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}): Promise<CurrentWeather> {
  const qs = `?latitude=${encodeURIComponent(String(latitude))}&longitude=${encodeURIComponent(
    String(longitude),
  )}`;
  const res = await apiClient.get(`/api/weather/current${qs}`);

  // 안전한 타입 정규화
  if (!res || typeof res !== 'object') {
    throw new Error('날씨 API 응답이 유효하지 않습니다.');
  }

  return {
    temperature: Number(res.temperature),
    baseDate: String(res.baseDate),
    baseTime: String(res.baseTime),
  };
}
