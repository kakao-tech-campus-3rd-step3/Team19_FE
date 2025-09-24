import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 목데이터: 기존 회원 정보
const mockUser = {
  userId: 1,
  email: 'ksh58@gmail.com',
  nickname: '김선희',
  profileImageUrl:
    'https://wikis.krsocsci.org/images/a/aa/%EA%B8%B0%EB%B3%B8_%ED%94%84%EB%A1%9C%ED%95%84.png',
};

export const useEditProfile = () => {
  // 기존 정보
  // TODO: 닉네임, 프로필 이미지는 실제로 수정 시에만 사용하도록 변경 필요
  const [profileImageUrl] = useState(mockUser.profileImageUrl); // TODO: 사진 편집은 앱에서만 가능
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false); // 이전 비밀번호 보기
  const [showNewPassword, setShowNewPassword] = useState(false); // 새로운 비밀번호 보기
  const [oldPasswordError, setOldPasswordError] = useState(false); // 기존 비밀번호 에러 상태 추가

  // 입력값 변경 감지
  const [nicknameInput, setNicknameInput] = useState('');

  const navigate = useNavigate();

  // 저장 버튼 클릭 시
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // 비밀번호 수정: 둘 다 입력되어야만 PATCH
    const patchPassword =
      oldPassword && newPassword ? { currentPassword: oldPassword, newPassword } : null;

    // 닉네임만 수정하는 경우
    const patchProfile = {
      nickname: nicknameInput && nicknameInput !== mockUser.nickname ? nicknameInput : null,
      profileImageUrl: null,
    };

    // TODO: API 연결 필요
    // 목데이터: 기존 비밀번호가 'password123'일 때만 성공, 아니면 에러
    if (patchPassword) {
      if (oldPassword !== 'password123') {
        setOldPasswordError(true); // 에러 상태 true
        return; // 모달 띄우지 않음
      } else {
        setOldPasswordError(false); // 에러 해제
      }
      console.log('PATCH /api/users/me/password', patchPassword);
    }

    // 프로필 PATCH는 항상 성공 처리
    console.log('PATCH /api/users/me', patchProfile);

    setShowModal(true); // 성공 시에만 모달
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate('/mypage'); // 확인 버튼 클릭 시 마이페이지로 이동
  };

  return {
    mockUser,
    profileImageUrl,
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
  };
};
