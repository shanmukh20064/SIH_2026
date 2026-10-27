import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('YOUR_SUPABASE'));

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

/**
 * Subscribes to real-time table modifications (INSERT, UPDATE, DELETE)
 * on Supabase.
 *
 * @param {string} table - The PostgreSQL table name (e.g. 'applications', 'findings')
 * @param {function} onEvent - Callback invoked when a real-time event occurs: (payload) => void
 * @returns {object|null} Channel subscription instance
 */
export function subscribeToTable(table, onEvent) {
  if (!supabase) return null;

  const channel = supabase
    .channel(`public:${table}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      (payload) => {
        console.log(`[Supabase Realtime] Event on ${table}:`, payload);
        if (onEvent) onEvent(payload);
      }
    )
    .subscribe((status) => {
      console.log(`[Supabase Realtime] Channel public:${table} status:`, status);
    });

  return channel;
}

/**
 * Unsubscribe and remove channel
 */
export function unsubscribeChannel(channel) {
  if (supabase && channel) {
    supabase.removeChannel(channel);
  }
}
