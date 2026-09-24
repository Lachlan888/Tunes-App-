import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/", name: "Tunes — your living tunebook", short_name: "Tunes",
    description: "Remember, practise and share traditional music.",
    start_url: "/", scope: "/", display: "standalone",
    background_color: "#f4efe4", theme_color: "#5b4325",
    icons: [{ src: "/tunes-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  }
}
