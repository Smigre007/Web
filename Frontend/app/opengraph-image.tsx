import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "NeuroCode AI — Crie Software com Inteligência Artificial";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #08090c 0%, #0d1412 50%, #08090c 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
            }}
          >
            ⚡
          </div>
          <span
            style={{
              fontSize: 36,
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            NeuroCode AI
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            maxWidth: 900,
            marginBottom: 24,
          }}
        >
          Crie Software com{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #a78bfa, #818cf8)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Inteligência Artificial
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.5)",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.5,
            marginBottom: 48,
          }}
        >
          Transforme suas ideias em sistemas completos — sem precisar programar.
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 12 }}>
          {["NeuroCode Engine", "Next.js", "Stripe", "Supabase"].map((tag) => (
            <div
              key={tag}
              style={{
                padding: "8px 20px",
                borderRadius: 100,
                border: "1px solid rgba(139,92,246,0.4)",
                background: "rgba(139,92,246,0.1)",
                color: "#c4b5fd",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
