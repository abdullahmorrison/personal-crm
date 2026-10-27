import type { MetadataRoute } from "next";

// Makes the app installable. Icons live in public/icons so a host's login wall can let them through by path.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Temory",
    short_name: "Temory",
    description: "Notable moments with the people in your life",
    start_url: "/people",
    display: "standalone",
    background_color: "#faf7f2",
    theme_color: "#faf7f2",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
