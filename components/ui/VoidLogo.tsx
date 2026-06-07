"use client";

interface VoidLogoProps {
  size?: number;
  className?: string;
  withText?: boolean;
  glow?: boolean;
}

/**
 * The PROJECT VOID sigil drawn as crisp SVG — the angular twin-blade "V" inside a
 * targeting reticle. Scales to any size and inherits the red brand color.
 */
export default function VoidLogo({
  size = 120,
  className = "",
  withText = false,
  glow = true,
}: VoidLogoProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        className={glow ? "drop-shadow-[0_0_18px_rgba(209,0,31,0.7)]" : ""}
        role="img"
        aria-label="PROJECT VOID"
      >
        {/* reticle ring with gaps */}
        <circle
          cx="100"
          cy="100"
          r="80"
          stroke="#D1001F"
          strokeWidth="2.5"
          strokeOpacity="0.5"
          strokeDasharray="180 40 180 40"
        />
        <circle cx="100" cy="100" r="92" stroke="#D1001F" strokeWidth="1" strokeOpacity="0.25" />
        {/* ticks */}
        <line x1="100" y1="6" x2="100" y2="22" stroke="#D1001F" strokeWidth="3" />
        <line x1="100" y1="178" x2="100" y2="194" stroke="#D1001F" strokeWidth="3" />
        <line x1="6" y1="100" x2="22" y2="100" stroke="#D1001F" strokeWidth="2" strokeOpacity="0.6" />
        <line x1="178" y1="100" x2="194" y2="100" stroke="#D1001F" strokeWidth="2" strokeOpacity="0.6" />

        {/* twin-blade V */}
        <g fill="#D1001F">
          <path d="M52 52 L80 52 L104 150 L90 150 Z" />
          <path d="M148 52 L120 52 L96 150 L110 150 Z" />
          {/* center spark */}
          <path d="M100 120 L106 138 L100 150 L94 138 Z" fill="#ff1f3d" />
        </g>
      </svg>

      {withText && (
        <div className="mt-5 flex flex-col items-center">
          <div className="font-display text-xs tracking-brand text-void-ash">
            P R O J E C T
          </div>
          <div className="font-display text-5xl font-bold tracking-[0.2em] text-white text-glow-white">
            VOID
          </div>
          <div className="mt-1 font-mono text-[10px] tracking-[0.5em] text-void-red">
            計画虚空
          </div>
        </div>
      )}
    </div>
  );
}
