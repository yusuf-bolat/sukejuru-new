// Build script to inject environment variables
const fs = require('fs');

// Read environment variables from Vercel
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// Create a runtime config file
const envScript = `
// Auto-generated environment configuration for production
window.ENV = {
  SUPABASE_URL: '${SUPABASE_URL}',
  SUPABASE_ANON_KEY: '${SUPABASE_ANON_KEY}',
  OPENAI_API_KEY: '${OPENAI_API_KEY}'
};
window.envLoaded = true;
console.log('Environment variables loaded from build');
`;

// Write to a file that will be loaded before other scripts
fs.writeFileSync('env-config.js', envScript);
console.log('✓ Environment variables injected successfully');
