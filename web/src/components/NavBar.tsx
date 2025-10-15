/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { IoCaretBack } from 'react-icons/io5';
import { FaUser } from 'react-icons/fa';
import theme from '@/styles/theme';
import logo from '@/assets/images/logo.png';
import { useNavigate, useLocation } from 'react-router-dom';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 현재 경로 확인

  const handleLogoClick = () => {
    if (location.pathname === '/') return; // 현재 페이지가 홈페이지일 경우 클릭 막음
    navigate('/'); // 홈페이지가 아닐 경우 홈페이지로 이동
  };

  const handleBackClick = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  const handleUserClick = () => {
    // TODO: 로그인 검증 필요. 추후 추가 해야함!!!!!
    navigate('/mypage');
  };

  return (
    <nav css={navStyle}>
      {/* 홈페이지인 경우 버튼을 숨기고 공간은 유지 */}
      <button
        css={[iconButtonStyle, location.pathname === '/' && hiddenStyle]}
        onClick={handleBackClick}
      >
        <IoCaretBack size={50} color="#ffffffff" />
      </button>
      <button css={titleButtonStyle} onClick={handleLogoClick}>
        <img src={logo} alt="무쉼사 로고" css={logoStyle} />
      </button>
      <button css={iconButtonStyle} onClick={handleUserClick}>
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

const hiddenStyle = css`
  visibility: hidden; /* 버튼을 숨기지만 공간은 유지 */
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
