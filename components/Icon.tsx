/* A small stroked icon set drawn on one 24px grid with a single 1.75 weight and
 * round joins, so it sits at the same optical density as the mark's terminals.
 *
 * The GitHub octocat is the one exception: brand marks are drawn as solids and
 * redrawing it as a stroke would misrepresent it.
 */

export type IconName =
  "arrow" | "compass" | "github" | "globe" | "mail" | "resume" | "sextant" | "writing";

const STROKED: Record<Exclude<IconName, "github">, React.ReactNode> = {
  // Arrow leaving up and to the right: every outbound link uses this.
  arrow: (
    <>
      <path d="M7.5 16.5 16.5 7.5" />
      <path d="M9.25 7.5h7.25v7.25" />
    </>
  ),
  // Compass rose, for orientation and the "about" section.
  compass: (
    <>
      <circle cx="12" cy="12" r="8.25" />
      <path d="m15.2 8.8-1.9 4.5-4.5 1.9 1.9-4.5z" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M3.75 12h16.5" />
      <path d="M12 3.75c2.1 2.25 3.15 5 3.15 8.25S14.1 18 12 20.25C9.9 18 8.85 15.25 8.85 12S9.9 6 12 3.75Z" />
    </>
  ),
  mail: (
    <>
      <rect x="3.25" y="5.25" width="17.5" height="13.5" rx="2.5" />
      <path d="m4.5 8 6.2 4.4a2.25 2.25 0 0 0 2.6 0L19.5 8" />
    </>
  ),
  // A sheet with a turned corner, for the resume.
  resume: (
    <>
      <path d="M13.5 3.25H7a2 2 0 0 0-2 2v13.5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.75z" />
      <path d="M13.5 3.25v4.25a1.25 1.25 0 0 0 1.25 1.25H19" />
      <path d="M8.75 13h6.5M8.75 16.5h4.25" />
    </>
  ),
  // A sextant arc: the instrument that turns angles into position.
  sextant: (
    <>
      <path d="M4.5 19.5 12 4.75l7.5 14.75z" />
      <path d="M7.4 13.75a8.5 8.5 0 0 0 9.2 0" />
      <path d="M12 4.75 9.2 17.1" />
    </>
  ),
  // A nib, for writing.
  writing: (
    <>
      <path d="M4.25 19.75 5.5 15.5 15.9 5.1a2.3 2.3 0 0 1 3.25 3.25L8.75 18.75z" />
      <path d="m14.25 6.75 3.25 3.25" />
      <path d="M5.5 15.5 8.75 18.75" />
    </>
  ),
};

const GITHUB_MARK =
  "M12 2.25a9.75 9.75 0 0 0-3.08 19c.49.09.67-.21.67-.47v-1.83c-2.71.59-3.28-1.16-3.28-1.16-.45-1.13-1.1-1.43-1.1-1.43-.9-.61.07-.6.07-.6 1 .07 1.52 1.02 1.52 1.02.88 1.52 2.32 1.08 2.89.83.09-.64.35-1.08.63-1.33-2.17-.24-4.45-1.08-4.45-4.81 0-1.07.38-1.94 1.01-2.62-.1-.25-.44-1.24.1-2.59 0 0 .82-.26 2.7 1a9.3 9.3 0 0 1 4.91 0c1.87-1.26 2.7-1 2.7-1 .53 1.35.2 2.34.1 2.59.63.68 1 1.55 1 2.62 0 3.74-2.28 4.57-4.46 4.81.35.3.66.9.66 1.81v2.69c0 .26.18.57.68.47A9.75 9.75 0 0 0 12 2.25Z";

type IconProps = {
  name: IconName;
  className?: string;
  /** px; the grid is designed at 24 and holds down to about 16. */
  size?: number;
};

export default function Icon({ name, className, size = 20 }: IconProps) {
  const shared = {
    className,
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
    focusable: false as const,
  };

  if (name === "github") {
    return (
      <svg {...shared} fill="currentColor">
        <path d={GITHUB_MARK} />
      </svg>
    );
  }

  return (
    <svg
      {...shared}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {STROKED[name]}
    </svg>
  );
}
