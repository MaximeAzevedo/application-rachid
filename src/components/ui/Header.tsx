'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, LogOut } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backUrl?: string;
  user?: {
    name?: string;
    email?: string;
  };
  onSignOut?: () => void;
  actions?: React.ReactNode;
  type?: 'dashboard' | 'admin' | 'class' | 'default';
}

export function Header({ 
  title, 
  subtitle, 
  showBackButton = false, 
  backUrl = '/dashboard',
  user,
  onSignOut,
  actions,
  type = 'default'
}: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push(backUrl);
  };

  const getHeaderStyle = () => {
    switch (type) {
      case 'dashboard':
        return 'bg-gradient-to-r from-green-600 via-green-500 to-green-600';
      case 'admin':
        return 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800';
      case 'class':
        return 'bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600';
      default:
        return 'bg-gradient-to-r from-green-600 via-green-500 to-green-600';
    }
  };

  return (
    <header className={`${getHeaderStyle()} text-white shadow-xl border-b border-white/10`}>
      <div className="container-modern">
        <div className="flex items-center justify-between py-4 lg:py-6">
          {/* Section gauche - Titre et navigation */}
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 text-sm font-medium border border-white/20 hover:border-white/30 backdrop-blur-sm group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Retour</span>
              </button>
            )}
            
            <div className="min-w-0 flex items-center gap-4">
              {/* Logo CSCBM */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <Image 
                    src="/logo-cscbm.png" 
                    alt="Logo CSCBM"
                    width={128}
                    height={128}
                    className="object-contain"
                  />
                </div>
              </div>
              
              {/* Titre et sous-titre */}
              <div className="min-w-0">
                <h1 className="text-xl lg:text-2xl font-bold truncate">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm lg:text-base text-white/80 truncate mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section droite - Actions et utilisateur */}
          <div className="flex items-center gap-3">
            {/* Actions personnalisées */}
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}

            {/* Menu utilisateur */}
            {user && (
              <div className="flex items-center gap-3">
                {/* Informations utilisateur sur desktop */}
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium">
                    {user.name || 'Administrateur'}
                  </p>
                  <p className="text-xs text-white/70">
                    {user.email || 'Connecté'}
                  </p>
                </div>

                {/* Bouton déconnexion */}
                <div className="flex items-center">
                  {onSignOut && (
                    <button
                      onClick={onSignOut}
                      className="flex items-center gap-2 px-3 py-2 bg-red-500/80 hover:bg-red-600 rounded-lg transition-all duration-200 text-sm font-medium border border-red-400/30 hover:border-red-300 group"
                    >
                      <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      <span className="hidden sm:inline">Déconnexion</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 