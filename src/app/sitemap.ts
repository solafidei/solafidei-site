import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://www.solafidei.com" },
    { url: "https://www.solafidei.com/privacy" },
    { url: "https://www.solafidei.com/terms" },
    { url: "https://www.solafidei.com/data-deletion" },
  ];
}
