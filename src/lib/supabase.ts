import { createClient } from '@supabase/supabase-js';

function getSupabaseUrl() {
  return typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_SUPABASE_URL
    : process.env.VITE_SUPABASE_URL;
}

function getSupabaseAnonKey() {
  return typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_SUPABASE_ANON_KEY
    : process.env.VITE_SUPABASE_ANON_KEY;
}

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

console.log('Supabase URL:', supabaseUrl ? 'Found ✓' : 'Missing ✗');
console.log('Supabase Key:', supabaseAnonKey ? 'Found ✓' : 'Missing ✗');

let supabase;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing! Check .env file exists and has correct variable names.');
  console.error('Expected: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');

  supabase = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') }),
      insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      update: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      delete: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      upsert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        remove: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
    rpc: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
  };
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase initialized successfully ✓');
  } catch (error) {
    console.error('Supabase initialization failed:', error);
  }
}

export { supabase };
