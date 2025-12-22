import { createClient } from '@supabase/supabase-js';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  if (envUrl) return envUrl;
  if (typeof window === 'undefined') return '';
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:4000`;
};

const supabaseUrl = getBaseUrl();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'anon';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
