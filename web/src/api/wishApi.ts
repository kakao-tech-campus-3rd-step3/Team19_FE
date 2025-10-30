import { apiClient } from './client';

export type WishItem = {
  shelterId: number;
  name: string;
  address?: string;
  operatingHours?: string;
  averageRating?: number;
  photoUrl?: string;
  distance?: string;
};

const MOCK_WISHES: WishItem[] = [
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
];

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/**
 * 찜 추가 (me 사용)
 */
export async function addWish({ shelterId }: { shelterId: number }) {
  if (USE_MOCK) {
    return Promise.resolve({
      wishId: Date.now(),
      shelterId,
      createdAt: new Date().toISOString(),
    });
  }

  // 실제 API 호출
  return apiClient.post(`/api/users/me/wishes/${shelterId}`);
}

/**
 * 위시 목록 조회 (me 사용)
 */
export async function getWishList() {
  if (USE_MOCK) {
    return Promise.resolve(MOCK_WISHES);
  }

  return apiClient.get(`/api/users/me/wishes`);
}

/**
 * 찜 삭제 (me 사용)
 */
export async function deleteWish({ shelterId }: { shelterId: number }) {
  if (USE_MOCK) {
    return Promise.resolve();
  }

  return apiClient.delete(`/api/users/me/wishes/${shelterId}`);
}

/**
 * 찜 토글 (추가/삭제) -> TODO: 다른 파일로 분리!
 */
export async function toggleWish({
  shelterId,
  isFavorite,
}: {
  shelterId: number | string;
  isFavorite: boolean;
}) {
  if (USE_MOCK) {
    if (isFavorite) {
      return { success: true, message: '찜 목록에서\n삭제되었습니다' };
    } else {
      return { success: true, message: '찜 목록에\n추가되었습니다' };
    }
  }

  if (isFavorite) {
    // 현재 즐겨찾기중 -> 삭제
    await deleteWish({ shelterId: Number(shelterId) });
    return { success: true, message: '찜 목록에서\n삭제되었습니다' };
  } else {
    // 추가
    await addWish({ shelterId: Number(shelterId) });
    return { success: true, message: '찜 목록에\n추가되었습니다' };
  }
}

/**
 * 사용자가 해당 쉼터를 찜했는지 여부 확인
 */
export async function checkIfShelterIsWished(shelterId: number): Promise<boolean> {
  try {
    const wishList = await getWishList();
    // 응답 형태: {items: [...]} 또는 [...] 또는 {data: [...]}
    const list = Array.isArray(wishList) ? wishList : (wishList?.items ?? wishList?.data ?? []);
    return list.some((item: any) => Number(item.shelterId) === Number(shelterId));
  } catch (err: any) {
    // 비로그인/권한없음(401, 403) => false
    if (err && (err.status === 401 || err.status === 403)) {
      return false;
    }
    throw err;
  }
}
