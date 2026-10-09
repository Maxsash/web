export const PACE = { idle: [1, 0.6, 0.4, 0.3], wind: 0.15, gust: 1.6, settle: 1.5 };

export const paceTarget = (idle: number, screensPerSecond: number) =>
  Math.min(
    PACE.gust,
    PACE.idle[Math.min(idle, PACE.idle.length - 1)] + PACE.wind * screensPerSecond,
  );

export const easePace = (pace: number, target: number, seconds: number) =>
  pace + (target - pace) * (1 - Math.exp(-seconds * PACE.settle));
