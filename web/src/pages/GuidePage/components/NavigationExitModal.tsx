/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import theme from '@/styles/theme';

interface NavigationExitModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const NavigationExitModal = ({ onConfirm, onCancel }: NavigationExitModalProps) => (
  <div css={modalStyle}>
    <div css={modalBoxStyle}>
      <div css={modalTextStyle}>
        {'경로 안내를 종료하고\n페이지를 이동하시겠습니까?'.split('\n').map((line, idx) =>
          idx === 0 ? (
            line
          ) : (
            <>
              <br key={idx} />
              {line}
            </>
          ),
        )}
      </div>
      <div css={modalBtnWrapStyle}>
        <button css={modalBtnStyle} onClick={onConfirm}>
          이동
        </button>
        <button css={modalBtnStyle} onClick={onCancel}>
          취소
        </button>
      </div>
    </div>
  </div>
);

export default NavigationExitModal;

const modalStyle = css`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 2001;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const modalBoxStyle = css`
  background: #fff;
  border-radius: 16px;
  padding: 32px 28px 24px 28px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
  display: flex;
  max-width: 80%;
  flex-direction: column;
  align-items: center;
`;

const modalTextStyle = css`
  ${theme.typography.modal1};
  color: #222;
  margin-bottom: 24px;
  text-align: center;
`;

const modalBtnWrapStyle = css`
  display: flex;
  gap: 18px;
`;

const modalBtnStyle = css`
  ${theme.typography.modal2};
  background: ${theme.colors.button.black};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  cursor: pointer;
  transition: background 0.18s;
  &:hover {
    background: ${theme.colors.button.red};
  }
`;
