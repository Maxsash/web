export const formatIndex = (n: number) => String(n).padStart(2, "0");
export const sentenceCase = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
