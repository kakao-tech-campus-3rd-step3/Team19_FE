/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import theme from '../../styles/theme';

const FindSheltersPage = () => {
  return (
    <div css={containerStyle}>
      <p>가까운 쉼터 찾기 페이지</p>
    </div>
  );
};

export default FindSheltersPage;

const containerStyle = css`
  position: relative;
  height: calc(100vh - ${theme.spacing.spacing16});
  padding-top: ${theme.spacing.spacing16};
  margin: 0 auto;
  background: #3bd8d0ff;
`;
