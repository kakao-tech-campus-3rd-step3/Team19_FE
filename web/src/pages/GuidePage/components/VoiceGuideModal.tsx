/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import theme from '@/styles/theme';

interface VoiceGuideModalProps {
  onSelect: (enabled: boolean) => void;
}

const VoiceGuideModal = ({ onSelect }: VoiceGuideModalProps) => (
  <div css={ttsModalStyle}>
    <div css={ttsModalBoxStyle}>
      <div css={ttsModalTextStyle}>
        {'음성 안내를\n사용하시겠습니까?'.split('\n').map((line, idx) =>
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
      <div css={ttsModalBtnWrapStyle}>
        <button css={ttsModalBtnStyle} onClick={() => onSelect(true)}>
          예
        </button>
        <button css={ttsModalBtnStyle} onClick={() => onSelect(false)}>
          아니요
        </button>
      </div>
    </div>
  </div>
);

export default VoiceGuideModal;

const ttsModalStyle = css`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 2001;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ttsModalBoxStyle = css`
  background: #fff;
  border-radius: 16px;
  padding: 32px 28px 24px 28px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
  display: flex;
  max-width: 80%;
  flex-direction: column;
  align-items: center;
`;

const ttsModalTextStyle = css`
  ${theme.typography.modal1};
  color: #222;
  margin-bottom: 24px;
  text-align: center;
`;

const ttsModalBtnWrapStyle = css`
  display: flex;
  gap: 18px;
`;

const ttsModalBtnStyle = css`
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
