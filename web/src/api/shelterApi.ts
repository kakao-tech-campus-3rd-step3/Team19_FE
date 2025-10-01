// FindSheltersPage에서 사용된 api 함수들

// 가까운 쉼터 조회
export async function getNearbyShelters(
  {
    // TODO: 실제 API 연동 시 주석 해제
    //latitude,
    //longitude,
  }: {
    latitude: number;
    longitude: number;
  },
) {
  // TODO: 실제 API 연동 시 아래 주석 해제
  /*
  const res = await fetch(
    `/api/shelters/nearby?latitude=${latitude}&longitude=${longitude}`
  );
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || '쉼터 정보를 불러오지 못했습니다.');
  }
  return res.json();
  */
  // 개발 중에는 빈 배열 반환
  return Promise.resolve([]);
}

// 쉼터 상세 조회
export async function getShelterDetail(
  {
    // TODO: 실제 API 연동 시 주석 해제
    //shelterId,
    //latitude,
    //longitude,
  }: {
    shelterId: number;
    latitude?: number;
    longitude?: number;
  },
) {
  // TODO: 실제 API 연동 시 아래 주석 해제
  /*
  const params = [];
  if (latitude) params.push(`latitude=${latitude}`);
  if (longitude) params.push(`longitude=${longitude}`);
  const query = params.length ? `?${params.join('&')}` : '';
  const res = await fetch(`/api/shelters/${shelterId}${query}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || '쉼터 상세 정보를 불러오지 못했습니다.');
  }
  return res.json();
  */

  // 개발 중 목데이터 반환, TODO: 실제 API 연동 시 삭제
  return Promise.resolve({
    shelterId: 1,
    name: '종로 무더위 쉼터',
    address: '서울 종로구 세종대로 175',
    latitude: 37.5665,
    longitude: 126.978,
    distance: '0.2km',
    operatingHours: {
      weekday: '09:00~18:00',
      weekend: '10:00~16:00',
    },
    capacity: 50,
    isOutdoors: true,
    coolingEquipment: {
      fanCount: 3,
      acCount: 1,
    },
    totalRating: 14,
    reviewCount: 5,
    photoUrl: '',
  });
}

// 쉼터 리뷰 조회
export async function getShelterReviews(_shelterId: number) {
  // TODO: 실제 API 연동 시 아래 주석 해제
  /*
  const res = await fetch(`/api/shelters/${shelterId}/reviews`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || '쉼터 리뷰를 불러오지 못했습니다.');
  }
  return res.json();
  */
  // 개발 중 목데이터 반환, TODO: 실제 API 연동 시 삭제
  return Promise.resolve([
    {
      reviewId: 101,
      userId: 1,
      nickname: '홍길동',
      content: '에어컨도 잘 나오고 깨끗했어요',
      rating: 5,
      photoUrl: 'https://example.com/review1.jpg',
      profileImageUrl: 'https://example.com/users/1.jpg',
      createdAt: '2025-08-19T09:00:00Z',
      updatedAt: '2025-08-19T09:00:00Z',
    },
    {
      reviewId: 102,
      userId: 2,
      nickname: '김철수',
      content: '사람이 많아서 자리 찾기 힘듦 ㅠㅠ',
      rating: 3,
      photoUrl: null,
      profileImageUrl: 'https://example.com/users/2.jpg',
      createdAt: '2025-08-18T14:00:00Z',
      updatedAt: '2025-08-18T14:00:00Z',
    },
  ]);
}
