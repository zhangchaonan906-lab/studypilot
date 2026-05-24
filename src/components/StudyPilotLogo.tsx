type StudyPilotLogoProps = {
  size?: number;
  showText?: boolean;
  className?: string;
};

export function StudyPilotLogo({
  size = 40,
  showText = false,
  className = "",
}: StudyPilotLogoProps) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-3 ${className}`.trim()}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role={showText ? undefined : "img"}
        aria-label={showText ? undefined : "StudyPilot"}
        aria-hidden={showText ? true : undefined}
        className="shrink-0 drop-shadow-sm"
      >
        <title>StudyPilot cat mark</title>
        <rect
          x="4"
          y="4"
          width="56"
          height="56"
          rx="18"
          fill="#FFFFFF"
          stroke="#E5E7EB"
          strokeWidth="2"
        />
        <path
          d="M17.5 33.5c0-5.5 3.2-10 7.9-12.2l-1.1-7.9c-.1-1 1.1-1.6 1.8-.9l6 6c1.3-.1 2.5-.1 3.8 0l6-6c.7-.7 1.9-.1 1.8.9l-1.1 7.9c4.7 2.2 7.9 6.7 7.9 12.2 0 8.3-6.9 14.8-15.5 14.8h-2c-8.6 0-15.5-6.5-15.5-14.8Z"
          fill="#FACC15"
        />
        <path
          d="M21.9 41.8c2.7 4.8 7.4 7.5 12.1 7.5h2c4.7 0 9.4-2.7 12.1-7.5"
          fill="#F59E0B"
          fillOpacity="0.45"
        />
        <circle cx="28.5" cy="32.5" r="2.1" fill="#1F2937" />
        <circle cx="39.5" cy="32.5" r="2.1" fill="#1F2937" />
        <path
          d="M32.7 37.1h2.6L34 38.5l-1.3-1.4Z"
          fill="#1F2937"
          stroke="#1F2937"
          strokeLinejoin="round"
        />
        <path
          d="M31.2 40.2c1.6 1.4 4 1.4 5.6 0"
          stroke="#92400E"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
        <path
          d="M23 36.9h-5.2M23.2 40.7l-4.7 1.7M45 36.9h5.2M44.8 40.7l4.7 1.7"
          stroke="#92400E"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      {showText ? (
        <span className="truncate font-bold tracking-normal text-ink">StudyPilot</span>
      ) : null}
    </span>
  );
}
