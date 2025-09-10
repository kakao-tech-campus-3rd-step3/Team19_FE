/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import theme from '@/styles/theme';

interface Props {
  hasMoreItems: boolean;
  onLoadMore: () => void;
}

const BottomControls = ({ hasMoreItems, onLoadMore }: Props) => {
  return (
    <div css={bottomButtonContainerStyle}>
      {hasMoreItems && (
        <button type="button" css={loadMoreButtonStyle} onClick={onLoadMore}>
          더보기
        </button>
      )}
    </div>
  );
};

export default BottomControls;

const bottomButtonContainerStyle = css`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 18px;
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
  ${theme.typography.button1};
  cursor: pointer;
`;
