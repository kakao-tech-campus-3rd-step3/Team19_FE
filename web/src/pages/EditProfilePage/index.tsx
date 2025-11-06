/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FaRegEdit } from 'react-icons/fa';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import { useEditProfile } from './hooks/useEditProfile';
import NoProfile from '@/assets/images/NoProfile.png';
import { theme } from '@/styles/theme';

const EditProfilePage = () => {
  // useEditProfile 훅 사용
  const {
    user,
    profileImageUrl,
    profileCleared,
    imgError,
    setImgError,
    handleEditProfileImg,
    handleProfileImgSelect,
    handleSetDefaultProfile,
    handleProfileImgChange,
    fileInputRef,
    showProfileModal,
    setShowProfileModal,
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    setNicknameInput,
    showModal,
    oldPasswordError,
    setOldPasswordError,
    handleSave,
    handleModalClose,
    showOldPassword,
    setShowOldPassword,
    showNewPassword,
    setShowNewPassword,
    selectedFile,
  } = useEditProfile();

  const displayUser = (user as any) ?? {
    userId: 0,
    email: '',
    nickname: '',
    // 서버 기본값 없음을 명확히 하기 위해 null 사용
    profileImageUrl: null,
  };
  // 현재 보여야 하는 이미지 우선순위:
  // 1) selectedFile preview (profileImageUrl containing object URL)
  // 2) 프로필을 명시적으로 '기본 이미지'로 변경한 경우 -> NoProfile
  // 3) 서버에 저장된 user.profileImageUrl
  // 4) 기본 NoProfile
  const effectiveProfileImage =
    selectedFile && typeof profileImageUrl === 'string'
      ? profileImageUrl
      : profileCleared
        ? typeof NoProfile === 'string'
          ? NoProfile
          : ''
        : ((user as any)?.profileImageUrl ??
          profileImageUrl ??
          (typeof NoProfile === 'string' ? NoProfile : ''));

  return (
    <div css={container}>
      <div css={titleRow}>
        <span css={emoji}>📝</span>
        <span css={title}>개인정보 수정</span>
      </div>
      <div css={profileBox}>
        <img
          src={
            imgError || !effectiveProfileImage
              ? typeof NoProfile === 'string'
                ? NoProfile
                : ''
              : effectiveProfileImage
          }
          alt="프로필 이미지"
          css={profileImg}
          onError={(e) => {
            // 에러 발생 시 NoProfile로 대체
            setImgError(true);
            (e.currentTarget as HTMLImageElement).src =
              typeof NoProfile === 'string' ? NoProfile : '';
          }}
        />
        <FaRegEdit css={editIcon} onClick={handleEditProfileImg} />
        {/* 프로필 이미지 편집 모달 */}
        {showProfileModal && (
          <div css={modalOverlay}>
            <div css={modalBox}>
              <div css={modalText}>프로필 이미지 변경</div>
              <button css={modalBtnS} onClick={handleProfileImgSelect}>
                앨범에서 사진 선택
              </button>
              {/* 현재 보여지는 프로필이 기본 이미지가 아니라면 '기본 프로필로 변경' 버튼 노출 */}
              {effectiveProfileImage &&
                effectiveProfileImage !== (typeof NoProfile === 'string' ? NoProfile : '') && (
                  <button css={modalBtnS} onClick={handleSetDefaultProfile}>
                    기본 프로필로 변경
                  </button>
                )}
              <button css={modalBtn} onClick={() => setShowProfileModal(false)}>
                닫기
              </button>
            </div>
          </div>
        )}
        {/* 숨겨진 파일 input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleProfileImgChange}
        />
      </div>
      <form css={formBox} onSubmit={handleSave}>
        <div css={inputRow}>
          <label css={labelShort}>이&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;름</label>
          <input
            css={inputShort}
            defaultValue={displayUser.nickname}
            onChange={(e) => setNicknameInput(e.target.value)}
            placeholder="닉네임을 입력하세요"
          />
        </div>
        <div css={inputRow}>
          <label css={labelShort}>이&nbsp;메&nbsp;일</label>
          <input
            css={inputShort}
            value={displayUser.email}
            readOnly
            style={{ background: '#eee' }}
          />
        </div>
        <div css={inputRowVertical}>
          <label css={labelLong}>이전 비밀번호</label>
          <div css={passwordInputWrapper}>
            <input
              css={[inputLong, oldPasswordError && errorInput]}
              type={showOldPassword ? 'text' : 'password'}
              value={oldPassword}
              onChange={(e) => {
                setOldPassword(e.target.value);
                setOldPasswordError(false);
              }}
            />
            <button
              type="button"
              css={eyeBtn}
              onClick={() => setShowOldPassword((prev: boolean) => !prev)}
              tabIndex={-1}
            >
              {showOldPassword ? <IoEyeOff /> : <IoEye />}
            </button>
          </div>
          {oldPasswordError && <div css={errorMsg}>기존 비밀번호와 일치하지 않습니다.</div>}
        </div>
        <div css={inputRowVertical}>
          <label css={labelLong}>새로운 비밀번호</label>
          <div css={passwordInputWrapper}>
            <input
              css={inputLong}
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              css={eyeBtn}
              onClick={() => setShowNewPassword((prev: boolean) => !prev)}
              tabIndex={-1}
            >
              {showNewPassword ? <IoEyeOff /> : <IoEye />}
            </button>
          </div>
        </div>
        <button css={saveBtn} type="submit">
          저장
        </button>
      </form>

      {/* 수정 완료 모달 */}
      {showModal && (
        <div css={modalOverlay}>
          <div css={modalBox}>
            <div css={modalText}>수정이 완료되었습니다.</div>
            <button css={modalBtn} onClick={handleModalClose}>
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfilePage;

// 스타일
const container = css`
  background: #fff;
  font-family: 'Pretendard', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: calc(
    100vh - ${theme.spacing.spacing16} - env(safe-area-inset-bottom) - env(safe-area-inset-top)
  );
  padding-top: calc(${theme.spacing.spacing16} + env(safe-area-inset-top));
  position: relative;
  overflow: auto;
`;

const titleRow = css`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding-bottom: 24px;
`;

const emoji = css`
  ${theme.typography.edit1};
`;

const title = css`
  ${theme.typography.edit1};
  text-shadow: 2px 2px 6px #bbb;
`;

const profileBox = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
`;

const profileImg = css`
  width: 125px;
  height: 125px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #eee;
  background: #fafafa;
`;

const editIcon = css`
  position: absolute;
  right: 2%;
  top: 95px;
  font-size: 2.2rem;
  padding: 4px;
`;

const formBox = css`
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: 18px;
  flex: 1; // 남은 공간을 모두 차지
`;

const inputRow = css`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
`;

// 이름/이메일 입력창은 짧게
const inputShort = css`
  width: 100%;
  ${theme.typography.edit3};
  align-items: left;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #bbb;
  background: #fff;
  &:read-only {
    background: #eee;
    color: #888;
  }
`;

// 비밀번호 입력창은 길게
const inputLong = css`
  width: 93%;
  ${theme.typography.edit3};
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #bbb;
  background: #fff;
`;

// 비밀번호 입력 부분만 세로 배치
const inputRowVertical = css`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  margin-bottom: 4px;
`;

const labelShort = css`
  ${theme.typography.edit2};
  text-align: left;
  width: 30%;
  color: #222;
`;

// 비밀번호 라벨 스타일
const labelLong = css`
  ${theme.typography.edit2};
  text-align: left;
  width: 100%; // 입력창과 맞춤
  color: #222;
  margin-bottom: 4px;
`;

const saveBtn = css`
  ${theme.typography.edit4};
  width: 100%;
  margin: auto auto 5% auto; // mypage의 로그아웃 버튼과 동일
  background: #111;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 12px 0;
  cursor: pointer;
  /* 버튼 반응 없애기 */
  outline: none;
  box-shadow: none;
  -webkit-tap-highlight-color: transparent;
  &:focus,
  &:active,
  &:focus-visible {
    outline: none;
    box-shadow: none;
  }
`;

const modalOverlay = css`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 2001;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const modalBox = css`
  background: #fff;
  border-radius: 16px;
  padding: 32px 28px 24px 28px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
  display: flex;
  max-width: 80%;
  flex-direction: column;
  align-items: center;
`;

const modalText = css`
  ${theme.typography.modal1};
  color: #222;
  margin-bottom: 24px;
  text-align: center;
`;

const modalBtn = css`
  ${theme.typography.modal2};
  background: ${theme.colors.button.black};
  color: #fff;
  border: none;
  border-radius: 8px;
  margin-bottom: 16px;
  padding: 10px 28px;
  cursor: pointer;
  transition: background 0.18s;
`;

// 보조 버튼도 동일 스타일로 유지 (필요 시 수정)
const modalBtnS = modalBtn;

const passwordInputWrapper = css`
  width: 100%;
  display: flex;
  align-items: center;
  position: relative;
`;

const eyeBtn = css`
  background: none;
  border: none;
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  color: #888;
`;

const errorInput = css`
  border: 2px solid #e74c3c !important;
  background: #fff0f0;
`;

const errorMsg = css`
  color: #e74c3c;
  font-size: 0.98rem;
  margin-top: 4px;
  margin-left: 2px;
`;
