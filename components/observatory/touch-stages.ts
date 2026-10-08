const MIN_SWIPE_PX = 35;
const MIN_TRACKED_PX = 4;
const VERTICAL_DOMINANCE = 1.25;

export type TouchGesture = { x: number; y: number; dx: number; dy: number; consumed: boolean };

export const beginGesture = (x: number, y: number): TouchGesture => ({
  x,
  y,
  dx: 0,
  dy: 0,
  consumed: false,
});

export function trackGesture(
  gesture: TouchGesture,
  x: number,
  y: number,
  stage: { index: number; count: number },
) {
  gesture.dx = x - gesture.x;
  gesture.dy = y - gesture.y;
  if (Math.abs(gesture.dy) <= Math.abs(gesture.dx) || Math.abs(gesture.dy) < MIN_TRACKED_PX)
    return false;
  return (gesture.dy < 0 && stage.index < stage.count - 1) || (gesture.dy > 0 && stage.index > 0);
}

export function swipeDirection(gesture: TouchGesture) {
  const swiped =
    gesture.consumed &&
    Math.abs(gesture.dy) >= MIN_SWIPE_PX &&
    Math.abs(gesture.dy) > Math.abs(gesture.dx) * VERTICAL_DOMINANCE;
  return swiped ? (gesture.dy < 0 ? 1 : -1) : 0;
}
