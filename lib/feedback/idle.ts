export const IDLE_AFTER = [10, 30, 60];

export const idleLevel = (seconds: number) => IDLE_AFTER.filter((after) => seconds >= after).length;
