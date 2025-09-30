/** @jsxImportSource @emotion/react */
import theme from '@/styles/theme';
import { css } from '@emotion/react';

const ToastMessage = ({ message }: { message: string }) => {
  if (!message) return null;

  return <div css={toastStyle}>{message}</div>;
};

export default ToastMessage;

const toastStyle = css`
  position: fixed;
  bottom: 11vh;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  width: 60%;
  padding: 10px 15px;
  border-radius: 5px;
  white-space: pre-line; /* 줄바꿈 문자 처리 */
  text-align: center;
  ${theme.typography.text2}
`;
