/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // three.js and its ecosystem ship modern ESM; transpiling keeps Next happy across versions.
  transpilePackages: ["three"],
  experimental: {
    // Smaller client bundles by optimizing barrel imports from these heavy packages.
    optimizePackageImports: ["@react-three/drei", "framer-motion"],
  },
  webpack: (config) => {
    // Allow importing GLSL/HDR/GLB if assets are added later without extra loaders failing the build.
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      type: "asset/source",
    });
    return config;
  },
};

export default nextConfig;
