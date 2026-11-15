import { ImageResponse } from "next/og";
import { categories, getCategory, textOn } from "@/lib/categories";

export const alt = "Jogo de adivinhar música";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return categories.map((c) => ({ id: c.id }));
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const category = getCategory((await params).id) ?? categories[0];
  const ink = textOn(category.color);
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 90px",
        background: category.color,
        color: ink,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
        <div style={{ fontSize: 34, opacity: 0.85 }}>Jogo de adivinhar música</div>
        <div style={{ fontSize: 120, fontWeight: 900, letterSpacing: -3, lineHeight: 1, marginTop: 12 }}>
          {category.name.toUpperCase()}
        </div>
        <div style={{ fontSize: 34, marginTop: 24, opacity: 0.85 }}>Toca Aí · desafio novo todo dia</div>
      </div>
      <div
        style={{
          width: 380,
          height: 380,
          borderRadius: 380,
          background: "#111",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            width: 130,
            height: 130,
            borderRadius: 130,
            background: "#f3ede2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: 14, height: 14, borderRadius: 14, background: "#111" }} />
        </div>
      </div>
    </div>,
    size,
  );
}
