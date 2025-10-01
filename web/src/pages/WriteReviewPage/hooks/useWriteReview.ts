import { postReview } from '@/api/reviewApi';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const useWriteReview = () => {
  const { shelterId } = useParams(); // 쉼터 id 파라미터로 받기
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [photoUrl, setPhotoUrl] = useState('');
  const [showImage, setShowImage] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState('');
  const [onModalConfirm, setOnModalConfirm] = useState<() => void>(() => () => {});
  const [onModalCancel, setOnModalCancel] = useState<() => void>(() => () => {});
  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate();

  // 리뷰 작성 mutation
  const { mutate: writeReviewMutate, isPending } = useMutation({
    mutationFn: () => postReview(Number(shelterId), { content, rating, photoUrl }),
    onSuccess: () => {
      navigate('/shelter-detail/' + shelterId);
    },
    onError: () => {
      setToastMessage('리뷰 작성에 실패했습니다');
    },
  });

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
    writeReviewMutate();
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
      e.target.value = ''; //input value 초기화 (중복 선택 가능)
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
      setShowImage(true);
      e.target.value = ''; // input value 초기화 (중복 선택 가능)
    }
  };

  const handleAddImageClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    if (showImage && photoUrl) {
      e.preventDefault();
      setToastMessage('사진 첨부는 최대 1장만 가능합니다');
      setTimeout(() => setToastMessage(''), 2000);
    }
  };

  return {
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
    shelterId,
    isPending,
  };
};
