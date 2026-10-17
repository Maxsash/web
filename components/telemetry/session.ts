export const SESSION_IDLE = 30 * 60000;
const MAX_VISIT = 24 * 60 * 60000;

export function visitSession() {
  let id = "",
    started = 0,
    active = 0;
  return () => {
    const now = Date.now();
    if (!id || now < active || now - active >= SESSION_IDLE || now - started >= MAX_VISIT) {
      const random = crypto.randomUUID().replaceAll("-", "");
      const stamp = now.toString(16).padStart(12, "0");
      id = `${stamp.slice(0, 8)}-${stamp.slice(8)}-7${random.slice(13, 16)}-${random.slice(16, 20)}-${random.slice(20)}`;
      started = now;
    }
    active = now;
    return id;
  };
}

let visit = visitSession();
let replaySession: string | null = null;
export const currentVisit = () => replaySession ?? visit();
export function setReplaySession(id: string | null) {
  replaySession = id;
}
export function resetVisit() {
  replaySession = null;
  visit = visitSession();
}
