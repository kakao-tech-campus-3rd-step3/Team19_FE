/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import theme from '@/styles/theme';

interface GuideBarProps {
  message: string | null;
  hasArrived: boolean;
  onArrivalConfirm: () => void;
}

export const GuideBar = ({ message, hasArrived, onArrivalConfirm }: GuideBarProps) => {
  return (
    <div css={guidanceBarStyle}>
      <div css={guidanceContentStyle}>
        <div css={guidanceTextStyle}>{message}</div>
        {hasArrived && (
          <button css={confirmButtonStyle} onClick={onArrivalConfirm}>
            확인
          </button>
        )}
      </div>
    </div>
  );
};

const guidanceBarStyle = css`
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 16px;
  background: ${theme.colors.button.black};
  color: ${theme.colors.text.white};
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-height: 48px;
`;

const guidanceContentStyle = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const guidanceTextStyle = css`
  ${theme.typography.guide1}
  white-space: pre-line;
  word-break: keep-all;
  overflow-wrap: anywhere;
`;

const confirmButtonStyle = css`
  background: ${theme.colors.button.red};
  color: ${theme.colors.text.white};
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  ${theme.typography.guide2}
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease;
  align-self: center;

  &:hover {
    background: #b71c1c;
  }

  &:active {
    background: #d32f2f;
  }
`;
