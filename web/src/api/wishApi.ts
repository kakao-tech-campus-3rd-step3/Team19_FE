// 위시 추가
export async function addWish({ userId, shelterId }: { userId: number; shelterId: number }) {
  // TODO: 실제 API 연동 시 아래 주석 해제
  /*
  const res = await fetch(`/api/users/${userId}/wishes/${shelterId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, shelterId }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || '찜 추가에 실패했습니다.');
  }
  return res.json();
  */
  // 개발 중 목데이터
  return Promise.resolve({
    wishId: 1,
    shelterId,
    userId,
    createdAt: new Date().toISOString(),
  });
}

// 위시 목록 조회
//TODO: userId 파라미터 활용하여 실제 API 연동 시 사용
export async function getWishList(_userId: number) {
  // TODO: 실제 API 연동 시 아래 주석 해제
  /*
  const res = await fetch(`/api/users/${userId}/wishes`);
  if (!res.ok) {
    const errorData = await res.json();
    throw errorData; // 에러 페이지로 이동하기 위함
    }
  return res.json();
  */
  // 개발 중 목데이터
  return Promise.resolve([
    {
      shelterId: 1,
      name: '종로 무더위 쉼터',
      address: '서울 종로구 세종대로 175',
      operatingHours: '09:00~18:00',
      averageRating: 4.5,
      photoUrl: 'https://example.com/shelter1.jpg',
      distance: '250m',
    },
    {
      shelterId: 2,
      name: '강남 무더위 쉼터',
      address: '서울 강남구 테헤란로 123',
      operatingHours: '09:00~18:00',
      averageRating: 4.2,
      photoUrl: '',
      distance: '1.2km',
    },
  ]);
}

// 찜 삭제
// TODO: 실제 API 연동 시 userId 파라미터 사용 ( userId, shelterId )
export async function deleteWish({}: { userId: number; shelterId: number }) {
  // TODO: 실제 API 연동 시 아래 주석 해제
  /*
  const res = await fetch(`/api/users/${userId}/wishes/${shelterId}`, {
    method: 'DELETE',
  });
  if (res.status !== 204) {
    let errorMsg = '찜 삭제에 실패했습니다.';
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

// 찜 토글 (추가/삭제)
export async function toggleWish({
  shelterId,
  userId,
  isFavorite,
}: {
  shelterId: number | string;
  userId: number;
  isFavorite: boolean;
}) {
  if (isFavorite) {
    // 찜 삭제
    try {
      await deleteWish({ userId, shelterId: Number(shelterId) });
      return { success: true, message: '찜 목록에서\n삭제되었습니다' };
    } catch {
      return { success: false, message: '삭제에 실패했습니다' };
    }
  } else {
    // 찜 추가
    try {
      await addWish({ userId, shelterId: Number(shelterId) });
      return { success: true, message: '찜 목록에\n추가되었습니다' };
    } catch {
      return { success: false, message: '추가에 실패했습니다' };
    }
  }
}
