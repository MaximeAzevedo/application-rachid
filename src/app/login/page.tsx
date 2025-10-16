'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { signIn, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('admin@cscbm.org');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Rediriger si déjà connecté
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError('Identifiants invalides. Veuillez réessayer.');
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  // Afficher un loading pendant la vérification de la session
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      
      <div className="w-full max-w-md">
        <div className="bg-green-600/10 backdrop-blur-sm rounded-3xl shadow-2xl border border-green-200 p-8 animate-bounce-in">
          {/* Logo CSCBM Premium */}
          <div className="text-center mb-8">
            <div className="relative mx-auto w-64 h-64 mb-8">
              {/* Logo officiel CSCBM */}
              <div className="w-64 h-64 rounded-full bg-white flex items-center justify-center shadow-2xl border-4 border-green-200 relative overflow-hidden">
                <Image 
                  src="/logo-cscbm.png" 
                  alt="Logo CSCBM"
                  width={240}
                  height={240}
                  className="object-contain"
                />
              </div>
            </div>
            
            <h1 className="text-4xl text-gray-800 mb-3 font-bold tracking-wide">
              CSCBM
            </h1>
            <p className="text-xl text-gray-700 font-semibold mb-8">
              Application Vie Scolaire
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-slide-up">
                <div className="flex items-center space-x-2">
                  <div className="text-red-600 text-xl">⚠️</div>
                  <div className="text-red-700 text-sm font-medium">
                    {error}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Adresse e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cscbm.org"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:bg-white focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition-all outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:bg-white focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition-all outline-none"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 border border-green-400/30"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                  <span className="ml-2">Connexion...</span>
                </div>
              ) : (
                <>
                  Se connecter
                  <span className="text-lg">→</span>
                </>
              )}
            </button>
          </form>

        </div>

        {/* Message d'encouragement */}
        <div className="text-center mt-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="text-gray-600 text-lg font-medium">
            Bienvenue dans l&apos;application vie scolaire ! 🎓
          </div>
        </div>
      </div>
    </div>
  );
} 