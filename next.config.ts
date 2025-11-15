import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

// Create the next-intl plugin
// This plugin handles the build-time processing for internationalization
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  /* config options here */
};

export default withNextIntl(nextConfig);
