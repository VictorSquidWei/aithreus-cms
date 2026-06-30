/** @type {import('next').NextConfig} */
const nextConfig = {
  // Widget bundle is built separately by esbuild (widget/build.mjs) into public/.
  // pg has dynamic requires — keep it external so Next doesn't try to bundle it.
  serverExternalPackages: ["pg"],
  // Hide the dev-mode overlay badge so screen-shares / demos show a clean chrome.
  devIndicators: false,
};

export default nextConfig;
