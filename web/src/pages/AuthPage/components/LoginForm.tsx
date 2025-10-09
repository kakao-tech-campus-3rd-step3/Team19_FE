/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import theme from '@/styles/theme';
import { useState } from 'react';
import { FaGoogle, FaCommentDots } from 'react-icons/fa';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  return (
    <form css={form} onSubmit={(e) => e.preventDefault()} aria-label="로그인 폼">
      {/* 이메일 */}
      <label css={label} htmlFor="login-email">
        이메일
      </label>
      <input
        id="login-email"
        css={input}
        type="email"
        placeholder="이메일을 입력해주세요"
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

      {/* 로그인 상태 유지 */}
      <div css={inlineRow}>
        <input
          id="login-remember"
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        <label htmlFor="login-remember" css={helper}>
          로그인 상태 유지
        </label>
      </div>

      {/* 로그인 버튼 */}
      <button type="submit" css={submitBtn} aria-label="로그인">
        로그인
      </button>

      {/* 구분선 */}
      <div css={dividerWrap}>
        <span css={divider} />
      </div>

      {/* 소셜 로그인 버튼 */}
      <div css={socialRow}>
        <button type="button" css={socialBtn} aria-label="구글로 로그인">
          <FaGoogle size={18} style={{ marginRight: 8 }} /> Google
        </button>
        <button type="button" css={socialBtn} aria-label="카카오로 로그인">
          <FaCommentDots size={18} style={{ marginRight: 8 }} /> Kakao
        </button>
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

const inlineRow = css`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
`;

const helper = css`
  font-size: ${theme.typography.authHelper.fontSize};
  font-weight: ${theme.typography.authHelper.fontWeight};
  line-height: ${theme.typography.authHelper.lineHeight};
  color: #444;
`;

const submitBtn = css`
  margin-top: 6px;
  padding: 14px 16px;
  background: #12b886; /* 기본 그린톤 버튼 (프로젝트 팔레트에 맞춰 필요시 조정) */
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

const socialRow = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const socialBtn = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 10px;
  border: 1px solid ${theme.colors.button.black};
  background: #fff;
  border-radius: 10px;
  cursor: pointer;
  font-size: ${theme.typography.authInput.fontSize};
  font-weight: ${theme.typography.authInput.fontWeight};
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
