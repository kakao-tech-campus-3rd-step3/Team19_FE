/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import theme from '@/styles/theme';
import { FaArrowUp } from 'react-icons/fa';

interface Props {
  hasMoreItems: boolean;
  onLoadMore: () => void;
  showScrollToTop: boolean;
  onScrollToTop: () => void;
}

const BottomControls = ({ hasMoreItems, onLoadMore, showScrollToTop, onScrollToTop }: Props) => {
  return (
    <div css={bottomButtonContainerStyle}>
      {hasMoreItems ? (
        <button type="button" css={loadMoreButtonStyle} onClick={onLoadMore}>
          더보기
        </button>
      ) : (
        <div css={emptyDivStyle} /> // '더보기' 버튼이 없을 때 레이아웃 유지를 위한 빈 div
      )}

      {/* '맨 위로' 버튼을 조건부로 렌더링 */}
      {showScrollToTop && (
        <button type="button" css={scrollToTopButtonStyle} onClick={onScrollToTop}>
          <FaArrowUp size={40} color="#ffffffff" />
        </button>
      )}
    </div>
  );
};

export default BottomControls;

const bottomButtonContainerStyle = css`
  display: flex;
  justify-content: space-between; // 양쪽 끝으로 버튼을 배치
  align-items: center;
  padding: 0 18px; // 좌우 여백
  margin-bottom: 19vh;
`;

// '맨 위로 가기' 버튼 스타일
const scrollToTopButtonStyle = css`
  position: fixed; // 뷰포트 기준으로 고정
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.5); // 반투명한 검정 배경
  backdrop-filter: blur(4px); // 배경 흐림 효과
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 1000; // 다른 요소 위에 표시되도록 설정
`;

// '더보기' 버튼 스타일
const loadMoreButtonStyle = css`
  width: 50%;
  margin: 4px auto 0;
  padding: 6px 20px;
  border: 1px solid rgba(0, 0, 0, 0.52);
  border-radius: 8px;
  background-color: ${theme.colors.button.black};
  color: ${theme.colors.text.white};
  font-size: ${theme.typography.title1Bold.fontSize};
  font-weight: ${theme.typography.title1Bold.fontWeight};
  cursor: pointer;
`;
const emptyDivStyle = css`
  margin-bottom: 50px;
`;
