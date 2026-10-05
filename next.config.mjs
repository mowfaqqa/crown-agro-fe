const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL;
const mediaPattern = mediaUrl ? (() => {
  const url = new URL(mediaUrl);
  return { protocol: url.protocol.replace(":", ""), hostname: url.hostname, port: url.port };
})() : null;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      ...(mediaPattern ? [mediaPattern] : [])
    ]
  }
};

export default nextConfig;
