import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  images: {
    domains: ['images.ctfassets.net']
  },
  async rewrites() {
    return [
      {
        source: '/:slug.html',
        destination: '/en/product/:slug', // or dynamic locale detection
      },
      {
        source: '/:locale/:slug.html',
        destination: '/:locale/product/:slug',
      },
    ];
  },
};

export default withNextIntl(nextConfig);
