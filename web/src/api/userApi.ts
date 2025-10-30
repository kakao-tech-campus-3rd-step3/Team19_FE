import { apiClient, setStoredTokens, clearStoredTokens } from './client';

export interface UserProfile {
  userId: number;
  email: string;
  nickname: string;
  profileImageUrl?: string | null;
}

// 회원가입
export async function signup({
  email,
  password,
  nickname,
  profileImageUrl,
}: {
  email: string;
  password: string;
  nickname: string;
  profileImageUrl?: string;
}) {
  return apiClient.post('/api/users/signup', {
    email,
    password,
    nickname,
    profileImageUrl: profileImageUrl ?? '',
  });
}

// 로그인
export async function login({ email, password }: { email: string; password: string }) {
  const res = await apiClient.post('/api/users/login', { email, password });
  // 서버가 토큰을 응답으로 내려주는 경우를 저장 (쿠키 병행 시에도 헤더용으로 사용)
  if (res && (res as any).accessToken) {
    setStoredTokens({
      accessToken: (res as any).accessToken,
      refreshToken: (res as any).refreshToken,
    });
  }
  return res;
}

// 로그아웃
export async function logout() {
  const res = await apiClient.post('/api/users/logout');
  clearStoredTokens();
  return res;
}

// 토큰 재발급 (서버가 Refresh Cookie를 사용한다면 헤더 불필요)
export async function reissue({ refreshToken }: { refreshToken?: string } = {}) {
  const headers: Record<string, string> = {};
  if (refreshToken) headers['Authorization-Refresh'] = `Bearer ${refreshToken}`;
  return apiClient.post('/api/users/reissue', undefined, { headers });
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

// 로그인 여부 확인 (비동기)
export async function checkLoginStatus(): Promise<boolean> {
  try {
    await getMyProfile();
    return true;
  } catch (err: any) {
    if (err && (err.status === 401 || err.status === 403)) {
      return false;
    }
    throw err; // 기타 에러는 그대로 던짐
  }
}
