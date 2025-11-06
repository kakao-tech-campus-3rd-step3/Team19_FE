import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import NoProfile from '@/assets/images/NoProfile.png';
// 타입 전용 import로 변경
import type { UserProfile } from '@/api/userApi';
import { patchProfile, patchPassword, getMyProfile } from '@/api/userApi';
import { uploadProfileImage } from '@/api/userApi';

export const useEditProfile = () => {
  // 기본 프로필 이미지는 NoProfile로 초기화
  const [profileImageUrl, setProfileImageUrl] = useState<string>(
    typeof NoProfile === 'string' ? NoProfile : '',
  );
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
      setProfileImageUrl(user.profileImageUrl ?? (typeof NoProfile === 'string' ? NoProfile : ''));
      setNicknameInput(user.nickname ?? '');
      setImgError(false);
    }
  }, [user]);

  // useMutation에 올바른 시그니처로 설정
  const profileMutation = useMutation<any, Error, { nickname?: string; profileImageUrl?: string }>({
    mutationFn: (vars) => patchProfile(vars),
    onSuccess: (res, vars) => {
      try {
        // 즉시 캐시 갱신: 서버가 반환한 값이 있다면 그대로 반영, 없으면 기존 user와 병합
        if (res && typeof res === 'object') {
          queryClient.setQueryData(['myProfile'], (old: any) => ({
            ...(old ?? {}),
            ...(res ?? {}),
          }));
        } else {
          // 서버가 변경된 필드만 적용한 경우, merge vars
          queryClient.setQueryData(['myProfile'], (old: any) => ({
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
          setProfileImageUrl(res.profileImageUrl ?? '');
        }
      } catch {
        // ignore
      }
    },
  });

  // 프로필 편집 버튼 클릭
  const handleEditProfileImg = () => setShowProfileModal(true);

  // 앨범에서 사진 선택
  const handleProfileImgSelect = () => {
    setShowProfileModal(false);
    fileInputRef.current?.click();
  };

  // 기본 이미지로 변경
  const handleSetDefaultProfile = () => {
    setShowProfileModal(false);
    setImgError(false);
    setSelectedFile(null);
    setProfileImageUrl(typeof NoProfile === 'string' ? NoProfile : '');
  };

  // 파일 선택 시 프로필 이미지 변경 (preview + 파일 저장)
  const handleProfileImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfileImageUrl(url);
      setSelectedFile(file);
      setImgError(false);
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
            // TODO: 실제 API 연동 시 공통 에러 포맷이면 에러 페이지로 이동하도록 처리 가능
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
          // uploadMutation.onSuccess already set cache and profileImageUrl.
          // 닉네임 변경이 있으면 patch 호출(그쪽 onSuccess에서 모달 띄움).
          // 닉네임 변경이 없으면 여기서 바로 모달 띄움.
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
          // 디버그 로깅 추가
          // eslint-disable-next-line no-console
          console.error('uploadProfileImage failed:', error);
          alert(error?.message || '프로필 이미지 업로드에 실패했습니다.');
        },
      });
      return;
    }

    // 닉네임/프로필 이미지(링크) 수정 — 기존 로직 (파일 업로드가 없을 때)
    profileMutation.mutate(
      {
        nickname:
          nicknameInput && nicknameInput !== (user?.nickname ?? '') ? nicknameInput : undefined,
        profileImageUrl:
          profileImageUrl !==
          (user?.profileImageUrl ?? (typeof NoProfile === 'string' ? NoProfile : ''))
            ? profileImageUrl
            : undefined,
      },
      // 개별 콜백 불필요: profileMutation.onSuccess에서 처리
    );
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate('/mypage');
  };

  return {
    user, // 실제 API 데이터 (없으면 undefined)
    profileImageUrl,
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
