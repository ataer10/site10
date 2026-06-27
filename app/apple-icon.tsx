import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const font = readFileSync(
    join(process.cwd(), "lib/pdf/fonts/DejaVuSans-Bold.ttf"),
  );
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#16181D",
          color: "#ffffff",
          fontSize: 110,
          fontFamily: "DejaVu",
          position: "relative",
        }}
      >
        B
        <div
          style={{
            position: "absolute",
            bottom: 30,
            width: 48,
            height: 10,
            background: "#E2580C",
          }}
        />
      </div>
    ),
    { ...size, fonts: [{ name: "DejaVu", data: font, weight: 700 }] },
  );
}
