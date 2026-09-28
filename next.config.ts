import type { NextConfig } from "next";

// Static export: the site is plain files in out/. For GitHub Pages under /repo-name, build with
// NEXT_PUBLIC_BASE_PATH=/repo-name.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
