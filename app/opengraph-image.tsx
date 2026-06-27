import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { defaultSettings } from "@/lib/site";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${defaultSettings.name} — ${defaultSettings.tagline}`;

export default function OpengraphImage() {
  const bold = readFileSync(
    join(process.cwd(), "lib/pdf/fonts/DejaVuSans-Bold.ttf"),
  );
  const reg = readFileSync(
    join(process.cwd(), "lib/pdf/fonts/DejaVuSans.ttf"),
  );
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#16181D",
          color: "#ffffff",
          padding: 72,
          fontFamily: "DejaVu",
        }}
      >
        {/* Marka */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 8,
              background: "#ffffff",
              color: "#16181D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 42,
              fontWeight: 700,
            }}
          >
            B
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: 2 }}>
            <div>{defaultSettings.shortName.toUpperCase()}</div>
            <div style={{ color: "#E2580C" }}>.</div>
          </div>
        </div>

        {/* Başlık */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 28, color: "#6e92af", marginBottom: 18, letterSpacing: 1 }}>
            Endüstriyel Tesisat Tedariki · B2B
          </div>
          <div style={{ display: "flex", fontSize: 66, fontWeight: 700, lineHeight: 1.1, maxWidth: 980 }}>
            Doğru parça, net fiyat, hızlı teklif.
          </div>
        </div>

        {/* Alt */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", width: 140, height: 8, background: "#E2580C" }} />
          <div style={{ display: "flex", fontSize: 26, color: "#9aa1ab" }}>
            {defaultSettings.tagline}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "DejaVu", data: bold, weight: 700, style: "normal" },
        { name: "DejaVu", data: reg, weight: 400, style: "normal" },
      ],
    },
  );
}
