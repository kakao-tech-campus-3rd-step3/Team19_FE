import { useEffect, useRef } from 'react';
import { registerDeviceToken, updateUserLocation } from '@/api/pushApi';
import { getStoredTokens } from '@/api/client';

function getAndroidDeviceToken(): string | null {
  try {
    // @ts-ignore - Android WebView JS bridge
    return typeof window !== 'undefined' && window.AndroidBridge?.getDeviceToken
      ? window.AndroidBridge.getDeviceToken()
      : null;
  } catch {
    return null;
  }
}

async function tryRegisterDeviceTokenOnce(): Promise<boolean> {
  const token = getAndroidDeviceToken();
  if (!token) return false;

  // 중복 등록 방지 (세션 단위)
  const key = 'push.tokenRegistered';
  if (sessionStorage.getItem(key) === token) return true;

  await registerDeviceToken({ deviceToken: token });
  sessionStorage.setItem(key, token);
  return true;
}

async function tryUpdateLocationOnce(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return false;

  // 최근 업데이트 시각 체크 (세션 단위, 10분 제한)
  const key = 'push.locationUpdatedAt';
  const last = Number(sessionStorage.getItem(key) || '0');
  const now = Date.now();
  if (now - last < 10 * 60 * 1000) return true;

  const position: GeolocationPosition = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 60_000,
    });
  });

  const { latitude, longitude } = position.coords;
  await updateUserLocation({ latitude, longitude });
  sessionStorage.setItem(key, String(now));
  return true;
}

/**
 * 앱 시작/로그인 시 FCM 디바이스 토큰과 현재 위치를 서버에 등록합니다.
 * - 로그인 상태(토큰 또는 쿠키)일 때만 시도
 * - Android WebView에서만 디바이스 토큰 조회 가능
 */
export function usePushNotification() {
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const { accessToken, refreshToken } = getStoredTokens();
    const isLoggedIn = Boolean(accessToken || refreshToken);
    if (!isLoggedIn) return;

    // 병렬 시도: 토큰 등록, 위치 등록
    Promise.allSettled([tryRegisterDeviceTokenOnce(), tryUpdateLocationOnce()])
      .then(() => {})
      .catch(() => {});
  }, []);
}

export default usePushNotification;
