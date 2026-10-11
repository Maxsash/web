export const formatIndex = (n: number) => String(n).padStart(2, "0");
const WORDS_PER_MINUTE = 200;

export const readingMinutes = (text: string) =>
  Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / WORDS_PER_MINUTE));
export const sentenceCase = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
