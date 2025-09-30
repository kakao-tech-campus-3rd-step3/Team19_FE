import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/api/userApi';

// 사용자 조회 API 응답 타입
export interface UserResponse {
  userId: number;
  email: string;
  nickname: string;
  profileImageUrl: string;
}

export const useUser = (userId: number) => {
  // react-query로 사용자 정보 조회 및 에러 처리
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<UserResponse>({
    queryKey: ['userProfile', userId],
    queryFn: () => getUserProfile(userId),
    retry: 1,
  });

  return { user, error, isLoading };
};
