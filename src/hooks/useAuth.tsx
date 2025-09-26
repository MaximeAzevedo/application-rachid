'use client';

import { createContext, useContext, useEffect, useState } from 'react';

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
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utilisateur hardcodé pour l'auth locale
const MOCK_USER: User = {
  id: 'admin-local',
  email: 'admin@cscbm.org',
  full_name: 'Administrateur CSCBM',
  role: 'admin'
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger l'utilisateur depuis localStorage au démarrage
  useEffect(() => {
    // Vérifier que nous sommes côté client avant d'accéder à localStorage
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('cscbm_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Erreur lors du chargement de la session:', error);
          localStorage.removeItem('cscbm_user');
        }
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Authentification locale simple
      if (email === 'admin@cscbm.org' && password === 'admin123') {
        setUser(MOCK_USER);
        if (typeof window !== 'undefined') {
          localStorage.setItem('cscbm_user', JSON.stringify(MOCK_USER));
        }
        return { error: null };
      } else {
        return { error: new Error('Identifiants invalides') };
      }
    } catch (error) {
      return { error: new Error('Erreur de connexion') };
    }
  };

  const signUp = async (_email: string, _password: string, _fullName?: string) => {
    // Pour l'instant, pas d'inscription
    return { error: new Error('Inscription non disponible') };
  };

  const signOut = async () => {
    try {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cscbm_user');
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const value = {
    user,
    profile: user, // Même objet pour simplifier
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