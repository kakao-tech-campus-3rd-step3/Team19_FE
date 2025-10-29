/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import theme from '@/styles/theme';
import { useState } from 'react';
import { FaUser, FaLock } from 'react-icons/fa';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import { login } from '@/api/userApi';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const navigate = useNavigate();
  // TODO: 항상 로그인 상태 유지 정책: remember UI/state 제거했음.

  // 이메일 형식 및 비밀번호 기본 검증
  const isEmailValid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const emailError = email && !isEmailValid(email) ? '이메일 형식이 올바르지 않습니다.' : '';
  const passwordError = password && password.length < 8 ? '비밀번호는 8자 이상이어야 합니다.' : '';

  // 제출 가능 여부: 이메일/비밀번호 조건 모두 만족해야 함
  const canSubmit = isEmailValid(email) && password.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitError('');
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      const message = err?.message || '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form css={form} onSubmit={handleSubmit} aria-label="로그인 폼">
      {/* 이메일 */}
      <label css={label} htmlFor="login-email">
        <FaUser size={18} color="#777" />
        <span>이메일</span>
      </label>
      <input
        id="login-email"
        css={[input, emailError && inputError]}
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
      <label css={label} htmlFor="login-password">
        <FaLock size={18} color="#777" />
        <span>비밀번호</span>
      </label>
      <div css={passwordWrapper}>
        <input
          id="login-password"
          css={[input, passwordError && inputError, passwordField]}
          type={showPassword ? 'text' : 'password'}
          placeholder="비밀번호를 입력해주세요"
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

      {/* 로그인 버튼 */}
      <button
        type="submit"
        css={submitBtn}
        aria-label="로그인"
        disabled={!canSubmit || submitting}
        aria-disabled={!canSubmit || submitting}
        style={{
          opacity: canSubmit && !submitting ? 1 : 0.5,
          cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed',
        }}
      >
        {submitting ? '로그인 중...' : '로그인'}
      </button>
      {submitError && (
        <div css={errorMsg} role="alert" aria-live="polite">
          {submitError}
        </div>
      )}
    </form>
  );
};

export default LoginForm;

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

/* 추가: 에러 시 적용되는 최소한의 스타일 (기존 input 유지) */
const inputError = css`
  border: 2px solid #e74c3c !important;
  background: #fff0f0;
`;

const submitBtn = css`
  margin-top: 28px;
  padding: 14px 16px;
  background: #111; /* WriteReviewPage saveBtn 색상과 동일하게 적용 */
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  ${theme.typography.authButton};
`;

const errorMsg = css`
  margin-top: 0;
  text-align: left;
  color: #e03131;
  ${theme.typography.authHelper};
`;
