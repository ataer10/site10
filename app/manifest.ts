import type { MetadataRoute } from "next";
import { defaultSettings } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: defaultSettings.name,
    short_name: defaultSettings.shortName,
    description: defaultSettings.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1B4965",
    lang: "tr",
    dir: "ltr",
    categories: ["business", "shopping"],
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
