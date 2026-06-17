/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@bizmanager/ai',
    '@bizmanager/design-tokens',
    '@bizmanager/i18n',
    '@bizmanager/supabase-client',
    '@bizmanager/types',
    '@bizmanager/utils',
  ],
};

module.exports = nextConfig;
