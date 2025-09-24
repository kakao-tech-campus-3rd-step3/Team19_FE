import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const mockReview = {
  reviewId: 101,
  shelterId: 1,
  name: '다솔(아)경로당',
  userId: 1,
  content: '에어컨이 참. 시원.하네요~^^',
  rating: 4,
  photoUrl: 'https://plus.cnu.ac.kr/images/kr/sub01/ci_simbol_v2.png',
  profileImageUrl: 'https://example.com/users/1.jpg',
  createdAt: '2025-08-19T09:00:00Z',
  updatedAt: '2025-08-19T09:00:00Z',
};

export const useEditReview = () => {
  const { id } = useParams();
  const [review, setReview] = useState<typeof mockReview | null>(null);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [photoUrl, setPhotoUrl] = useState('');
  const [showImage, setShowImage] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState('');
  const [onModalConfirm, setOnModalConfirm] = useState<() => void>(() => () => {});
  const [onModalCancel, setOnModalCancel] = useState<() => void>(() => () => {});
  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate();

  // 리뷰 단건 조회 (목데이터)
  useEffect(() => {
    // TODO: 실제 API 연동 시 fetch(`/api/reviews/${id}`)로 변경
    setReview(mockReview);
    setContent(mockReview.content);
    setRating(mockReview.rating);
    setPhotoUrl(mockReview.photoUrl || '');
    setShowImage(!!mockReview.photoUrl);
  }, [id]);

  // 별점 클릭 핸들러
  const handleStarClick = (idx: number) => {
    setRating(idx + 1);
  };

  // 저장 버튼 클릭
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setModalText('저장 하시겠습니까?');
    setOnModalConfirm(() => handleSaveConfirm);
    setOnModalCancel(() => () => setShowModal(false));
    setShowModal(true);
  };

  // 저장 모달에서 "예" 클릭 시
  const handleSaveConfirm = async () => {
    setShowModal(false);

    // TODO: 실제 API 연동 시 아래 fetch 코드 사용
    /*
    await fetch(`/api/reviews/${review?.reviewId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`, // JWT 토큰 필요시
      },
      body: JSON.stringify({
        content,
        // rating,
        // photoUrl,
      }),
    });
    */

    // 목데이터로 동작: 리뷰 상태를 임시로 업데이트
    setReview((prev) =>
      prev
        ? {
            ...prev,
            content,
            // rating,
            // photoUrl,
            updatedAt: new Date().toISOString(),
          }
        : prev,
    );

    // 저장 후 내가 쓴 리뷰 목록 페이지로 이동
    navigate('/myreviews');
  };

  // 사진 삭제 버튼 클릭
  const handleRemoveImage = () => {
    setModalText('사진을 삭제하시겠습니까?');
    setOnModalConfirm(() => () => {
      setShowImage(false);
      setPhotoUrl('');
      setShowModal(false);
    });
    setOnModalCancel(() => () => setShowModal(false));
    setShowModal(true);
  };

  // 이미지 추가 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (showImage && photoUrl) {
      setToastMessage('사진 첨부는 최대 1장만 가능합니다');
      setTimeout(() => setToastMessage(''), 2000);
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
      setShowImage(true);
    }
  };

  const handleAddImageClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    if (showImage && photoUrl) {
      e.preventDefault(); // 파일 선택창이 뜨지 않도록 막음
      setToastMessage('사진 첨부는 최대 1장만 가능합니다');
      setTimeout(() => setToastMessage(''), 2000);
    }
  };

  return {
    review,
    content,
    setContent,
    rating,
    setRating,
    photoUrl,
    setPhotoUrl,
    showImage,
    setShowImage,
    showModal,
    setShowModal,
    modalText,
    setModalText,
    onModalConfirm,
    setOnModalConfirm,
    onModalCancel,
    setOnModalCancel,
    toastMessage,
    setToastMessage,
    handleStarClick,
    handleSave,
    handleSaveConfirm,
    handleRemoveImage,
    handleImageChange,
    handleAddImageClick,
    navigate,
  };
};
