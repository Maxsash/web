import { activationFor } from "@/lib/feedback/classify";
import { isAction } from "@/lib/feedback/vocabulary";
import { respond } from "./respond";

const PRESSABLE = "a[href], button:not(:disabled), summary, [data-press]";
const HOVERABLE = `${PRESSABLE}, input[type="range"], [data-hover]`;

const closest = (target: EventTarget | null, selector: string) =>
  target instanceof Element ? target.closest<HTMLElement>(selector) : null;

const activation = (element: HTMLElement) =>
  activationFor({
    tag: element.localName,
    declared: element.dataset.press,
    href: element.getAttribute("href"),
    download: element.hasAttribute("download"),
    newTab: element.getAttribute("target") === "_blank",
    location,
  });

export function listenForActions(signal: AbortSignal) {
  let hovered: Element | null = null;
  let pressed: Element | null = null;
  let keyboard = false;
  let selection = "";
  const on = <K extends keyof DocumentEventMap>(
    type: K,
    listener: (event: DocumentEventMap[K]) => void,
  ) => document.addEventListener(type, listener, { capture: true, passive: true, signal });

  on("pointerover", (event) => {
    if (event.pointerType !== "mouse") return;
    const element = closest(event.target, HOVERABLE);
    if (element === hovered) return;
    hovered = element;
    const action = element?.dataset.hover ?? "hover";
    if (element && isAction(action)) respond(action);
  });
  on("pointerdown", (event) => {
    keyboard = false;
    const element = event.button === 0 ? closest(event.target, PRESSABLE) : null;
    pressed = element && activation(element) === "press" ? element : null;
    if (pressed) respond("press");
  });
  on("click", (event) => {
    const element = closest(event.target, PRESSABLE);
    const action = element && activation(element);
    if (!action) return;
    if (action === "press" && element === pressed) pressed = null;
    else respond(action);
  });
  on("keydown", () => {
    keyboard = true;
    pressed = null;
  });
  on("focusin", (event) => {
    if (keyboard && event.target instanceof Element && event.target.matches(":focus-visible"))
      respond("focus");
  });
  on("toggle", (event) => {
    if (event.target instanceof HTMLDetailsElement) respond(event.target.open ? "unfold" : "fold");
  });
  on("copy", () => respond("copy"));
  const selected = () => {
    const text = getSelection()?.toString().trim() ?? "";
    if (text && text !== selection) respond("select");
    selection = text;
  };
  on("pointerup", selected);
  on("keyup", (event) => {
    if (event.shiftKey) selected();
  });
}
