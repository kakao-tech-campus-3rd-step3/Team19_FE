import { useQuery } from '@tanstack/react-query';
// 타입 전용 import로 변경
import type { UserProfile } from '@/api/userApi';
import { getUserProfile } from '@/api/userApi';
import { mockUser } from '@/mock/mockUser';

export const useUser = (userId: number) => {
  // useQuery에 options 객체 한 개로 전달 (에러 리다이렉트는 client.ts에서 처리)
  const {
    data: user,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['userProfile', userId] as const,
    queryFn: () => getUserProfile(userId),
    retry: 1,
  } as any);

  // user가 없으면 mockUser 폴백 사용 (로그인 미구현 개발 편의)
  const resolvedUser: UserProfile | null = (user ??
    (mockUser as unknown as UserProfile)) as UserProfile;

  return { user: resolvedUser, error, isLoading, isMock: !user };
};
