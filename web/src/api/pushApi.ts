import { apiClient } from './client';

type LocationPayload = {
  latitude: number;
  longitude: number;
};

type DeviceTokenPayload = {
  deviceToken: string;
};

/**
 * 사용자의 현재 위치를 서버에 등록합니다.
 * POST /api/users/me/location
 * 로그인 필요 (쿠키 또는 Authorization 헤더)
 */
export async function updateUserLocation(payload: LocationPayload): Promise<void> {
  await apiClient.post('/api/users/me/location', payload);
}

/**
 * 기기(FCM) 디바이스 토큰을 서버에 등록합니다.
 * POST /api/users/me/device
 * 로그인 필요 (쿠키 또는 Authorization 헤더)
 */
export async function registerDeviceToken(payload: DeviceTokenPayload): Promise<void> {
  await apiClient.post('/api/users/me/device', payload);
}
