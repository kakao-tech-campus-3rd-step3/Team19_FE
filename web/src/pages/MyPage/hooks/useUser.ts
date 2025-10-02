import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/api/userApi';

// 사용자 조회 API 응답 타입
export interface UserResponse {
  userId: number;
  email: string;
  nickname: string;
  profileImageUrl: string;
}

// TODO: 실제 API 연동 시 onError에서 공통 에러 응답 처리
export const useUser = (userId: number) => {
  // react-query로 사용자 정보 조회 및 에러 처리
  const {
    data: user,
    error,
    isLoading,
    // TODO: 실제 API 연동 시 아래 onError 추가
    /*
    onError: (err: any) => {
      // 공통 에러 응답이면 에러 페이지로 이동
      if (err && err.status && err.error && err.message) {
        navigate('/error', { state: err });
      }
    },
    */
  } = useQuery<UserResponse>({
    queryKey: ['userProfile', userId],
    queryFn: () => getUserProfile(userId),
    retry: 1,
  });

  return { user, error, isLoading };
};
