import { apiClient } from './client';

// 리뷰 단건 조회
export async function getReview(reviewId: number) {
  const res = await apiClient.get(`/api/reviews/${reviewId}`);
  return res && (res as any).data ? (res as any).data : res;
}

// 리뷰 작성
export async function postReview(
  shelterId: number,
  {
    content,
    rating,
    photoUrl,
  }: {
    content: string;
    rating: number;
    // string 또는 null 허용 (없으면 null로 전송)
    photoUrl?: string | null;
  },
) {
  // photoUrl이 없으면 null로 전송
  const body = { content, rating, photoUrl: photoUrl ?? null };
  const res = await apiClient.post(`/api/shelters/${shelterId}/reviews`, body);
  return res && (res as any).data ? (res as any).data : res;
}

// 리뷰 수정
export async function patchReview(
  reviewId: number,
  {
    content,
    rating,
    photoUrl,
  }: {
    content: string;
    rating?: number;
    photoUrl?: string;
  },
) {
  const res = await apiClient.patch(`/api/reviews/${reviewId}`, {
    content,
    rating,
    photoUrl,
  });
  return res && (res as any).data ? (res as any).data : res;
}

// 리뷰 삭제
export async function deleteReview(reviewId: number) {
  const res = await apiClient.delete(`/api/reviews/${reviewId}`);
  const status = (res && (res as any).status) ?? res?.status ?? 0;
  if (status !== 204 && status !== 200) {
    const msg =
      (res && (res as any).data && (res as any).data.message) || '리뷰 삭제에 실패했습니다.';
    throw new Error(msg);
  }
  return;
}

// 내가 쓴 리뷰 조회
export async function getMyReviews() {
  const res = await apiClient.get('/api/users/me/reviews');
  return res && (res as any).data ? (res as any).data : res;
}
