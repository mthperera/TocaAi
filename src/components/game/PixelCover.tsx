"use client";

import { useEffect, useRef } from "react";
import { coverUrl } from "@/lib/catalog";

export function PixelCover({ md5, pixels }: { md5: string; pixels: number | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = new Image();
    let alive = true;
    img.onload = () => {
      if (!alive) return;
      const size = canvas.width;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.imageSmoothingEnabled = pixels === null;
      if (pixels === null) {
        ctx.drawImage(img, 0, 0, size, size);
        return;
      }
      const small = document.createElement("canvas");
      small.width = pixels;
      small.height = pixels;
      const sctx = small.getContext("2d");
      if (!sctx) return;
      sctx.drawImage(img, 0, 0, pixels, pixels);
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(small, 0, 0, pixels, pixels, 0, 0, size, size);
    };
    img.src = coverUrl(md5, 500);
    return () => {
      alive = false;
    };
  }, [md5, pixels]);

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={480}
      aria-label={pixels ? `Capa pixelada em ${pixels}×${pixels}` : "Capa do álbum"}
      className="aspect-square w-full rounded-md bg-soft shadow-[0_16px_30px_-16px_rgb(0_0_0/0.7)]"
    />
  );
}
