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
