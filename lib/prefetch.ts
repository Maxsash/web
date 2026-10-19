// Reading pages are static and light; home and the sea studio would fetch the WebGL engine.
export const prefetchesAhead = (href: string) => /^\/(blog(?=$|[/?#])|work\/)/.test(href);
