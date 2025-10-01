//EditProfilePage, MyPage에서 사용된 api 함수들

// 내 정보 조회
export async function getMyProfile() {
  const res = await fetch('/api/users/me');
  if (!res.ok) {
    const errorData = await res.json();
    throw errorData; // 에러 페이지로 이동하기 위함
  }
  return res.json();
}

// 특정 사용자 조회
export async function getUserProfile(userId: number) {
  const res = await fetch(`/api/users/${userId}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || '사용자 정보를 불러오지 못했습니다.');
  }
  return res.json();
}

// 프로필(닉네임/이미지) 수정
export async function patchProfile(
  {
    // 임시로 주석 처리
    // TODO: 실제 API 연동 시 주석 해제
    //nickname,
    //profileImageUrl,
  }: {
    nickname?: string;
    profileImageUrl?: string;
  },
) {
  // 실제 API 연동 전에는 아래처럼 빈 Promise만 반환해도 됨
  return Promise.resolve();
  /* TODO: 실제 연동 시 아래 주석 코드 사용
  const res = await fetch('/api/users/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname, profileImageUrl }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || '프로필 수정에 실패했습니다.');
  }
  return res.json();
  */
}

// 비밀번호 수정
export async function patchPassword({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}) {
  const res = await fetch('/api/users/me/password', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || '비밀번호 변경에 실패했습니다.');
  }
  return res.json();
}
