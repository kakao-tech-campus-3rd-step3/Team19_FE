/** @jsxImportSource @emotion/react */
import theme from '@/styles/theme';
import { css } from '@emotion/react';
import errorGif from '@/assets/images/error.gif';

interface ErrorProps {
  status: number;
  error: string;
  message: string;
  path: string;
}

const ErrorPage = ({ status, error, message, path }: ErrorProps) => {
  return (
    <div css={container}>
      <div css={errorBox}>
        <div css={statusStyle}>{status}</div>
        <div css={errorTextStyle}>{error}</div>
        <div css={messageStyle}>{message}</div>
        <div css={pathStyle}>요청 경로: {path}</div>
      </div>
      <button css={homeBtn} onClick={() => (window.location.href = '/')}>
        홈으로 돌아가기
      </button>
      <img src={errorGif} css={bottomImg} alt="에러 이미지" />
    </div>
  );
};

export default ErrorPage;

const container = css`
  height: calc(100vh - ${theme.spacing.spacing16});
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #ffffffff;
  position: relative;
`;

const errorBox = css`
  background: #f3f2f2ff;
  border-radius: 16px;
  box-shadow: 0 2px 12px #2222;
  margin-top: auto;
  padding: 36px 28px;
  text-align: center;
  margin-bottom: 32px;
`;

const statusStyle = css`
  font-size: 3.5rem;
  font-weight: 700;
  color: #d32f2f;
  margin-bottom: 8px;
  line-height: 1.1;
`;

const errorTextStyle = css`
  font-size: 2rem;
  font-weight: 700;
  color: #d32f2f;
  margin-bottom: 18px;
`;

const messageStyle = css`
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 12px;
`;

const pathStyle = css`
  font-size: 1.2rem;
  color: #888;
`;

const homeBtn = css`
  padding: 12px 32px;
  border-radius: 8px;
  border: none;
  background: #222;
  color: #fff;
  font-size: 1.8rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 18px;
`;

const bottomImg = css`
  margin-top: 5%;
  width: 90%;
  height: auto;
  object-fit: contain;
  /* 클릭/포인터 상호작용 방지 */
  pointer-events: none;
  user-select: none;
`;
