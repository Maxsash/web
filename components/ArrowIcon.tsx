type ArrowIconProps = {
  size?: number;
};

export default function ArrowIcon({ size = 20 }: ArrowIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M7.5 16.5 16.5 7.5" />
      <path d="M9.25 7.5h7.25v7.25" />
    </svg>
  );
}
