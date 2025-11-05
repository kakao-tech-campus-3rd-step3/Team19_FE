import { apiClient, setStoredTokens, clearStoredTokens, clearWebViewCookies } from './client';

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
  // localStorage 토큰 삭제
  clearStoredTokens();
  // WebView 쿠키 삭제 (Android 앱에서만 동작)
  clearWebViewCookies();
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

// 프로필 이미지 업로드 (multipart/form-data)
export async function uploadProfileImage(file: File): Promise<UserProfile> {
  // FormData에 오직 file 필드만 추가 — 혹시 다른 필드가 섞이는 문제 예방
  const form = new FormData();
  form.append('file', file);
  // 안전: 다른 중복 필드가 섞여있다면 제거 (보수적 처리)
  if (typeof form.get === 'function') {
    // (실제 브라우저 FormData는 동일 이름 중복 허용하므로 여기선 명시적으로 하나만 남김)
    const entries = Array.from(form.entries());
    // 디버그: 전송 직전 entries 확인 (배포 시 제거 가능)
    // eslint-disable-next-line no-console
    console.debug(
      '[uploadProfileImage] form entries before send:',
      entries.map(([k, v]) => [k, (v as any).name ?? typeof v]),
    );
  }

  try {
    const res = await apiClient.post('/api/users/me/profile-image', form);
    if (res && typeof (res as any).status === 'number') {
      // eslint-disable-next-line no-console
      console.debug('[uploadProfileImage] response status:', (res as any).status);
      const text = await (res as any).text();
      // eslint-disable-next-line no-console
      console.debug('[uploadProfileImage] response text:', text);
      try {
        return JSON.parse(text) as UserProfile;
      } catch {
        throw new Error(
          `uploadProfileImage: invalid json response (status ${(res as any).status})`,
        );
      }
    }
    return res as UserProfile;
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[uploadProfileImage] unexpected error:', err);
    throw err;
  }
}

//TODO: 사용자 프로필 사진 수정/사용자 닉네임 수정 -> 필요하면 추가할 것

// 로그인 여부 확인 (비동기)
export async function checkLoginStatus(): Promise<boolean> {
  try {
    await getMyProfile();
    return true;
  } catch (err: any) {
    // 401/403: 명확히 로그아웃 상태
    if (err && (err.status === 401 || err.status === 403)) {
      return false;
    }
    // 그 외 에러(500 등)도 로그인 상태 확인 불가이므로 false 반환
    // 로그인 체크는 "확실히 로그인 된 경우만 true"를 반환하는 것이 안전
    console.warn('[checkLoginStatus] 서버 에러로 로그인 상태 확인 불가:', err);
    return false;
  }
}
