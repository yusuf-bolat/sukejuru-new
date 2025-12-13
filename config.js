// Load environment variables
// This file should be loaded before supabase-client.js

// Initialize if not already set by env-config.js
if (!window.ENV) {
  window.ENV = {
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',
    OPENAI_API_KEY: ''
  };
}

if (window.envLoaded !== true) {
  window.envLoaded = false;
}

// Only load .env.local if env-config.js didn't already set the values
async function loadEnv() {
  // Check if env-config.js already loaded (production)
  if (window.ENV.SUPABASE_URL && window.ENV.SUPABASE_URL !== '' && window.ENV.SUPABASE_URL !== '__SUPABASE_URL__') {
    console.log('✓ Environment variables loaded from build (production)');
    window.envLoaded = true;
    return;
  }

  // Try to load from .env.local (local development only)
  try {
    const response = await fetch('.env.local');
    
    if (response.ok) {
      const text = await response.text();
      const lines = text.split('\n');
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          const value = valueParts.join('=').trim();
          if (key && value) {
            window.ENV[key.trim()] = value;
          }
        }
      });
      console.log('✓ Environment variables loaded from .env.local (development)');
    }
  } catch (err) {
    console.warn('⚠ Could not load .env.local - using environment variables from deployment');
  }
  
  window.envLoaded = true;
  console.log('Supabase URL configured:', window.ENV.SUPABASE_URL ? 'Yes' : 'No');
  console.log('OpenAI Key configured:', window.ENV.OPENAI_API_KEY ? 'Yes' : 'No');
}

// Load immediately
loadEnv();
