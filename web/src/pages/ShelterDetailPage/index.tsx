/** @jsxImportSource @emotion/react */
import { useParams } from 'react-router-dom';

const ShelterDetailPage = () => {
  const { id } = useParams(); // URL에서 쉼터 ID를 가져옴

  return (
    <div>
      쉼터 상세 페이지
      <br />
      쉼터 ID: {id}
      <br />
      여기에서 쉼터 상세 정보를 표시합니다.
    </div>
  );
};

export default ShelterDetailPage;
