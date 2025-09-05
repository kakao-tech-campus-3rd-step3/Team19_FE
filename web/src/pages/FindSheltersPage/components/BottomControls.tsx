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
        <div /> // '더보기' 버튼이 없을 때 레이아웃 유지를 위한 빈 div
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
  margin-top: 12px; // 리스트와의 간격
`;

// '맨 위로 가기' 버튼 스타일
const scrollToTopButtonStyle = css`
  background: ${theme.colors.button.black};
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  margin-bottom: 10px;
`;

// '더보기' 버튼 스타일
const loadMoreButtonStyle = css`
  width: 40%;
  margin: 12px auto 0;
  padding: 6px 20px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  background-color: ${theme.colors.button.black};
  color: ${theme.colors.text.white};
  font-size: ${theme.typography.body2Bold.fontSize};
  font-weight: ${theme.typography.body2Bold.fontWeight};
  cursor: pointer;
`;
