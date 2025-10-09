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
  background: ${theme.colors.button.gray100};
  border-radius: 12px;
  padding: 4px; /* 안쪽 여백으로 흰색 탭을 더 작게 보이게 */
  box-sizing: border-box;
`;

const tab = css`
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: ${theme.typography.authTab.fontSize};
  font-weight: ${theme.typography.authTab.fontWeight};
  border-radius: 10px;
`;

const tabActive = css`
  background: #ffffff; /* 흰색 박스가 회색 배경보다 살짝 작은 느낌은 padding으로 처리 */
  color: #111;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08) inset;
`;

const tabInactive = css`
  background: transparent; /* 비활성은 회색 배경만 보이게 */
  color: #555;
`;
