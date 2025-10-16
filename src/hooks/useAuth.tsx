'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';

const supabase = createClient();

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  profile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: Error | null }>;
  signOut: () => Promise<void>;
  signUp: () => Promise<{ error?: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        console.log('🔄 Chargement session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('📦 Session récupérée:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
          error: sessionError
        });
        
        if (session?.user) {
          console.log('👤 Chargement profil utilisateur...');
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          console.log('📋 Profil récupéré:', {
            hasProfile: !!profile,
            email: profile?.email,
            error: profileError
          });

          if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name || 'Utilisateur',
              role: profile.role || 'teacher'
            });
            console.log('✅ Utilisateur connecté:', profile.email);
          } else {
            console.warn('⚠️ Profil non trouvé pour:', session.user.email);
          }
        } else {
          console.log('ℹ️ Aucune session active');
        }
      } catch (error) {
        console.error('❌ Erreur session:', error);
      } finally {
        // TOUJOURS terminer le loading
        console.log('✅ Chargement terminé');
        setLoading(false);
      }
    };

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name || 'Utilisateur',
            role: profile.role || 'teacher'
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: new Error('Identifiants invalides') };
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name || 'Utilisateur',
            role: profile.role || 'teacher'
          });
        }
      }

      return { error: null };
    } catch (error) {
      return { error: new Error('Erreur de connexion') };
    }
  };

  const signUp = async () => {
    return { error: new Error('Inscription non disponible') };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile: user, loading, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}
