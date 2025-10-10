import { apiClient } from './client';

export interface UserProfile {
  userId: number;
  email: string;
  nickname: string;
  profileImageUrl?: string | null;
}

// 내 정보 조회
export async function getMyProfile(): Promise<UserProfile> {
  return apiClient.get('/api/users/me');
}

// 특정 사용자 조회
export async function getUserProfile(userId: number): Promise<UserProfile> {
  return apiClient.get(`/api/users/${userId}`);
}

// 프로필(닉네임/이미지) 수정
export async function patchProfile({
  nickname,
  profileImageUrl,
}: {
  nickname?: string;
  profileImageUrl?: string;
}) {
  return apiClient.patch('/api/users/me', { nickname, profileImageUrl });
}

// 비밀번호 수정
export async function patchPassword({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}) {
  return apiClient.patch('/api/users/me/password', { currentPassword, newPassword });
}

//TODO: 사용자 프로필 사진 수정/사용자 닉네임 수정 -> 필요하면 추가할 것
