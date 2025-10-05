import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import NoProfile from '@/assets/images/NoProfile.png';
// 타입 전용 import로 변경
import type { UserProfile } from '@/api/userApi';
import { patchProfile, patchPassword, getMyProfile } from '@/api/userApi';

// 목데이터: 기존 회원 정보
const mockUser = {
  userId: 1,
  email: 'ksh58@gmail.com',
  nickname: '김선희',
  profileImageUrl: typeof NoProfile === 'string' ? NoProfile : '',
};

export const useEditProfile = () => {
  const [profileImageUrl, setProfileImageUrl] = useState<string>(mockUser.profileImageUrl);
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

  // useQuery 제네릭 및 옵션 객체 형식 사용
  const {
    data: user,
    error: _userError, // 사용 안하면 언더스코어로 무시
    isLoading: userLoading,
  } = useQuery<UserProfile | null, Error>({
    queryKey: ['myProfile'],
    queryFn: () => getMyProfile(),
    staleTime: 2 * 60_000,
    // TODO: 실제 API 연동 시 onError에서 공통 에러 포맷 처리 (navigate('/error', { state: err }))
  });

  // user 데이터가 도착하면 초기값 세팅
  useEffect(() => {
    if (user) {
      setProfileImageUrl(user.profileImageUrl ?? mockUser.profileImageUrl);
      setNicknameInput(user.nickname ?? '');
      setImgError(false);
    }
  }, [user]);

  // useMutation에 올바른 시그니처로 설정
  const profileMutation = useMutation<any, Error, { nickname?: string; profileImageUrl?: string }>({
    mutationFn: (vars) => patchProfile(vars),
  });

  const passwordMutation = useMutation<
    any,
    Error,
    { currentPassword: string; newPassword: string }
  >({
    mutationFn: (vars) => patchPassword(vars),
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
    setProfileImageUrl(mockUser.profileImageUrl);
  };

  // 파일 선택 시 프로필 이미지 변경
  const handleProfileImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfileImageUrl(url);
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

    // 닉네임/프로필 이미지 수정
    profileMutation.mutate(
      {
        nickname:
          nicknameInput && nicknameInput !== (user?.nickname ?? mockUser.nickname)
            ? nicknameInput
            : undefined,
        profileImageUrl:
          profileImageUrl !== (user?.profileImageUrl ?? mockUser.profileImageUrl)
            ? profileImageUrl
            : undefined,
      },
      {
        onSuccess: () => setShowModal(true),
        onError: (error: any) => {
          // TODO: 실제 API 연동 시 공통 에러 포맷이면 에러 페이지로 이동하도록 처리 가능
          alert(error?.message || '서버와 연결할 수 없습니다.');
        },
      },
    );
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate('/mypage');
  };

  return {
    mockUser,
    user, // 실제 API 데이터 (없으면 undefined)
    profileImageUrl,
    setProfileImageUrl,
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
