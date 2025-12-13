// Load environment variables
// This file should be loaded before supabase-client.js

window.ENV = {
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',
  OPENAI_API_KEY: ''
};

window.envLoaded = false;

// Try to load from .env.local (local development) or use injected values (production)
async function loadEnv() {
  try {
    // Try to fetch .env.local file (works locally)
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
      console.log('Environment variables loaded from .env.local');
    } else {
      // Production: Load from injected script (Vercel/Heroku environment variables)
      // These will be set by the deployment platform
      console.log('Loading environment variables from deployment platform');
    }
    
    window.envLoaded = true;
    console.log('Supabase URL configured:', window.ENV.SUPABASE_URL ? 'Yes' : 'No');
  } catch (err) {
    console.log('Using environment variables from deployment platform');
    window.envLoaded = true;
  }
}

// Load immediately
loadEnv();
