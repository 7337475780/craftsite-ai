import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CraftSite AI",
    short_name: "CraftSite",
    description: "Generate, edit, save, export, and publish production-ready websites with AI.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a", // slate-950
    theme_color: "#0f172a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
