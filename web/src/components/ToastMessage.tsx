/** @jsxImportSource @emotion/react */
import theme from '@/styles/theme';
import { css } from '@emotion/react';
import { useEffect, useRef, useState } from 'react';

// TODO: 좋아요 버튼 클릭 시 나오는 토스트 메시지 버그 수정
const DISPLAY_MS = 2000;
const EXIT_MS = 300;

const ToastMessage = ({ message }: { message: string }) => {
  const [visible, setVisible] = useState(false); // 렌더링 제어
  const [exiting, setExiting] = useState(false); // 페이드아웃 중 여부
  const [current, setCurrent] = useState<string | null>(null);

  const queueRef = useRef<string[]>([]);
  const displayTimerRef = useRef<number | null>(null);
  const exitTimerRef = useRef<number | null>(null);

  // 새 메시지가 들어오면 큐에 넣고, 현재 표시중이 아니면 재생
  useEffect(() => {
    if (message && message.trim() !== '') {
      queueRef.current.push(message);
      if (!current && !visible) {
        playNext();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

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

    // 표시 시간 후 페이드아웃 시작
    displayTimerRef.current = window.setTimeout(() => {
      setExiting(true);

      // 페이드아웃 끝난 뒤 숨김 처리 및 다음 메시지 재생
      exitTimerRef.current = window.setTimeout(() => {
        setVisible(false);
        setCurrent(null);
        // 약간의 지연 후 다음 메시지 재생 (애니메이션 안정화)
        setTimeout(() => {
          if (queueRef.current.length > 0) playNext();
        }, 50);
      }, EXIT_MS);
    }, DISPLAY_MS);
  };

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      clearTimers();
      queueRef.current = [];
    };
  }, []);

  if (!visible || !current) return null;

  return <div css={[toastStyle, exiting ? toastExitStyle : null]}>{current}</div>;
};

export default ToastMessage;

const toastStyle = css`
  position: fixed;
  bottom: 11vh;
  left: 50%;
  transform: translateX(-50%) translateY(0);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  width: 65%;
  padding: 10px 15px;
  border-radius: 5px;
  white-space: pre-line; /* 줄바꿈 문자 처리 */
  text-align: center;
  ${theme.typography.text2}

  /* 페이드/이동 애니메이션 적용 (초기 상태) */
  opacity: 1;
  transition:
    opacity ${EXIT_MS}ms ease,
    transform ${EXIT_MS}ms ease;
`;

const toastExitStyle = css`
  opacity: 0;
  transform: translateX(-50%) translateY(6px);
`;
