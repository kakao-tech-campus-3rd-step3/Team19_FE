/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { IoCaretBack } from 'react-icons/io5';
import { FaUser } from 'react-icons/fa';
import theme from '../../../styles/theme';
import logo from '../../../assets/images/logo.png';

const NavBar = () => {
  return (
    <nav css={navStyle}>
      <button css={iconButtonStyle}>
        <IoCaretBack size={50} color="#ffffffff" />
      </button>
      <button css={titleButtonStyle}>
        <img src={logo} alt="무쉼사 로고" css={logoStyle} />
      </button>
      <button css={iconButtonStyle}>
        <FaUser size={50} color="#ffffffff" />
      </button>
    </nav>
  );
};

export default NavBar;

const navStyle = css`
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  max-width: 500px; // App.css의 루트(#root) 레이아웃 너비와 동일하게 설정하여 좌우가 튀어나가지 않도록 함
  width: 100%;
  height: ${theme.spacing.spacing16};

  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${theme.colors.button.black};
  background-color: ${theme.colors.button.black};
  z-index: 1000;
`;

const iconButtonStyle = css`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const titleButtonStyle = css`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  height: 100%;
`;

const logoStyle = css`
  height: ${theme.spacing.spacing16};
`;
