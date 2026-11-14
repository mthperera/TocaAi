"use client";

import Image from "next/image";
import { coverUrl, popularity, type Track } from "@/lib/catalog";
import { ExplicitBadge } from "../ui";

export function TrackCard({
  track,
  showYear = true,
  showCover = true,
  children,
}: {
  track: Track;
  showYear?: boolean;
  showCover?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4">
      {showCover && (
        <Image
          src={coverUrl(track.cover, 250)}
          alt=""
          width={88}
          height={88}
          className="size-22 shrink-0 rounded-md shadow-[0_10px_24px_-12px_rgb(0_0_0/0.6)]"
        />
      )}
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-xl leading-tight font-semibold">
          <span className="truncate">{track.title}</span>
          {track.explicit && <ExplicitBadge />}
        </p>
        <p className="truncate text-muted">{track.artist}</p>
        <p className="mt-1 font-mono text-xs text-muted">
          {showYear && track.year ? `${track.year} · ` : ""}popularidade {popularity(track)}/100
        </p>
        {children}
      </div>
    </div>
  );
}
