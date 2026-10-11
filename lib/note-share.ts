export const noteShareImage = (slug: string, alt: string) => ({
  url: `/images/notebook/${slug}.webp`,
  width: 1200,
  height: 630,
  alt,
});
