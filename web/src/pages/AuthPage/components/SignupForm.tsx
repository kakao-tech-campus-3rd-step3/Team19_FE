/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import theme from '@/styles/theme';
import { useState } from 'react';
import { FaUser, FaLock } from 'react-icons/fa';
import { IoEye, IoEyeOff } from 'react-icons/io5';

const SignupForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const isPasswordValid = (pw: string) => {
    if (!pw) return false;
    const lengthOk = pw.length >= 8;
    const hasLetter = /[A-Za-z]/.test(pw);
    const hasNumber = /\d/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);
    return lengthOk && hasLetter && hasNumber && hasSpecial;
  };
  const isEmailValid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const emailError = email && !isEmailValid(email) ? '이메일 형식이 올바르지 않습니다.' : '';

  const passwordError =
    password && !isPasswordValid(password)
      ? '8자 이상, 영문/숫자/특수문자를 모두 포함해야 합니다.'
      : '';
  const confirmError =
    passwordConfirm && passwordConfirm !== password ? '비밀번호가 일치하지 않습니다.' : '';

  return (
    <form css={form} onSubmit={(e) => e.preventDefault()} aria-label="회원가입 폼">
      {/* 이름 */}
      <label css={label} htmlFor="signup-name">
        이름
      </label>
      <input
        id="signup-name"
        css={input}
        type="text"
        placeholder="이름을 입력해주세요"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      {/* 이메일 */}
      <label css={label} htmlFor="signup-email">
        <FaUser size={18} color="#777" />
        <span>이메일</span>
      </label>
      <input
        id="signup-email"
        css={input}
        type="email"
        placeholder="이메일을 입력해주세요"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      {emailError && (
        <div css={errorMsg} role="alert" aria-live="polite">
          {emailError}
        </div>
      )}

      {/* 비밀번호 */}
      <label css={label} htmlFor="signup-password">
        <FaLock size={18} color="#777" />
        <span>비밀번호</span>
      </label>
      <div css={passwordWrapper}>
        <input
          id="signup-password"
          css={[input, passwordField]}
          type={showPassword ? 'text' : 'password'}
          placeholder="8자 이상 영문, 숫자, 특수문자 포함"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          css={eyeBtn}
          aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
          onClick={() => setShowPassword((s) => !s)}
        >
          {showPassword ? <IoEyeOff /> : <IoEye />}
        </button>
      </div>
      {passwordError && (
        <div css={errorMsg} role="alert" aria-live="polite">
          {passwordError}
        </div>
      )}

      {/* 비밀번호 확인 */}
      <label css={label} htmlFor="signup-password-confirm">
        <FaLock size={18} color="#777" />
        <span>비밀번호 확인</span>
      </label>
      <div css={passwordWrapper}>
        <input
          id="signup-password-confirm"
          css={[input, passwordField]}
          type={showPasswordConfirm ? 'text' : 'password'}
          placeholder="비밀번호를 다시 입력해주세요"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          required
        />
        <button
          type="button"
          css={eyeBtn}
          aria-label={showPasswordConfirm ? '비밀번호 숨기기' : '비밀번호 보기'}
          onClick={() => setShowPasswordConfirm((s) => !s)}
        >
          {showPasswordConfirm ? <IoEyeOff /> : <IoEye />}
        </button>
      </div>
      {confirmError && (
        <div css={errorMsg} role="alert" aria-live="polite">
          {confirmError}
        </div>
      )}

      {/* 제출 버튼 */}
      <button
        type="submit"
        css={submitBtn}
        disabled={Boolean(emailError || passwordError || confirmError)}
        aria-disabled={Boolean(emailError || passwordError || confirmError)}
      >
        회원가입
      </button>
    </form>
  );
};

export default SignupForm;

const form = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
`;

const label = css`
  ${theme.typography.authLabel};
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  margin-top: 6px;
`;

const input = css`
  padding: 12px 14px;
  border: 1px solid #bbb;
  border-radius: 8px;
  margin-bottom: 0;
  ${theme.typography.authInput};
  background: #fff;
  width: 100%; /* 입력창이 wrapper 너비를 채우도록 */
  box-sizing: border-box; /* padding 포함 너비 계산 */
`;

/* 비밀번호 입력용 추가 스타일: 오른쪽에 아이콘 위해 내부 여백 확보 */
const passwordField = css`
  padding-right: 48px; /* 아이콘 너비 + 여유 공간 확보 (버튼 크기에 맞춤) */
`;

const passwordWrapper = css`
  position: relative;
  display: block; /* wrapper가 전체 너비를 갖도록 변경 */
  width: 100%;
`;

const eyeBtn = css`
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%); /* 세로 중앙 정렬 */
  background: none;
  border: none;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
  /* 버튼이 input 위에 겹쳐도 입력 포인터는 유지하려면 pointer-events 유지 (버튼은 클릭 가능) */
`;

// row/flex1 제거

const submitBtn = css`
  margin-top: 24px;
  padding: 14px 16px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  ${theme.typography.authButton};
`;

// secondaryBtn 제거

const errorMsg = css`
  margin-top: 0;
  text-align: left;
  color: #e03131;
  ${theme.typography.authHelper};
`;
