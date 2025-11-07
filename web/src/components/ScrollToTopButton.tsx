/** @jsxImportSource @emotion/react */
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { css } from '@emotion/react';
import { FaArrowUp } from 'react-icons/fa';

const ScrollToTopButton = () => {
  const [show, setShow] = useState(false);
  const [hasScroll, setHasScroll] = useState(false);
  const location = useLocation();

  // 스크롤 컨테이너 결정 (data-scroll-container 우선)
  const getContainer = (): HTMLElement | Window => {
    const el = document.querySelector('[data-scroll-container]') as HTMLElement | null;
    return el ?? window;
  };

  // 타입 가드: Window인지 검사
  const isWindow = (c: unknown): c is Window => {
    return typeof c === 'object' && c !== null && (c as any) === window;
  };

  // 타입 가드: HTMLElement인지 검사
  const isElement = (c: unknown): c is HTMLElement => {
    return typeof c === 'object' && c !== null && 'scrollTop' in (c as any);
  };

  // 스크롤 여부 체크 함수 (컨테이너 대응)
  const checkScroll = (container: HTMLElement | Window = getContainer()) => {
    if (isWindow(container)) {
      setHasScroll(document.documentElement.scrollHeight > window.innerHeight);
      setShow(window.scrollY > 100);
    } else if (isElement(container)) {
      setHasScroll(container.scrollHeight > container.clientHeight);
      setShow((container.scrollTop || 0) > 100);
    } else {
      // 안전 fallback
      setHasScroll(false);
      setShow(false);
    }
  };

  useEffect(() => {
    const container = getContainer();
    const handleScroll = () => checkScroll(container);

    // attach appropriate listener
    if (isWindow(container)) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleScroll);
    } else {
      container.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleScroll); // 부모 크기 변동에 대비
    }

    // 초기 체크
    checkScroll(container);

    return () => {
      if (isWindow(container)) {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      } else {
        container.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // location 변경 시 스크롤 맨 위로 & 상태 초기화
  useEffect(() => {
    const container = getContainer();
    if (isWindow(container)) {
      window.scrollTo({ top: 0 });
    } else if (isElement(container)) {
      // Element.scrollTo는 DOM lib에 정의되어 있으나 안전하게 any로 호출
      (container as any).scrollTo?.({ top: 0, behavior: 'auto' as ScrollBehavior });
    }
    setShow(false);
    setHasScroll(false);
    setTimeout(() => checkScroll(container), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleScrollToTop = () => {
    const container = getContainer();
    if (isWindow(container)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (isElement(container)) {
      (container as any).scrollTo?.({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {show && (
        <button type="button" css={scrollToTopButtonStyle} onClick={handleScrollToTop}>
          <FaArrowUp size={40} color="#fff" />
        </button>
      )}
      {hasScroll && <div css={bottomSpacerStyle} />}
    </>
  );
};

export default ScrollToTopButton;

const scrollToTopButtonStyle = css`
  position: fixed;
  bottom: calc(2rem + env(safe-area-inset-bottom));
  right: 24px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 1000;
  border: none;
`;

const bottomSpacerStyle = css`
  height: 60px;
  width: 100%;
`;
