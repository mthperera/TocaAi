import type { ReactNode } from "react";

export function Vinyl({
  color,
  spinning = false,
  slow = false,
  absolute = false,
  bigLabel = false,
  still = false,
  className = "",
  children,
}: {
  color: string;
  spinning?: boolean;
  slow?: boolean;
  absolute?: boolean;
  bigLabel?: boolean;
  still?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const motion = still ? "" : `${slow ? "spin-slow" : "spin"} ${spinning ? "" : "paused"}`;
  return (
    <div className={`vinyl ${absolute ? "absolute" : "relative"} aspect-square ${motion} ${className}`}>
      <div className="vinyl-label" style={{ background: color, ...(bigLabel ? { inset: "22%" } : {}) }}>
        {children}
      </div>
    </div>
  );
}
