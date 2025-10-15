// src/components/ScrollToTop.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    const body = document.body;
    const updateOverflow = () => {
      if (body.scrollHeight <= body.clientHeight + 1) {
        body.style.overflow = 'hidden';
      } else {
        body.style.overflow = '';
      }
    };

    updateOverflow();

    // body 변화 감지
    // TODO: 더보기 버튼 클릭 시 DOM 변화가 생기므로 이를 감지하여 overflow 업데이트 -> 근데 확인 필요함...!
    const observer = new MutationObserver(updateOverflow);
    observer.observe(body, { childList: true, subtree: true });

    // window 크기 변경 감지
    window.addEventListener('resize', updateOverflow);

    return () => {
      body.style.overflow = '';
      observer.disconnect();
      window.removeEventListener('resize', updateOverflow);
    };
  }, [pathname]);

  return null;
};

export default ScrollToTop;
