import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import NoProfile from '@/assets/images/NoProfile.png';
import { patchProfile, patchPassword } from '@/api/userApi';

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

  // 기존 정보
  // TODO: 닉네임, 프로필 이미지는 실제로 수정 시에만 사용하도록 변경 필요
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false); // 이전 비밀번호 보기
  const [showNewPassword, setShowNewPassword] = useState(false); // 새로운 비밀번호 보기
  const [oldPasswordError, setOldPasswordError] = useState(false); // 기존 비밀번호 에러 상태 추가

  // 입력값 변경 감지
  const [nicknameInput, setNicknameInput] = useState('');

  const navigate = useNavigate();

  // react-query mutation
  const profileMutation = useMutation({ mutationFn: patchProfile });
  const passwordMutation = useMutation({ mutationFn: patchPassword });

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
          onError: () => {
            setOldPasswordError(true);
          },
        },
      );
      return;
    }

    // 닉네임/프로필 이미지 수정
    profileMutation.mutate(
      {
        nickname: nicknameInput && nicknameInput !== mockUser.nickname ? nicknameInput : undefined,
        profileImageUrl: profileImageUrl !== mockUser.profileImageUrl ? profileImageUrl : undefined,
      },
      {
        onSuccess: () => setShowModal(true),
        onError: (error) => {
          alert(error.message || '서버와 연결할 수 없습니다.');
        },
      },
    );
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate('/mypage'); // 확인 버튼 클릭 시 마이페이지로 이동
  };

  return {
    mockUser,
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
    // 필요시 profileMutation, passwordMutation의 isPending, error 등도 반환
  };
};
