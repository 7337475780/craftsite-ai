import { useId } from "react";

type CraftSiteLogoProps = {
  className?: string;
  variant?: "full" | "compact";
};

export function CraftSiteLogo({
  className = "",
  variant = "full",
}: CraftSiteLogoProps) {
  const id = useId();
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex h-11 w-11 items-center justify-center">
        <svg
          viewBox="0 0 512 512"
          className="h-11 w-11 drop-shadow-[0_0_24px_rgba(123,44,255,0.45)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id={`mainGradient-${id}`}
              x1="120"
              y1="150"
              x2="410"
              y2="370"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#F02BFF" />
              <stop offset="0.48" stopColor="#7B2CFF" />
              <stop offset="1" stopColor="#008CFF" />
            </linearGradient>

            <linearGradient
              id={`backGradient-${id}`}
              x1="180"
              y1="90"
              x2="430"
              y2="280"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#B31CFF" />
              <stop offset="1" stopColor="#005CFF" />
            </linearGradient>

            <linearGradient
              id={`midGradient-${id}`}
              x1="145"
              y1="120"
              x2="405"
              y2="315"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#D72BFF" />
              <stop offset="1" stopColor="#174CFF" />
            </linearGradient>

            <filter id={`glow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="0 0 0 0 0.45
                        0 0 0 0 0.1
                        0 0 0 0 1
                        0 0 0 0.45 0"
              />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id={`shadow-${id}`} x="-20%" y="-20%" width="150%" height="150%">
              <feDropShadow
                dx="0"
                dy="18"
                stdDeviation="18"
                floodColor="#090025"
                floodOpacity="0.35"
              />
            </filter>
          </defs>

          <path
            d="M190 92H398C424.5 92 446 113.5 446 140V328C446 354.5 424.5 376 398 376H190C163.5 376 142 354.5 142 328V140C142 113.5 163.5 92 190 92Z"
            fill={`url(#backGradient-${id})`}
            opacity="0.9"
            filter={`url(#shadow-${id})`}
          />

          <path
            d="M143 134H359C385.5 134 407 155.5 407 182V370C407 396.5 385.5 418 359 418H143C116.5 418 95 396.5 95 370V182C95 155.5 116.5 134 143 134Z"
            fill={`url(#midGradient-${id})`}
            opacity="0.92"
            filter={`url(#shadow-${id})`}
          />

          <path
            d="M92 177H319C348.3 177 372 200.7 372 230V386C372 415.3 348.3 439 319 439H92C62.7 439 39 415.3 39 386V230C39 200.7 62.7 177 92 177Z"
            fill={`url(#mainGradient-${id})`}
            filter={`url(#glow-${id})`}
          />

          <path
            d="M92 177H319C348.3 177 372 200.7 372 230V257H39V230C39 200.7 62.7 177 92 177Z"
            fill="white"
            opacity="0.12"
          />

          <circle cx="77" cy="229" r="13" fill="white" />
          <circle cx="115" cy="229" r="13" fill="white" />
          <circle cx="153" cy="229" r="13" fill="white" />

          <circle cx="139" cy="166" r="10" fill="#190044" opacity="0.75" />
          <rect
            x="176"
            y="156"
            width="24"
            height="20"
            rx="4"
            fill="#DDA6FF"
            opacity="0.75"
          />
          <circle cx="226" cy="166" r="10" fill="#DDA6FF" opacity="0.45" />

          <circle cx="205" cy="123" r="10" fill="#DDA6FF" opacity="0.75" />
          <circle cx="244" cy="123" r="10" fill="#DDA6FF" opacity="0.65" />
          <circle cx="284" cy="123" r="10" fill="#DDA6FF" opacity="0.55" />

          <path
            d="M205 262
               C216 310 235 329 283 340
               C235 351 216 370 205 418
               C194 370 175 351 127 340
               C175 329 194 310 205 262Z"
            fill="white"
          />

          <path
            d="M72 398C127 421 231 438 324 410"
            stroke="white"
            strokeOpacity="0.14"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div>
        <p className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
          CraftSite
        </p>

        {variant === "full" && (
          <p className="-mt-0.5 hidden text-xs text-slate-500 dark:text-white/45 sm:block">
            AI Website Builder
          </p>
        )}
      </div>
    </div>
  );
}
