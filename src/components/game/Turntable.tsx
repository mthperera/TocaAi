import Image from "next/image";
import { coverUrl } from "@/lib/catalog";
import { textOn } from "@/lib/categories";
import { Vinyl } from "../Vinyl";

export function Turntable({
  color,
  spinning,
  cover,
  caption,
}: {
  color: string;
  spinning: boolean;
  cover?: string | null;
  caption?: string;
}) {
  return (
    <div className="relative aspect-square w-full">
      <div className="absolute top-[6%] left-0 w-[88%]">
        <Vinyl color={color} spinning={spinning}>
          {cover && <Image src={coverUrl(cover, 250)} alt="" fill unoptimized className="object-cover" />}
        </Vinyl>
        {!cover && (
          <span
            className="pointer-events-none absolute inset-0 grid place-content-center text-center"
            style={{ color: textOn(color) }}
          >
            <span className="display block text-4xl sm:text-5xl">?</span>
            {caption && <span className="mt-0.5 block font-mono text-[10px] opacity-80">{caption}</span>}
          </span>
        )}
      </div>
      <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 size-full" aria-hidden>
        <circle cx="90" cy="10" r="6" fill="var(--soft)" stroke="var(--fg)" strokeWidth="1" />
        <g
          style={{
            transformBox: "view-box",
            transformOrigin: "90px 10px",
            transform: `rotate(${spinning ? 24 : 0}deg)`,
            transition: "transform 700ms cubic-bezier(.3,.7,.3,1)",
          }}
        >
          <rect x="87.5" y="1" width="5" height="5" rx="1" fill="var(--fg)" />
          <line x1="90" y1="10" x2="92" y2="58" stroke="var(--fg)" strokeWidth="1.6" strokeLinecap="round" />
          <rect x="89" y="56" width="6.5" height="9" rx="1.2" fill="var(--fg)" transform="rotate(-10 92 60)" />
        </g>
        <circle cx="90" cy="10" r="2" fill="var(--fg)" />
      </svg>
    </div>
  );
}
