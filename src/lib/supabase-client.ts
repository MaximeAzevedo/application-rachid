// Client Supabase pour le côté client avec gestion des cookies
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  console.log('🔐 Création client Supabase:', {
    url: url ? '✅' : '❌',
    key: key ? '✅ (longueur: ' + key.length + ')' : '❌'
  });
  
  return createBrowserClient(url, key, {
    cookies: {
      get(name: string) {
        if (typeof document === 'undefined') return undefined;
        const value = document.cookie
          .split('; ')
          .find(row => row.startsWith(`${name}=`))
          ?.split('=')[1];
        console.log('🍪 Get cookie:', name, value ? '✅' : '❌');
        return value;
      },
      set(name: string, value: string, options: any) {
        if (typeof document === 'undefined') return;
        console.log('🍪 Set cookie:', name, '✅');
        document.cookie = `${name}=${value}; path=/; ${options.maxAge ? `max-age=${options.maxAge}` : ''}`;
      },
      remove(name: string, options: any) {
        if (typeof document === 'undefined') return;
        console.log('🍪 Remove cookie:', name);
        document.cookie = `${name}=; path=/; max-age=0`;
      }
    }
  });
}

