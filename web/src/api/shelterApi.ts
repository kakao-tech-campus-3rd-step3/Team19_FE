import { apiClient } from '@/api/client';

// FindSheltersPage에서 사용된 api 함수들

// 가까운 쉼터 조회
export async function getNearbyShelters({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const qs = `?latitude=${encodeURIComponent(String(latitude))}&longitude=${encodeURIComponent(
    String(longitude),
  )}`;
  const res = await apiClient.get(`/api/shelters/nearby${qs}`);
  return res && (res as any).data ? (res as any).data : res;
}

// 바운딩 박스 기반 쉼터/클러스터 조회
export async function getSheltersByBbox({
  minLat,
  minLng,
  maxLat,
  maxLng,
  zoom,

  page,
  size,
  // optional: 클라이언트 현재 위치(전달되면 서버에 함께 보냄)
  userLat,
  userLng,
}: {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
  zoom: number;
  page?: number;
  size?: number;
  userLat?: number;
  userLng?: number;
}) {
  // build query string according to spec
  const params = new URLSearchParams();
  params.set('minLat', String(minLat));
  params.set('minLng', String(minLng));
  params.set('maxLat', String(maxLat));
  params.set('maxLng', String(maxLng));
  params.set('zoom', String(zoom));
  // user 위치가 주어진 경우 쿼리에 포함
  if (typeof userLat !== 'undefined' && isFinite(Number(userLat))) {
    params.set('userLat', String(userLat));
  }
  if (typeof userLng !== 'undefined' && isFinite(Number(userLng))) {
    params.set('userLng', String(userLng));
  }
  if (typeof page !== 'undefined') params.set('page', String(page));
  if (typeof size !== 'undefined') params.set('size', String(size));
  const qs = params.toString() ? `?${params.toString()}` : '';

  try {
    const res = await apiClient.get(`/api/shelters${qs}`);
    const data = res && (res as any).data ? (res as any).data : res;

    // Basic validation/coercion to match the interface:
    // expected: { mode: 'cluster'|'detail', features: Array, total: number }
    if (
      data &&
      Array.isArray(data.features) &&
      (data.mode === 'cluster' || data.mode === 'detail')
    ) {
      return data;
    }

    // If backend returns an array directly, wrap as detail
    if (Array.isArray(data)) {
      return { mode: 'detail', features: data, total: data.length };
    }

    // Otherwise, log and return a safe empty shape
    // eslint-disable-next-line no-console
    console.warn('[getSheltersByBbox] unexpected response shape, returning empty result', { data });
    return { mode: 'cluster', features: [], total: 0 };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[getSheltersByBbox] API call failed', err);
    // Do not return mock data — return empty response shape so caller can handle gracefully
    return { mode: 'cluster', features: [], total: 0 };
  }
}

// --- 추가: react-query용 fetcher / key 헬퍼 (FindSheltersPage에서 사용) ---
export const nearbySheltersQueryKey = (latitude: number, longitude: number) =>
  ['nearbyShelters', String(latitude), String(longitude)] as const;

export async function fetchNearbyShelters(latitude: number, longitude: number) {
  // 단순 wrapper: 기존 getNearbyShelters 재사용
  return getNearbyShelters({ latitude, longitude });
}

// 쉼터 상세 조회
export async function getShelterDetail({
  shelterId,
  latitude,
  longitude,
}: {
  shelterId: number;
  latitude?: number;
  longitude?: number;
}) {
  const params: string[] = [];
  if (typeof latitude !== 'undefined')
    params.push(`latitude=${encodeURIComponent(String(latitude))}`);
  if (typeof longitude !== 'undefined')
    params.push(`longitude=${encodeURIComponent(String(longitude))}`);
  const qs = params.length ? `?${params.join('&')}` : '';
  const res = await apiClient.get(`/api/shelters/${shelterId}${qs}`);
  return res && (res as any).data ? (res as any).data : res;
}

// 쉼터 리뷰 조회
export async function getShelterReviews(shelterId: number, sort?: string) {
  const qs = sort ? `?sort=${encodeURIComponent(sort)}` : '';
  const res = await apiClient.get(`/api/shelters/${shelterId}/reviews${qs}`);
  return res && (res as any).data ? (res as any).data : res;
}

// 쉼터 도착 알림 (리뷰 푸시 알림 트리거용)
// BE가 10분 후 FCM 푸시 알림을 자동으로 발송합니다.
export async function notifyShelterArrival(shelterId: number) {
  const res = await apiClient.post(`/api/shelters/${shelterId}/arrival`);
  return res && (res as any).data ? (res as any).data : res;
}
