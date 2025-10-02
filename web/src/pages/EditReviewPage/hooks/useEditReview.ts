import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';

// TODO: 실제 API 연동 시 아래 import 사용
// import { getReview, patchReview } from '@/api/reviewApi';

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
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // 리뷰 단건 조회 (목데이터)
  useEffect(() => {
    setReview(mockReview);
    setContent(mockReview.content);
    setRating(mockReview.rating);
    setPhotoUrl(mockReview.photoUrl || '');
    setShowImage(!!mockReview.photoUrl);
  }, [id]);

  /*TODO: 실제 API 연동 시 에러 처리
  // 리뷰 단건 조회
  const { data: review, error: reviewError, isLoading } = useQuery({
    queryKey: ['review', id],
    queryFn: () => getReview(Number(id)),
    enabled: !!id,
    // TODO: 실제 API 연동 시 아래 onError에서 공통 에러 응답 처리
    /*
    onError: (err: any) => {
      // 공통 에러 응답이면 에러 페이지로 이동
      if (err && err.status && err.error && err.message) {
        navigate('/error', { state: err });
      }
    },
    */

  // TODO: 실제 API 연동 시 아래 코드로 교체
  /*
  useEffect(() => {
    async function fetchReview() {
      const data = await getReview(Number(id));
      if (data) {
        setReview(data);
        setContent(data.content);
        setRating(data.rating);
        setPhotoUrl(data.photoUrl || '');
        setShowImage(!!data.photoUrl);
      }
    }
    fetchReview();
  }, [id]);
  */

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

  // TODO: 실제 API 연동 시 useMutation 사용
  const patchReviewMutation = useMutation({
    // TODO: api 연동 시 params 파라미터 추가('_' 제거)
    mutationFn: async (_params: { reviewId: number; content: string }) => {
      // TODO: 실제 연동 시 patchReview(reviewId, { content, ... }) 사용
      // await patchReview(params.reviewId, { content: params.content });
      // 개발 중에는 성공만 반환
      return Promise.resolve();
    },
    onError: (error: any) => {
      setErrorMessage(error?.message || '리뷰 수정 중 오류가 발생했습니다.');
    },
    onSuccess: () => {
      // 성공 시 이동
      navigate('/myreviews');
    },
  });

  // 저장 모달에서 "예" 클릭 시
  const handleSaveConfirm = async () => {
    setShowModal(false);

    // TODO: 실제 API 연동 시 아래 코드로 교체
    patchReviewMutation.mutate({ reviewId: Number(id), content });
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
      e.target.value = ''; //input value 초기화 (중복 선택 가능)

      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
      setShowImage(true);
      e.target.value = ''; //input value 초기화 (중복 선택 가능)
    }
  };

  const handleAddImageClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    if (showImage && photoUrl) {
      e.preventDefault(); // 파일 선택창이 뜨지 않도록 막음
      setToastMessage('사진 첨부는 최대 1장만 가능합니다');
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
    errorMessage,
    patchReviewMutation,
    handleStarClick,
    handleSave,
    handleSaveConfirm,
    handleRemoveImage,
    handleImageChange,
    handleAddImageClick,
    navigate,
  };
};
