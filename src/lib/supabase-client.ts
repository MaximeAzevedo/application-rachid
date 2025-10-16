// Client Supabase pour le côté client avec gestion des cookies
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton pour éviter de recréer le client à chaque fois
let client: SupabaseClient | undefined

export function createClient() {
  if (client) {
    return client;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.error('❌ ERREUR: Variables d\'environnement Supabase manquantes!');
    console.error('URL:', url ? '✅' : '❌ MANQUANTE');
    console.error('KEY:', key ? '✅' : '❌ MANQUANTE');
    throw new Error('Variables d\'environnement Supabase non configurées');
  }
  
  console.log('🔐 Création client Supabase (une seule fois):', {
    url: url.substring(0, 30) + '...',
    keyLength: key.length
  });
  
  client = createBrowserClient(url, key, {
    cookies: {
      get(name: string) {
        if (typeof document === 'undefined') return undefined;
        const value = document.cookie
          .split('; ')
          .find(row => row.startsWith(`${name}=`))
          ?.split('=')[1];
        return value;
      },
      set(name: string, value: string, options: any) {
        if (typeof document === 'undefined') return;
        document.cookie = `${name}=${value}; path=/; ${options.maxAge ? `max-age=${options.maxAge}` : ''}`;
      },
      remove(name: string, options: any) {
        if (typeof document === 'undefined') return;
        document.cookie = `${name}=; path=/; max-age=0`;
      }
    }
  });
  
  return client;
}

