/** @jsxImportSource @emotion/react */
import theme from '@/styles/theme';
import { css } from '@emotion/react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// 표시 시간 및 간격 설정
const DISPLAY_MS = 3000;
const EXIT_MS = 600; // 페이드아웃 시간
const INTER_MESSAGE_GAP_MS = 200; // 연속 메시지 사이 간격

const ToastMessage = ({ message }: { message: string }) => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);

  const queueRef = useRef<string[]>([]);
  const displayTimerRef = useRef<number | null>(null);
  const exitTimerRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (displayTimerRef.current !== null) {
      clearTimeout(displayTimerRef.current);
      displayTimerRef.current = null;
    }
    if (exitTimerRef.current !== null) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  };

  const playNext = () => {
    clearTimers();
    const next = queueRef.current.shift() ?? null;
    if (!next) {
      setCurrent(null);
      setVisible(false);
      setExiting(false);
      return;
    }

    setCurrent(next);
    setExiting(false);
    setVisible(true);

    displayTimerRef.current = window.setTimeout(() => {
      setExiting(true);
      exitTimerRef.current = window.setTimeout(() => {
        setVisible(false);
        setCurrent(null);
        setTimeout(() => {
          if (queueRef.current.length > 0) playNext();
        }, INTER_MESSAGE_GAP_MS);
      }, EXIT_MS);
    }, DISPLAY_MS);
  };

  // 새 메시지 큐잉 (중복도 허용 — 모든 메시지를 순차적으로 표시)
  useEffect(() => {
    if (message && message.trim() !== '') {
      queueRef.current.push(message);
      if (!current && !visible) {
        playNext();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      clearTimers();
      queueRef.current = [];
    };
  }, []);

  if (!visible || !current) return null;

  const toastElement = <div css={[toastStyle, exiting ? toastExitStyle : null]}>{current}</div>;
  return createPortal(toastElement, document.body);
};

export default ToastMessage;

const toastStyle = css`
  position: fixed;
  bottom: 11vh;
  left: 50%;
  transform: translateX(-50%) translateY(0);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  width: 60%;
  max-width: 720px;
  padding: 10px 15px;
  border-radius: 5px;
  white-space: pre-line;
  text-align: center;
  ${theme.typography.text2}

  opacity: 1;
  transition:
    opacity ${EXIT_MS}ms ease,
    transform ${EXIT_MS}ms ease;

  z-index: 2147483647;
  pointer-events: none; /* 사용자 입력 비활성화 */
`;

const toastExitStyle = css`
  opacity: 0;
  transform: translateX(-50%) translateY(6px);
`;
