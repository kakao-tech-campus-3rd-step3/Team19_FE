/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FaRegEdit } from 'react-icons/fa';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import { useEditProfile } from './hooks/useEditProfile';
import NoProfile from '@/assets/images/NoProfile.png';
import { theme } from '@/styles/theme';

// 목데이터: 기존 회원 정보
// (mockUser는 useEditProfile에서 가져옴)

const EditProfilePage = () => {
  // useEditProfile 훅 사용
  const {
    mockUser,
    profileImageUrl,
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    setNicknameInput,
    showModal,
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
  } = useEditProfile();

  return (
    <div css={container}>
      <div css={titleRow}>
        <span css={emoji}>📝</span>
        <span css={title}>개인정보 수정</span>
      </div>
      <div css={profileBox}>
        <img
          src={imgError ? NoProfile : profileImageUrl}
          alt="프로필"
          css={profileImg}
          onError={() => setImgError(true)}
        />
        <FaRegEdit css={editIcon} /> {/* TODO: 프로필 이미지 편집은 앱에서만 가능 */}
      </div>
      <form css={formBox} onSubmit={handleSave}>
        <div css={inputRow}>
          <label css={labelShort}>이&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;름</label>
          <input
            css={inputShort}
            defaultValue={mockUser.nickname}
            onChange={(e) => setNicknameInput(e.target.value)}
            placeholder="닉네임을 입력하세요"
          />
        </div>
        <div css={inputRow}>
          <label css={labelShort}>이&nbsp;메&nbsp;일</label>
          <input css={inputShort} value={mockUser.email} readOnly style={{ background: '#eee' }} />
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
                setOldPasswordError(false); // 입력 시 에러 해제
              }}
            />
            <button
              type="button"
              css={eyeBtn}
              onClick={() => setShowOldPassword((prev) => !prev)}
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
              onClick={() => setShowNewPassword((prev) => !prev)}
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
  height: calc(100vh - ${theme.spacing.spacing16});
  position: relative;
  overflow: hidden;
`;

const titleRow = css`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4% 5%;
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
  width: 35%;
  height: auto;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #eee;
  background: #fafafa;
`;

const editIcon = css`
  position: absolute;
  right: 30%;
  top: 105px;
  font-size: 2.2rem;
  background: #fff;
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const modalBox = css`
  background: #fff;
  border-radius: 18px;
  padding: 38px 32px;
  box-shadow: 0 2px 12px #2224;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const modalText = css`
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 24px;
`;

const modalBtn = css`
  padding: 10px 38px;
  border-radius: 8px;
  border: none;
  background: #222;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
`;

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
