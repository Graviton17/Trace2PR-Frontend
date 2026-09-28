import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

// Thin wrappers around supabase-js auth calls. The backend REST API
// (see `src/api/`) is a separate concern from Supabase Auth: auth is
// handled entirely client-side against Supabase, and the resulting
// access token is attached to backend requests by `src/api/client.ts`.
export const auth = {
  signInWithOAuth: async (provider: 'github' | 'google') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: provider === 'github' ? 'user:email' : 'email profile',
      },
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  },

  getUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    return { data, error };
  },

  refreshSession: async () => {
    // No args: supabase-js refreshes using the session it already has
    // persisted, so callers don't need to thread a refresh_token through.
    const { data, error } = await supabase.auth.refreshSession();
    return { data, error };
  },

  onAuthStateChange: (callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};
