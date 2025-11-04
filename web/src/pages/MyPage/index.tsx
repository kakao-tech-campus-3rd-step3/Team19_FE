/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FaRegCommentDots, FaRegEdit, FaHeart } from 'react-icons/fa';
import { useState } from 'react';
import NoProfile from '@/assets/images/NoProfile.png';
import { theme } from '@/styles/theme';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/api/userApi';
import { useQueryClient } from '@tanstack/react-query';
import { useUser } from './hooks/useUser';

const MyPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imgError, setImgError] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { user, error, isLoading } = useUser();

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      // 사용자 캐시 초기화
      queryClient.clear();
      // 인증 페이지로 이동
      navigate('/auth');
    } catch (err) {
      console.error('로그아웃 실패:', err);
      alert('로그아웃에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setLoggingOut(false);
    }
  };

  if (isLoading) return <div css={container}>로딩 중...</div>;

  if (error)
    return (
      <div css={container}>
        <div css={errorMsgStyle}>사용자 정보를 불러오지 못했습니다.</div>
      </div>
    );

  if (!user) return <div css={container}>사용자 정보가 없습니다.</div>;

  const profileImgUrl = !user.profileImageUrl || imgError ? NoProfile : user.profileImageUrl;

  const iconStyle = css`
    font-size: ${theme.typography.my3.fontSize};
    margin-right: 8px;
    vertical-align: middle;
  `;

  return (
    <div css={container}>
      {/* 마이페이지 타이틀 */}
      <div css={mypageTitle}>마이페이지</div>

      {/* 프로필 */}
      <div css={profileBox}>
        <img src={profileImgUrl} alt="프로필" css={profileImg} onError={() => setImgError(true)} />
      </div>
      <div css={userNameRow}>
        <span css={userName}>{user.nickname}</span>
        <FaRegEdit css={editIcon} onClick={() => navigate('/edit-profile')} />
      </div>

      {/* 메뉴 버튼들 */}
      <div css={menuBox}>
        <button css={menuBtn} onClick={() => navigate('/wishlist')}>
          <FaHeart color="red" css={iconStyle} />찜 목록
        </button>
        <button css={menuBtn} onClick={() => navigate('/myreviews')}>
          <FaRegCommentDots color="#444" css={iconStyle} />
          내가 쓴 리뷰 목록
        </button>
        <button css={menuBtn}>앱 푸쉬 알림 ON/OFF</button>
      </div>

      <button css={logoutBtn} onClick={handleLogout} disabled={loggingOut}>
        {loggingOut ? '로그아웃 중...' : '로그아웃'}
      </button>
    </div>
  );
};

export default MyPage;

// 스타일
const container = css`
  background: #ffffffff;
  font-family: 'Pretendard', sans-serif;
  height: calc(
    100vh - ${theme.spacing.spacing16} - env(safe-area-inset-bottom) - env(safe-area-inset-top)
  );
  padding-top: calc(${theme.spacing.spacing16} + env(safe-area-inset-top));
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const mypageTitle = css`
  ${theme.typography.my1};
  margin-top: 16px;
  padding-bottom: 24px;
  text-align: center;
  text-shadow: 2px 2px 6px #bbb;
`;

const profileBox = css`
  display: flex;
  justify-content: center;
`;

const profileImg = css`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #eee;
  background: #fafafa;
`;

const userNameRow = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-top: 3%;
`;

const userName = css`
  ${theme.typography.my2};
`;

const editIcon = css`
  font-size: 2rem;
  color: #222;
  cursor: pointer;
`;

const menuBox = css`
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: center;
  padding-top: 5%;
  padding-bottom: 5%;
`;

const menuBtn = css`
  width: 90%;
  background: ${theme.colors.button.gray100};
  border: none;
  border-radius: 12px;
  ${theme.typography.my3};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #222;
  cursor: pointer;
`;

const logoutBtn = css`
  width: 90%;
  margin-top: auto;
  margin-bottom: calc(env(safe-area-inset-bottom) + 4px);
  margin-left: auto;
  margin-right: auto;
  background: #111;
  color: #fff;
  border: none;
  border-radius: 12px;
  ${theme.typography.my4};
  cursor: pointer;
`;

const errorMsgStyle = css`
  color: red;
  text-align: center;
  margin-top: 24px;
`;
