/** 水平フリックの方向（距離・縦横比で判定） */
export function getSwipeDirection(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  minDistance = 50,
): 'prev' | 'next' | null {
  const dx = endX - startX;
  const dy = endY - startY;

  if (Math.abs(dx) < minDistance || Math.abs(dx) < Math.abs(dy)) {
    return null;
  }

  return dx < 0 ? 'next' : 'prev';
}
