// EditReviewPage, MyReviewPage에서 사용하는 API 함수들

// 리뷰 단건 조회
// TODO: 실제 API 연동 시 reviewId 사용
export async function getReview(_reviewId: number) {
  // TODO: 실제 API 연동 시 아래 주석 해제
  /*
  const res = await fetch(`/api/reviews/${reviewId}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || '리뷰를 불러오지 못했습니다.');
  }
  return res.json();
  */
  // 개발 중 목데이터
  return Promise.resolve({
    reviewId: 101,
    shelterId: 1,
    userId: 1,
    content: '에어컨도 잘 나오고 깨끗했어요',
    rating: 5,
    photoUrl: 'https://example.com/review1.jpg',
    profileImageUrl: 'https://example.com/users/1.jpg',
    createdAt: '2025-08-19T09:00:00Z',
    updatedAt: '2025-08-19T09:00:00Z',
  });
}

// 리뷰 작성
export async function postReview(
  shelterId: number,
  {
    // TODO: 실제 api 연동 시 주석 삭제
    //content,
    //rating,
    //photoUrl,
  }: {
    content: string;
    rating: number;
    photoUrl?: string;
  },
) {
  // TODO: 실제 API 연동 시 아래 주석 해제
  /*
  const res = await fetch(`/api/shelters/${shelterId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, rating, photoUrl }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || '리뷰 작성에 실패했습니다.');
  }
  return res.json();
  */
  // 개발 중 목데이터
  return Promise.resolve({
    reviewId: 103,
    shelterId,
    userId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
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
  // TODO: 실제 API 연동 시 아래 주석 해제
  /*
  const res = await fetch(`/api/reviews/${reviewId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, rating, photoUrl }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || '리뷰 수정에 실패했습니다.');
  }
  return res.json();
  */
  // 개발 중 목데이터
  return Promise.resolve({
    reviewId,
    shelterId: 1,
    content,
    rating: rating ?? 5,
    photoUrl: photoUrl ?? 'https://example.com/review1.jpg',
    createdAt: '2025-08-19T09:00:00Z',
    updatedAt: new Date().toISOString(),
  });
}

// 리뷰 삭제
// TODO: 실제 API 연동 시 reviewId 사용
export async function deleteReview(_reviewId: number) {
  // TODO: 실제 API 연동 시 아래 주석 해제
  /*
  const res = await fetch(`/api/reviews/${reviewId}`, {
    method: 'DELETE',
  });
  if (res.status !== 204) {
    let errorMsg = '리뷰 삭제에 실패했습니다.';
    try {
      const errorData = await res.json();
      errorMsg = errorData.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return;
  */
  // 개발 중 목데이터
  return Promise.resolve();
}
