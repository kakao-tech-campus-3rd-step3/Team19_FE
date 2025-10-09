/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import theme from '@/styles/theme';

export type AuthTab = 'login' | 'signup';

type Props = {
  active: AuthTab;
  onChange: (next: AuthTab) => void;
};

const AuthTabs = ({ active, onChange }: Props) => {
  return (
    <div role="tablist" aria-label="인증 탭" css={tablist}>
      <button
        role="tab"
        aria-selected={active === 'login'}
        aria-controls="auth-panel"
        css={[tab, active === 'login' ? tabActive : tabInactive]}
        onClick={() => onChange('login')}
      >
        로그인
      </button>
      <button
        role="tab"
        aria-selected={active === 'signup'}
        aria-controls="auth-panel"
        css={[tab, active === 'signup' ? tabActive : tabInactive]}
        onClick={() => onChange('signup')}
      >
        회원가입
      </button>
    </div>
  );
};

export default AuthTabs;

const tablist = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 56px;
  border-bottom: 1px solid ${theme.colors.button.black};
`;

const tab = css`
  background: none;
  border: none;
  cursor: pointer;
  font-size: ${theme.typography.authTab.fontSize};
  font-weight: ${theme.typography.authTab.fontWeight};
`;

const tabActive = css`
  background: #ffffff;
  color: #111;
`;

const tabInactive = css`
  background: ${theme.colors.button.gray100};
  color: #555;
`;
