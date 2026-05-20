const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Disable package exports to fix resolution errors with Supabase/Realtime
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
