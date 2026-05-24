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
        <rect x="3" y="3" width="58" height="58" rx="18" fill="url(#studypilot-logo-bg)" />
        <path
          d="M17 21c5.5-2.4 10.5-1.8 15 1.8v24.4c-4.5-3.6-9.5-4.2-15-1.8V21Z"
          fill="url(#studypilot-logo-page-left)"
          fillOpacity="0.95"
        />
        <path
          d="M32 22.8c4.5-3.6 9.5-4.2 15-1.8v24.4c-5.5-2.4-10.5-1.8-15 1.8V22.8Z"
          fill="url(#studypilot-logo-page-right)"
          fillOpacity="0.88"
        />
        <path
          d="M19 29.5c4.1-1.1 7.6-.6 10.7 1.8M19 37c4.1-1.1 7.6-.6 10.7 1.8M34.4 31.3c2.5-1.7 5.5-2.4 9.4-1.8"
          stroke="#C7D2FE"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M20 48c8.7 5.3 22.5 4.8 28-1.5"
          stroke="#DBEAFE"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M18.5 38.5c5.2-8.4 14-12.2 26.2-11.5"
          stroke="#A5B4FC"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="1 6"
        />
        <path
          d="M42.8 16.6 51 37.8 39.4 31l-10.9 8.8 6.7-12.1-13-6.1 20.6-5Z"
          fill="white"
        />
        <path
          d="M42.8 16.6 39.4 31 51 37.8 42.8 16.6Z"
          fill="#E0E7FF"
        />
        <path
          d="M42.8 16.6 35.2 27.7"
          stroke="#6366F1"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="studypilot-logo-bg" x1="8" y1="8" x2="56" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1D4ED8" />
            <stop offset="0.55" stopColor="#4F46E5" />
            <stop offset="1" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="studypilot-logo-page-left" x1="17" y1="20" x2="32" y2="47" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#BFDBFE" />
          </linearGradient>
          <linearGradient id="studypilot-logo-page-right" x1="32" y1="20" x2="47" y2="47" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EEF2FF" />
            <stop offset="1" stopColor="#C4B5FD" />
          </linearGradient>
        </defs>
      </svg>
      {showText ? (
        <span className="truncate font-bold tracking-normal text-ink">StudyPilot</span>
      ) : null}
    </span>
  );
}
