/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import theme from '@/styles/theme';
import { useMemo, useState } from 'react';
import AuthTabs, { type AuthTab } from './components/AuthTabs';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';

// AuthPage: 탭 토글 및 폼 영역 컨테이너
const AuthPage = () => {
  const [active, setActive] = useState<AuthTab>('login');
  const title = useMemo(() => (active === 'login' ? '로그인' : '회원가입'), [active]);

  return (
    <div css={container}>
      <div css={card}>
        <AuthTabs active={active} onChange={setActive} />
        <div id="auth-panel" role="tabpanel" aria-label={title} css={contentArea}>
          {/* 로그인/회원가입 폼 영역 */}
          {active === 'login' ? <LoginForm /> : <SignupForm />}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

const container = css`
  width: 100%;
  height: calc(100vh - ${theme.spacing.spacing16});
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
`;

const card = css`
  width: 100%;
  max-width: 500px;
  margin: 0 16px;
  border: 1px solid ${theme.colors.button.black};
  border-radius: 12px;
  background: #ffffff;
  overflow: hidden;
`;

const contentArea = css`
  padding: 0;
`;

// contentPlaceholder는 더 이상 사용하지 않음
