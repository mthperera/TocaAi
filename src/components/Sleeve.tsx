import Image from "next/image";
import type { ReactNode } from "react";
import { artistPictureUrl, type Artist, type Category } from "@/lib/categories";
import { Vinyl } from "./Vinyl";

export function Sleeve({
  category,
  artists,
  peek = false,
  priority = false,
  sizes = "(min-width: 1024px) 120px, 23vw",
  sourceSize = 250,
  children,
}: {
  category: Category;
  artists: Artist[];
  peek?: boolean;
  priority?: boolean;
  sizes?: string;
  sourceSize?: number;
  children?: ReactNode;
}) {
  return (
    <div className="relative aspect-square">
      <Vinyl
        color={category.color}
        slow
        absolute
        className={`inset-[4%] transition-transform duration-500 ease-out group-hover:[animation-play-state:running] ${
          peek ? "translate-x-[30%]" : "group-hover:translate-x-[26%]"
        }`}
      />
      <div
        className="relative z-10 grid h-full grid-cols-2 grid-rows-2 overflow-hidden rounded-md shadow-[0_16px_30px_-16px_rgb(0_0_0/0.7)]"
        style={{ background: category.color }}
      >
        {artists.slice(0, 4).map((a, i) => (
          <div key={a.picture} className="relative">
            <Image
              src={artistPictureUrl(a.picture, sourceSize)}
              alt={a.name}
              fill
              sizes={sizes}
              preload={priority && i === 0}
              loading={priority && i > 0 ? "eager" : undefined}
              className="object-cover"
            />
          </div>
        ))}
        {children}
      </div>
    </div>
  );
}
