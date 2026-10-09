import { respond } from "@/components/feedback/respond";
import type { Action } from "@/lib/feedback/vocabulary";

export async function copyText(text: string, done: Action = "success") {
  try {
    await navigator.clipboard.writeText(text);
    respond(done);
    return true;
  } catch {
    respond("refusal");
    return false;
  }
}
