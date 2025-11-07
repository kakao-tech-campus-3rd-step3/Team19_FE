import { useEffect } from 'react';
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
  if (!token) {
    console.log('[usePushNotification] No FCM token available (not in Android WebView)');
    return false;
  }

  // 중복 등록 방지 (세션 단위)
  const key = 'push.tokenRegistered';
  if (sessionStorage.getItem(key) === token) {
    console.log('[usePushNotification] Device token already registered');
    return true;
  }

  console.log('[usePushNotification] Registering device token:', token.substring(0, 20) + '...');
  await registerDeviceToken({ deviceToken: token });
  sessionStorage.setItem(key, token);
  console.log('[usePushNotification] Device token registered successfully');
  return true;
}

async function tryUpdateLocationOnce(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    console.log('[usePushNotification] Geolocation not available');
    return false;
  }

  // 최근 업데이트 시각 체크 (세션 단위, 10분 제한)
  const key = 'push.locationUpdatedAt';
  const last = Number(sessionStorage.getItem(key) || '0');
  const now = Date.now();
  if (now - last < 10 * 60 * 1000) {
    console.log('[usePushNotification] Location updated recently, skipping');
    return true;
  }

  console.log('[usePushNotification] Getting current location...');
  const position: GeolocationPosition = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 60_000,
    });
  });

  const { latitude, longitude } = position.coords;
  console.log('[usePushNotification] Updating location:', { latitude, longitude });
  await updateUserLocation({ latitude, longitude });
  sessionStorage.setItem(key, String(now));
  console.log('[usePushNotification] Location updated successfully');
  return true;
}

/**
 * 앱 시작/로그인 시 FCM 디바이스 토큰과 현재 위치를 서버에 등록합니다.
 * - 로그인 상태(토큰 또는 쿠키)일 때만 시도
 * - Android WebView에서만 디바이스 토큰 조회 가능
 * - accessToken 변경 시 재실행되어 로그인 직후에도 동작
 */
export function usePushNotification() {
  const { accessToken, refreshToken } = getStoredTokens();

  useEffect(() => {
    const isLoggedIn = Boolean(accessToken || refreshToken);
    if (!isLoggedIn) {
      console.log('[usePushNotification] Not logged in, skipping push setup');
      return;
    }

    console.log('[usePushNotification] Logged in, starting push registration...');
    // 병렬 시도: 토큰 등록, 위치 등록
    Promise.allSettled([tryRegisterDeviceTokenOnce(), tryUpdateLocationOnce()])
      .then((results) => {
        console.log('[usePushNotification] Registration results:', results);
      })
      .catch((err) => {
        console.error('[usePushNotification] Registration error:', err);
      });
  }, [accessToken]); // accessToken 변경 시 재실행
}

export default usePushNotification;
