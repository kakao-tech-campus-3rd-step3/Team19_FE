/** @jsxImportSource @emotion/react */
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { css } from '@emotion/react';
import { FaArrowUp } from 'react-icons/fa';

const ScrollToTopButton = () => {
  const [show, setShow] = useState(false);
  const [hasScroll, setHasScroll] = useState(false);
  const location = useLocation();

  // 스크롤 여부 체크 함수
  const checkScroll = () => {
    setHasScroll(document.documentElement.scrollHeight > window.innerHeight);
  };

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 100);
      checkScroll();
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    // 마운트 시 한 번 체크
    checkScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  // location이 바뀔 때마다 스크롤 맨 위로 & 상태 초기화 & DOM 업데이트 후 스크롤 여부 재확인
  useEffect(() => {
    window.scrollTo({ top: 0 });
    setShow(false);
    setHasScroll(false); // 상태 초기화
    setTimeout(checkScroll, 0); // DOM 업데이트 후 스크롤 여부 재확인
  }, [location.pathname]);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
