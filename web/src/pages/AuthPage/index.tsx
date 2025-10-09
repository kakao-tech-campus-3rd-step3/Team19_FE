/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import theme from '@/styles/theme';
import { useMemo, useState } from 'react';
import AuthTabs, { type AuthTab } from './components/AuthTabs';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';

// AuthPage: 탭 바(상단 고정)와 폼 카드 영역
const AuthPage = () => {
  const [active, setActive] = useState<AuthTab>('login');
  const title = useMemo(() => (active === 'login' ? '로그인' : '회원가입'), [active]);

  return (
    <div css={container}>
      {/* 상단 탭 바 (고정 높이) */}
      <div>
        <AuthTabs active={active} onChange={setActive} />
      </div>

      {/* 폼 카드 */}
      <div css={card}>
        <div id="auth-panel" role="tabpanel" aria-label={title} css={contentArea}>
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
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* 상단 정렬로 고정 위치 */
  background: #fff;
  padding-top: 12px;
  box-sizing: border-box;
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
