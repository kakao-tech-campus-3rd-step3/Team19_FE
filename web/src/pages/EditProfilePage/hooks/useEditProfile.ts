import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// NoProfile import removed (사용 안함)
// 타입 전용 import로 변경
import type { UserProfile } from '@/api/userApi';
import { patchProfile, patchPassword, getMyProfile } from '@/api/userApi';
import { uploadProfileImage } from '@/api/userApi';

// 기본 프로필 URL (백엔드로 전송할 기본 이미지 링크)
export const DEFAULT_PROFILE_URL =
  'https://wikis.krsocsci.org/images/a/aa/%EA%B8%B0%EB%B3%B8_%ED%94%84%EB%A1%9C%ED%95%84.png';

export const useEditProfile = () => {
  // profileImageUrl: null = 아직 없음/서버값 사용(변경 없음)
  // preview(파일 선택)는 문자열(객체 URL)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  // 사용자가 "기본 프로필로 변경"을 눌러 명시적으로 기본으로 바꾼 경우 true
  const [profileCleared, setProfileCleared] = useState<boolean>(false);
  // 선택된 실제 파일 (업로드용)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imgError, setImgError] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [oldPasswordError, setOldPasswordError] = useState(false);

  const [nicknameInput, setNicknameInput] = useState('');

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // useQuery 제네릭 및 옵션 객체 형식 사용
  const {
    data: user,
    error: _userError, // 사용 안하면 언더스코어로 무시
    isLoading: userLoading,
  } = useQuery<UserProfile | null, Error>({
    queryKey: ['myProfile'],
    queryFn: () => getMyProfile(),
    staleTime: 2 * 60_000,
    // 컴포넌트 재진입 시 최신 데이터를 확인하도록 설정 (원하면 'always'로 변경)
    refetchOnMount: 'always',
    // TODO: 실제 API 연동 시 onError에서 공통 에러 포맷 처리 (navigate('/error', { state: err }))
  });

  // user 데이터가 도착하면 초기값 세팅
  useEffect(() => {
    if (user) {
      setProfileImageUrl(user.profileImageUrl ?? null);
      setProfileCleared(false);
      setNicknameInput(user.nickname ?? '');
      setImgError(false);
    }
  }, [user]);

  // useMutation에 올바른 시그니처로 설정
  const profileMutation = useMutation<
    any,
    Error,
    { nickname?: string; profileImageUrl?: string | null }
  >({
    mutationFn: (vars) => patchProfile(vars),
    onSuccess: (res, vars) => {
      try {
        // 즉시 캐시 갱신: 서버가 반환한 값이 있다면 그대로 반영, 없으면 기존 user와 병합
        if (res && typeof res === 'object') {
          queryClient.setQueryData(['myProfile'], (old: any) => ({
            ...(old ?? {}),
            ...(res ?? {}),
          }));
          // MyPage 등에서 사용하는 다른 키도 함께 갱신
          queryClient.setQueryData(['user', 'me'], (old: any) => ({
            ...(old ?? {}),
            ...(res ?? {}),
          }));
        } else {
          // 서버가 변경된 필드만 적용한 경우, merge vars
          queryClient.setQueryData(['myProfile'], (old: any) => ({
            ...(old ?? {}),
            ...(vars ?? {}),
          }));
          queryClient.setQueryData(['user', 'me'], (old: any) => ({
            ...(old ?? {}),
            ...(vars ?? {}),
          }));
        }
      } catch {
        // 무시
      }
      setShowModal(true);
    },
  });

  const passwordMutation = useMutation<
    any,
    Error,
    { currentPassword: string; newPassword: string }
  >({
    mutationFn: (vars) => patchPassword(vars),
  });

  // 프로필 이미지 업로드 뮤테이션
  const uploadMutation = useMutation<UserProfile, Error, File>({
    mutationFn: (file) => uploadProfileImage(file),
    onSuccess: (res) => {
      try {
        // 서버가 새 프로필 정보를 반환하면 캐시에 즉시 반영
        if (res && typeof res === 'object') {
          queryClient.setQueryData(['myProfile'], res);
          // MyPage에서 쓰는 키도 함께 갱신
          queryClient.setQueryData(['user', 'me'], res);
          setProfileImageUrl(res.profileImageUrl ?? null);
          setProfileCleared(false);
          setSelectedFile(null);
        }
      } catch {
        // ignore
      }
    },
  });

  // 편집 관련 핸들러
  const handleEditProfileImg = () => setShowProfileModal(true);
  const handleProfileImgSelect = () => {
    setShowProfileModal(false);
    fileInputRef.current?.click();
  };
  const handleSetDefaultProfile = () => {
    setShowProfileModal(false);
    setImgError(false);
    setSelectedFile(null);
    setProfileCleared(true);
    setProfileImageUrl(DEFAULT_PROFILE_URL);
  };
  const handleProfileImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfileImageUrl(url);
      setSelectedFile(file);
      setImgError(false);
      setProfileCleared(false);
    }
  };

  // 저장 버튼 클릭 시
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // 비밀번호 수정
    if (oldPassword && newPassword) {
      passwordMutation.mutate(
        { currentPassword: oldPassword, newPassword },
        {
          onSuccess: () => {
            setOldPasswordError(false);
            setShowModal(true);
          },
          onError: (_error: any) => {
            setOldPasswordError(true);
          },
        },
      );
      return;
    }

    // 이미지 파일이 선택되어 있으면 먼저 업로드
    if (selectedFile) {
      uploadMutation.mutate(selectedFile, {
        onSuccess: (_res) => {
          const nicknamePayload =
            nicknameInput && nicknameInput !== (user?.nickname ?? '')
              ? { nickname: nicknameInput }
              : undefined;
          if (nicknamePayload) {
            profileMutation.mutate(nicknamePayload);
          } else {
            setShowModal(true);
          }
        },
        onError: (error: any) => {
          console.error('uploadProfileImage failed:', error);
          alert(error?.message || '프로필 이미지 업로드에 실패했습니다.');
        },
      });
      return;
    }

    // 사용자가 기본 프로필로 변경한 경우 즉시 DEFAULT_PROFILE_URL 전송
    if (profileCleared) {
      profileMutation.mutate({
        nickname:
          nicknameInput && nicknameInput !== (user?.nickname ?? '') ? nicknameInput : undefined,
        profileImageUrl: DEFAULT_PROFILE_URL,
      });
      return;
    }

    // 그 외: 변경된 필드만 전송
    let profileImageUrlPayload: string | undefined;
    if (profileImageUrl == null) {
      profileImageUrlPayload = undefined;
    } else if (profileImageUrl !== (user?.profileImageUrl ?? null)) {
      profileImageUrlPayload = profileImageUrl;
    } else {
      profileImageUrlPayload = undefined;
    }

    profileMutation.mutate({
      nickname:
        nicknameInput && nicknameInput !== (user?.nickname ?? '') ? nicknameInput : undefined,
      profileImageUrl: profileImageUrlPayload,
    });
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate('/mypage');
  };

  useEffect(() => {
    // placeholder for side-effects if needed
  }, [user]);

  return {
    user,
    profileImageUrl,
    profileCleared,
    setProfileImageUrl,
    selectedFile,
    setSelectedFile,
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    nicknameInput,
    setNicknameInput,
    showModal,
    setShowModal,
    imgError,
    setImgError,
    showOldPassword,
    setShowOldPassword,
    showNewPassword,
    setShowNewPassword,
    oldPasswordError,
    setOldPasswordError,
    handleSave,
    handleModalClose,
    handleEditProfileImg,
    handleProfileImgSelect,
    handleSetDefaultProfile,
    handleProfileImgChange,
    fileInputRef,
    showProfileModal,
    setShowProfileModal,
    userLoading,
    userError: _userError,
  };
};
