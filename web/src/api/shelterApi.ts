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
  // apiClient가 axios면 res.data, fetch-wrapper면 res일 수 있으므로 둘 다 지원
  return res && (res as any).data ? (res as any).data : res;
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
