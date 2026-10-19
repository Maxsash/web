export const noteShareImage = (slug: string, alt: string) => ({
  url: `/images/cards/${slug}.jpg`,
  width: 1200,
  height: 630,
  alt,
});
