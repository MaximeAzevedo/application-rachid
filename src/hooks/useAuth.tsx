'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Types locaux simplifiés
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

  // Charger la session Supabase au démarrage
  useEffect(() => {
    const loadSession = async () => {
      try {
        // Récupérer la session active
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Erreur chargement session:', sessionError);
          setLoading(false);
          return;
        }

        if (session?.user) {
          // Charger le profil depuis la table profiles
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Erreur chargement profil:', profileError);
          } else if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name || 'Utilisateur',
              role: profile.role || 'teacher'
            });
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la session:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (session?.user) {
        // Charger le profil
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
        console.error('Erreur de connexion:', error);
        return { error: new Error('Identifiants invalides') };
      }

      if (data.user) {
        // Charger le profil
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
      console.error('Erreur signIn:', error);
      return { error: new Error('Erreur de connexion') };
    }
  };

  const signUp = async () => {
    // Pour l'instant, pas d'inscription publique
    return { error: new Error('Inscription non disponible') };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const value = {
    user,
    profile: user,
    loading,
    signIn,
    signOut,
    signUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
} 