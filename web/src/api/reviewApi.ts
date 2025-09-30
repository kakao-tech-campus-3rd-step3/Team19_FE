// 리뷰 단건 조회
// TODO: api 연동 시 reviewId 파라미터 추가('_' 제거)
export async function getReview(_reviewId: number) {
  // 실제 API 연동 전에는 빈 Promise 또는 목데이터 반환
  return Promise.resolve(null);
  /* TODO: 실제 연동 시 아래 주석 코드 사용
  const res = await fetch(`/api/reviews/${reviewId}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || '리뷰를 불러오지 못했습니다.');
  }
  return res.json();
  */
}

// 리뷰 작성
export async function postReview(
  //TODO: api 연동 시 shelterId 파라미터 추가
  //shelterId: number,
  {
    //content,
    //rating,
    //photoUrl,
  }: {
    content: string;
    rating: number;
    photoUrl?: string;
  },
) {
  // 실제 API 연동 전에는 빈 Promise 반환
  return Promise.resolve();
  /* TODO: 실제 연동 시 아래 주석 코드 사용
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
}

// 리뷰 수정
export async function patchReview(
  //TODO: api 연동 시 reviewId 파라미터 추가
  //reviewId: number,
  {
    //content,
    //rating,
    //photoUrl,
  }: {
    content: string;
    rating?: number;
    photoUrl?: string;
  },
) {
  // 실제 API 연동 전에는 빈 Promise 반환
  return Promise.resolve();
  /* TODO: 실제 연동 시 아래 주석 코드 사용
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
}

// 리뷰 삭제
// TODO: api 연동 시 reviewId 파라미터 추가('_' 제거)
export async function deleteReview(_reviewId: number) {
  // 실제 API 연동 전에는 빈 Promise 반환
  return Promise.resolve();
  /* TODO: 실제 연동 시 아래 주석 코드 사용
  const res = await fetch(`/api/reviews/${reviewId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || '리뷰 삭제에 실패했습니다.');
  }
  return;
  */
}
