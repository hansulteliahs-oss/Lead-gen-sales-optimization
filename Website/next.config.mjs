/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/kim-arvdalen', destination: '/', permanent: true },
      { source: '/kim-arvdalen/about', destination: '/about', permanent: true },
      { source: '/kim-arvdalen/au-pairs', destination: '/au-pairs', permanent: true },
      { source: '/kim-arvdalen/faq', destination: '/faq', permanent: true },
      { source: '/kim-arvdalen/testimonials', destination: '/testimonials', permanent: true },
    ]
  },
};

export default nextConfig;
