const SHOWN_MS = 4500;

let notice = "";
let hide = 0;
const listeners = new Set<() => void>();

const publish = (text: string) => {
  notice = text;
  listeners.forEach((listener) => listener());
};

export function announce(text: string) {
  clearTimeout(hide);
  publish(text);
  hide = window.setTimeout(() => publish(""), SHOWN_MS);
}

export function subscribeNotice(listener: () => void) {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

export const currentNotice = () => notice;
