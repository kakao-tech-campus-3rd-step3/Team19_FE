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
      <div css={tabsBar}>
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
  max-width: 500px; /* 페이지 레이아웃 단일화 */
  height: calc(100vh - ${theme.spacing.spacing16});
  margin: 0 auto; /* 중앙 정렬 */
  display: flex;
  flex-direction: column;
  align-items: stretch; /* 자식이 부모 폭을 100% 사용 */
  justify-content: flex-start;
  background: #fff;
  padding: 12px 16px 0 16px; /* 좌우 여백을 상위 컨테이너에서 책임 */
  box-sizing: border-box;
`;

const card = css`
  width: 100%;
  border: 1px solid ${theme.colors.button.black};
  border-radius: 12px;
  background: #ffffff;
  overflow: hidden;
`;

const contentArea = css`
  padding: 0;
`;

// contentPlaceholder는 더 이상 사용하지 않음

const tabsBar = css`
  width: 100%;
  margin: 0 0 12px 0; /* 상위 컨테이너 padding으로 좌우 여백 통일 */
`;
