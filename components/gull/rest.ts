export const NIGHT_REST_AFTER = 12;

type Attention = { night: boolean; since: number; idle: number; engaged: boolean };

export const shouldRest = ({ night, since, idle, engaged }: Attention) =>
  idle >= 3 || (night && since >= NIGHT_REST_AFTER && !engaged);
