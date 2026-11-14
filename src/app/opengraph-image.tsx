import { ImageResponse } from "next/og";

export const alt = "Toca Aí · Jogo de adivinhar música";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 90px",
        background: "#f3ede2",
        color: "#141210",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 150, fontWeight: 900, letterSpacing: -4, lineHeight: 1 }}>TOCA AÍ</div>
        <div style={{ fontSize: 44, marginTop: 24 }}>Adivinhe a música do dia</div>
        <div style={{ fontSize: 30, marginTop: 16, color: "#6f675c" }}>funk · sertanejo · pop · rock · anos 80, 90, 2000</div>
      </div>
      <div
        style={{
          width: 400,
          height: 400,
          borderRadius: 400,
          background: "#111",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ width: 140, height: 140, borderRadius: 140, background: "#ff5a1f", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 16, height: 16, borderRadius: 16, background: "#f3ede2" }} />
        </div>
      </div>
    </div>,
    size,
  );
}
