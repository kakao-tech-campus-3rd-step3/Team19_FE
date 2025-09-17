import { useEffect, useState } from 'react';

// 사용자 조회 API 응답 타입
export interface UserResponse {
  userId: number;
  email: string;
  nickname: string;
  profileImageUrl: string;
}

export const useUser = (userId: number) => {
  const [user, setUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      // TODO: https://github.com/kakao-tech-campus-3rd-step3/Team19_FE/pull/40#discussion_r2347400930
      .then((data) => setUser(data))
      .catch(() => {
        setUser({
          userId,
          email: '',
          nickname: '사용자',
          profileImageUrl: '/assets/images/app-logo.png',
        });
      });
  }, [userId]);

  return user;
};
