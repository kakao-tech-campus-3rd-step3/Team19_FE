import { useQuery } from '@tanstack/react-query';
// 타입 전용 import로 변경
import type { UserProfile } from '@/api/userApi';
import { getUserProfile } from '@/api/userApi';

// TODO: 실제 API 연동 시 onError에서 공통 에러 응답 처리
export const useUser = (userId: number) => {
  const {
    data: user,
    error,
    isLoading,
    // TODO: 실제 API 연동 시 아래 onError 추가
    /*
    onError: (err: any) => {
      if (err && err.status && err.error && err.message) {
        navigate('/error', { state: err });
      }
    },
    */
  } = useQuery<UserProfile, Error>({
    queryKey: ['userProfile', userId],
    queryFn: () => getUserProfile(userId),
    retry: 1,
  });

  return { user, error, isLoading };
};
