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
    // 수정되지 않은 필드는 null로 보낼 수 있도록 nullable 허용
    content?: string | null;
    rating?: number | null;
    photoUrl?: string | null;
  },
) {
  // body에 명시적으로 값(값이 null인 경우도 포함)을 전달합니다.
  const body = {
    content: typeof content === 'undefined' ? null : content,
    rating: typeof rating === 'undefined' ? null : rating,
    photoUrl: typeof photoUrl === 'undefined' ? null : photoUrl,
  };
  const res = await apiClient.patch(`/api/reviews/${reviewId}`, body);
  return res && (res as any).data ? (res as any).data : res;
}

// 리뷰 삭제
export async function deleteReview(reviewId: number) {
  // apiClient.delete는 fetchWithReissue를 통해 parseResponse를 호출합니다.
  // parseResponse는 res.ok가 false면 에러를 throw하고, true면 파싱된 body를 반환합니다.
  // DELETE 요청이 성공하면 보통 204 No Content를 반환하므로 body가 없어도 정상입니다.
  // 따라서 parseResponse가 성공적으로 반환되면 (에러가 throw되지 않으면) 삭제가 성공한 것입니다.
  await apiClient.delete(`/api/reviews/${reviewId}`);
  return;
}

// 내가 쓴 리뷰 조회
export async function getMyReviews() {
  const res = await apiClient.get('/api/users/me/reviews');
  return res && (res as any).data ? (res as any).data : res;
}

// --- 새로 추가: 리뷰 사진 업로드 (multipart/form-data) ---
// file만 전송합니다 (파일명은 FormData가 자동으로 포함)
export async function uploadReviewPhoto(reviewId: number, file: File) {
  const fd = new FormData();
  fd.append('file', file); // 서버가 'file' 필드명 기대한다고 가정
  const res = await apiClient.post(`/api/reviews/${reviewId}/photo`, fd);
  // fetchWithReissue -> parseResponse 반환값이 이미 파싱된 데이터입니다.
  // 에러가 발생하면 fetchWithReissue에서 throw 되므로 여기서는 안전하게 반환
  return res && (res as any).data ? (res as any).data : res;
}
