/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import theme from '../../../styles/theme';

interface ToastMessageProps {
  message: string;
}

const ToastMessage = ({ message }: ToastMessageProps) => {
  if (!message) return null;

  return <div css={toastStyle}>{message}</div>;
};

export default ToastMessage;

const toastStyle = css`
  position: fixed;
  width: 70%;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 12px 24px;
  border-radius: 20px;
  z-index: 2000;
  font-size: ${theme.typography.body2Bold.fontSize};
  animation: fadeInOut 2s ease-in-out forwards;

  @keyframes fadeInOut {
    0%,
    100% {
      opacity: 0;
      transform: translate(-50%, 10px);
    }
    10%,
    90% {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
`;
