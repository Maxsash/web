export const SESSION_IDLE = 30 * 60000;
const MAX_VISIT = 24 * 60 * 60000;

export function visitSession() {
  let id = "",
    started = 0,
    active = 0;
  return () => {
    const now = Date.now();
    if (!id || now < active || now - active >= SESSION_IDLE || now - started >= MAX_VISIT) {
      id = crypto.randomUUID();
      started = now;
    }
    active = now;
    return id;
  };
}
