/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import theme from '@/styles/theme';
import { useState } from 'react';

const SignupForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const isPasswordValid = (pw: string) => {
    if (!pw) return false;
    const lengthOk = pw.length >= 8;
    const hasLetter = /[A-Za-z]/.test(pw);
    const hasNumber = /\d/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);
    return lengthOk && hasLetter && hasNumber && hasSpecial;
  };
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

      {/* 아이디 + 중복 검사사 */}
      <label css={label} htmlFor="signup-email">
        아이디
      </label>
      <div css={row}>
        <input
          id="signup-email"
          css={[input, flex1]}
          type="text"
          placeholder="아이디를 입력해주세요"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="button" css={secondaryBtn}>
          중복 검사
        </button>
      </div>

      {/* 비밀번호 */}
      <label css={label} htmlFor="signup-password">
        비밀번호
      </label>
      <input
        id="signup-password"
        css={input}
        type="password"
        placeholder="8자 이상 영문, 숫자, 특수문자 포함"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {passwordError && (
        <div css={errorMsg} role="alert" aria-live="polite">
          {passwordError}
        </div>
      )}

      {/* 비밀번호 확인 */}
      <label css={label} htmlFor="signup-password-confirm">
        비밀번호 확인
      </label>
      <input
        id="signup-password-confirm"
        css={input}
        type="password"
        placeholder="비밀번호를 다시 입력해주세요"
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
        required
      />
      {confirmError && (
        <div css={errorMsg} role="alert" aria-live="polite">
          {confirmError}
        </div>
      )}

      {/* 제출 버튼 */}
      <button
        type="submit"
        css={submitBtn}
        disabled={Boolean(passwordError || confirmError)}
        aria-disabled={Boolean(passwordError || confirmError)}
      >
        회원가입
      </button>

      {/* 구분선 */}
      <div css={dividerWrap}>
        <span css={divider} />
      </div>
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
  font-size: ${theme.typography.authLabel.fontSize};
  font-weight: ${theme.typography.authLabel.fontWeight};
  line-height: ${theme.typography.authLabel.lineHeight};
`;

const input = css`
  padding: 12px 14px;
  border: 1px solid ${theme.colors.button.black};
  border-radius: 8px;
  font-size: ${theme.typography.authInput.fontSize};
  font-weight: ${theme.typography.authInput.fontWeight};
  line-height: ${theme.typography.authInput.lineHeight};
`;

const row = css`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
`;

const flex1 = css`
  flex: 1;
`;

const submitBtn = css`
  margin-top: 6px;
  padding: 14px 16px;
  background: #12b886;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: ${theme.typography.authButton.fontSize};
  font-weight: ${theme.typography.authButton.fontWeight};
  line-height: ${theme.typography.authButton.lineHeight};

  &:disabled {
    background: #c8f2e3;
    cursor: not-allowed;
  }
`;

const secondaryBtn = css`
  padding: 12px 14px;
  background: ${theme.colors.button.gray100};
  color: #111;
  border: 1px solid ${theme.colors.button.black};
  border-radius: 8px;
  cursor: pointer;
  font-size: ${theme.typography.authInput.fontSize};
  font-weight: ${theme.typography.authInput.fontWeight};
`;

const dividerWrap = css`
  display: flex;
  align-items: center;
  margin: 10px 0;
`;

const divider = css`
  flex: 1;
  height: 1px;
  background: ${theme.colors.button.black};
  opacity: 0.2;
`;

const errorMsg = css`
  margin-top: 4px;
  color: #e03131;
  font-size: ${theme.typography.authHelper.fontSize};
  font-weight: ${theme.typography.authHelper.fontWeight};
  line-height: ${theme.typography.authHelper.lineHeight};
`;
