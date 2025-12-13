// Load environment variables from .env.local
// This file should be loaded before supabase-client.js

window.ENV = {
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',
  OPENAI_API_KEY: ''
};

window.envLoaded = false;

// Fetch and parse .env.local file
async function loadEnv() {
  try {
    const response = await fetch('.env.local');
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
    window.envLoaded = true;
    console.log('Environment variables loaded successfully');
    console.log('Supabase URL:', window.ENV.SUPABASE_URL);
  } catch (err) {
    console.error('Failed to load .env.local:', err);
    window.envLoaded = true; // Mark as loaded even on error to unblock
  }
}

// Load immediately
loadEnv();
