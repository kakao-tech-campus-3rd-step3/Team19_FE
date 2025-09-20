export async function toggleWish({
  shelterId,
  userId,
  isFavorite,
}: {
  shelterId: number | string;
  userId: number;
  isFavorite: boolean;
}) {
  if (isFavorite) {
    // 찜 삭제 (DELETE)
    const res = await fetch(`/api/users/${userId}/wishes/${shelterId}`, {
      method: 'DELETE',
    });
    if (res.status === 204) {
      return { success: true, message: '찜 목록에서\n삭제되었습니다' };
    }
    return { success: false, message: '삭제에 실패했습니다' };
  } else {
    // 찜 추가 (POST)
    const res = await fetch(`/api/users/${userId}/wishes/${shelterId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shelterId, userId }),
    });
    if (res.ok) {
      return { success: true, message: '찜 목록에\n추가되었습니다' };
    }
    return { success: false, message: '추가에 실패했습니다' };
  }
}
