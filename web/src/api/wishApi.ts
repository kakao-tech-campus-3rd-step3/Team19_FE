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
 * 찜 추가
 */
export async function addWish({ userId, shelterId }: { userId: number; shelterId: number }) {
  if (USE_MOCK) {
    return Promise.resolve({
      wishId: Date.now(),
      shelterId,
      userId,
      createdAt: new Date().toISOString(),
    });
  }

  // 실제 API 호출
  return apiClient.post(`/api/users/${userId}/wishes/${shelterId}`);
}

/**
 * 위시 목록 조회
 */
export async function getWishList(userId: number) {
  if (USE_MOCK) {
    return Promise.resolve(MOCK_WISHES);
  }

  return apiClient.get(`/api/users/${userId}/wishes`);
}

/**
 * 찜 삭제
 */
export async function deleteWish({ userId, shelterId }: { userId: number; shelterId: number }) {
  if (USE_MOCK) {
    return Promise.resolve();
  }

  return apiClient.delete(`/api/users/${userId}/wishes/${shelterId}`);
}

/**
 * 찜 토글 (추가/삭제)
 */
export async function toggleWish({
  shelterId,
  userId,
  isFavorite,
}: {
  shelterId: number | string;
  userId: number;
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
    await deleteWish({ userId, shelterId: Number(shelterId) });
    return { success: true, message: '찜 목록에서\n삭제되었습니다' };
  } else {
    // 추가
    await addWish({ userId, shelterId: Number(shelterId) });
    return { success: true, message: '찜 목록에\n추가되었습니다' };
  }
}
