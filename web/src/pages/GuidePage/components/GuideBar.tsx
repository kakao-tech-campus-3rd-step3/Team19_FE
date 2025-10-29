/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import theme from '@/styles/theme';
import { useEffect } from 'react';

export interface GuideBarProps {
  message: string | null;
  hasArrived?: boolean;
  onArrivalConfirm?: () => void;
  ttsEnabled?: boolean; // 음성안내 활성화 여부
}

export const GuideBar = ({ message, hasArrived, onArrivalConfirm, ttsEnabled }: GuideBarProps) => {
  // Web Speech API로 안내 메시지 읽어주기
  useEffect(() => {
    if (!message || !ttsEnabled) return;
    // 음성 합성 객체 생성
    const utter = new window.SpeechSynthesisUtterance(message);
    utter.lang = 'ko-KR'; // 한국어
    window.speechSynthesis.cancel(); // 이전 음성 중단
    window.speechSynthesis.speak(utter);
    // 언마운트 시 음성 중단
    return () => window.speechSynthesis.cancel();
  }, [message, ttsEnabled]);

  return (
    <div css={guidanceBarStyle}>
      <div css={guidanceContentStyle}>
        <div css={guidanceTextStyle}>
          <span css={guidanceTextInnerStyle}>{message}</span>
        </div>
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
  bottom: 2rem;
  background: ${theme.colors.button.black};
  color: ${theme.colors.text.white};
  border-radius: 12px;
  padding: 8px 16px; /* 세로 패딩을 줄여 한 줄일 때 하단 여백 제거 */
  box-sizing: border-box;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  display: flex; /* 내부 내용 수직/수평 중앙 정렬을 위해 flex 사용 */
  align-items: center;
  justify-content: center;
`;

const guidanceContentStyle = css`
  display: flex;
  flex-direction: column; /* 버튼을 메시지 아래로 정렬 */
  align-items: center; /* 수직 중앙 정렬 */
  justify-content: center; /* 수평 중앙 정렬 */
  gap: 12px;
  width: 100%;
`;

const guidanceTextStyle = css`
  ${theme.typography.guide1}
  /* 가로/세로 중앙 정렬을 보장하기 위해 flex로 감싸고 고정 최소 높이를 둠(2줄 기준) */
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex: 1 1 auto;
  min-width: 0;
  /* 한 줄일 때도 2줄 분량의 높이를 유지(글자 크기에 따라 em 단위로 계산) */
  line-height: 1.3;
  min-height: calc(1.3em * 2); /* 2줄 기준 높이 고정 */
`;

/* 실제 텍스트 클램프는 내부 span에서 처리 */
const guidanceTextInnerStyle = css`
  display: -webkit-box;
  -webkit-line-clamp: 4; /* 최대 4줄 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-line;
  word-break: keep-all;
  overflow-wrap: anywhere;
  width: 100%;
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
  margin-left: 0;
  margin-top: 8px; /* 메시지와 버튼 사이 여유 */

  &:hover {
    background: #b71c1c;
  }

  &:active {
    background: #d32f2f;
  }
`;
