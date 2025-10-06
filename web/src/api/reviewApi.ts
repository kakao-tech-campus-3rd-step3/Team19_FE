import { apiClient } from './client';

// EditReviewPage, MyReviewPage에서 사용하는 API 함수들

// 리뷰 단건 조회
export async function getReview(reviewId: number) {
  const res = await fetch(`/api/reviews/${reviewId}`);
  if (!res.ok) {
    let err;
    try {
      err = await res.json();
    } catch {
      err = { status: res.status, message: res.statusText };
    }
    throw err;
  }
  return res.json();
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
    photoUrl?: string;
  },
) {
  const res = await fetch(`/api/shelters/${shelterId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, rating, photoUrl }),
  });

  if (!res.ok) {
    let errMsg = '리뷰 작성에 실패했습니다.';
    try {
      const errBody = await res.json();
      errMsg = errBody?.message ?? errMsg;
    } catch {}
    throw new Error(errMsg);
  }
  return res.json();
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
  const res = await fetch(`/api/reviews/${reviewId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, rating, photoUrl }),
  });

  if (!res.ok) {
    let errMsg = '리뷰 수정에 실패했습니다.';
    try {
      const errBody = await res.json();
      errMsg = errBody?.message ?? errMsg;
    } catch {}
    throw new Error(errMsg);
  }
  return res.json();
}

// 리뷰 삭제
export async function deleteReview(reviewId: number) {
  const res = await fetch(`/api/reviews/${reviewId}`, {
    method: 'DELETE',
  });

  if (res.status !== 204) {
    let errMsg = '리뷰 삭제에 실패했습니다.';
    try {
      const errBody = await res.json();
      errMsg = errBody?.message ?? errMsg;
    } catch {}
    throw new Error(errMsg);
  }
  return;
}

// 내가 쓴 리뷰 조회
export async function getMyReviews() {
  const res = await apiClient.get('/api/users/me/reviews');
  // apiClient가 axios인 경우 res.data, fetch-wrapper인 경우 res일 수 있으므로 양쪽 대응
  return res && (res as any).data ? (res as any).data : res;
}
