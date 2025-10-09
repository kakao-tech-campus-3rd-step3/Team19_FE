/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import theme from '@/styles/theme';

// AuthPage 스켈레톤: 상단 탭과 폼 영역을 배치할 컨테이너만 구성
const AuthPage = () => {
  return (
    <div css={container}>
      <div css={card}>
        <div css={tabsPlaceholder}>탭 영역 (로그인 | 회원가입)</div>
        <div css={contentPlaceholder}>폼 컨텐츠 영역</div>
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

const tabsPlaceholder = css`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  font-size: ${theme.typography.my3.fontSize};
  font-weight: ${theme.typography.my3.fontWeight};
  background: ${theme.colors.button.gray100};
`;

const contentPlaceholder = css`
  padding: 24px 16px 32px 16px;
  color: #444;
`;
