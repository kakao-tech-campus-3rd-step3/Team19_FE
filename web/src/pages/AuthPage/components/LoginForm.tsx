/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import theme from '@/styles/theme';
import { useState } from 'react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // TODO: 항상 로그인 상태 유지 정책: remember UI/state 제거했음.

  // 아이디 사용으로 이메일 형식 검증 제거
  const passwordError = password && password.length < 8 ? '비밀번호는 8자 이상이어야 합니다.' : '';

  return (
    <form css={form} onSubmit={(e) => e.preventDefault()} aria-label="로그인 폼">
      {/* 아이디 */}
      <label css={label} htmlFor="login-email">
        아이디
      </label>
      <input
        id="login-email"
        css={input}
        type="text"
        placeholder="아이디를 입력해주세요"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      {/* 비밀번호 */}
      <label css={label} htmlFor="login-password">
        비밀번호
      </label>
      <input
        id="login-password"
        css={input}
        type="password"
        placeholder="비밀번호를 입력해주세요"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
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
        disabled={Boolean(passwordError)}
        aria-disabled={Boolean(passwordError)}
      >
        로그인
      </button>

      {/* 구분선 */}
      <div css={dividerWrap}>
        <span css={divider} />
      </div>

      {/* 비밀번호 찾기 */}
      <button type="button" css={linkBtn}>
        비밀번호를 잊으셨나요?
      </button>
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

const submitBtn = css`
  margin-top: 6px;
  padding: 14px 16px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: ${theme.typography.authButton.fontSize};
  font-weight: ${theme.typography.authButton.fontWeight};
  line-height: ${theme.typography.authButton.lineHeight};
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

const linkBtn = css`
  margin-top: 8px;
  background: none;
  border: none;
  color: #1c7ed6;
  cursor: pointer;
  text-decoration: underline;
  font-size: ${theme.typography.authLink.fontSize};
  font-weight: ${theme.typography.authLink.fontWeight};
  line-height: ${theme.typography.authLink.lineHeight};
`;
