import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config.js';

const missing = !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || SUPABASE_URL.includes('YOUR_') || SUPABASE_PUBLISHABLE_KEY.includes('YOUR_');
if (missing) console.warn('Supabase-Konfiguration fehlt. Kopiere js/config.example.js nach js/config.js und trage deine Werte ein.');
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
