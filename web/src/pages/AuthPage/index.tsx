/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import theme from '@/styles/theme';
import { useMemo, useState, useRef, useEffect } from 'react';
import AuthTabs, { type AuthTab } from './components/AuthTabs';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';

// AuthPage: 탭 바(상단 고정)와 폼 카드 영역
const AuthPage = () => {
  const [active, setActive] = useState<AuthTab>('login');
  const title = useMemo(() => (active === 'login' ? '로그인' : '회원가입'), [active]);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [hasOverflow, setHasOverflow] = useState<boolean>(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const check = () => {
      setHasOverflow(el.scrollHeight > el.clientHeight);
    };

    // 초기 체크
    check();

    // 크기 변화를 감지 (ResizeObserver 우선)
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(check);
      ro.observe(el);
    } else {
      window.addEventListener('resize', check);
    }

    // 내용 변경(자식 추가/텍스트 변경 등) 감지
    const mo = new MutationObserver(check);
    mo.observe(el, { childList: true, subtree: true, characterData: true });

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', check);
      mo.disconnect();
    };
  }, [active]);

  return (
    <div css={container}>
      {/* 상단 여백: 컨테이너 높이의 약 10% */}
      <div css={topSpacer} aria-hidden />
      {/* 상단 탭 바 (고정 높이) */}
      <div css={tabsBar}>
        <AuthTabs active={active} onChange={setActive} />
      </div>

      {/* 폼 카드 */}
      <div ref={cardRef} css={[card, hasOverflow && cardWithGap]}>
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
  padding-top: ${theme.spacing.spacing16};
  margin: auto auto; /* 중앙 정렬 */
  display: flex;
  flex-direction: column;
  align-items: stretch; /* 자식이 부모 폭을 100% 사용 */
  justify-content: flex-start;
  background: #fff;
  padding: 0 16px 0 16px; /* 좌우 여백을 상위 컨테이너에서 책임 */
  box-sizing: border-box;
`;

const card = css`
  width: 100%;
  border: none; /* 폼 외곽선 제거 */
  border-radius: 12px;
  background: #ffffff;
  overflow: auto; /* 필요할 때만 스크롤 */
`;

/* 스크롤이 생길 때만 적용할 하단 여유(24px) */
const cardWithGap = css`
  padding-bottom: 24px;
`;

const contentArea = css`
  padding: 0;
`;

// contentPlaceholder는 더 이상 사용하지 않음

const tabsBar = css`
  width: 100%;
  margin: 0 0 12px 0; /* 상위 컨테이너 padding으로 좌우 여백 통일 */
`;

const topSpacer = css`
  width: 100%;
  flex: 0 0 20%; /* 컨테이너 높이의 20% */
`;
