'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function AdminUsersPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="header-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => router.push('/dashboard')}
                className="mr-4"
              >
                ← Retour
              </Button>
              <h1 className="text-xl font-bold text-foreground">
                Gestion des Utilisateurs
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16 fade-in">
          <div className="h-20 w-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <span className="text-3xl">👥</span>
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Gestion des Utilisateurs
          </h2>
          
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Cette section permettra de gérer les comptes des professeurs et administrateurs. 
            Fonctionnalités à venir :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
            <div className="card p-6 text-left">
              <h3 className="font-bold text-foreground mb-2">👨‍🏫 Gestion des professeurs</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Créer des comptes professeurs</li>
                <li>• Assigner des classes spécifiques</li>
                <li>• Gérer les permissions d&apos;accès</li>
              </ul>
            </div>
            
            <div className="card p-6 text-left">
              <h3 className="font-bold text-foreground mb-2">👑 Gestion des administrateurs</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Créer des comptes administrateurs</li>
                <li>• Accès complet à toutes les fonctions</li>
                <li>• Supervision des activités</li>
              </ul>
            </div>

            <div className="card p-6 text-left">
              <h3 className="font-bold text-foreground mb-2">🔐 Sécurité</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Authentification sécurisée</li>
                <li>• Gestion des mots de passe</li>
                <li>• Historique des connexions</li>
              </ul>
            </div>

            <div className="card p-6 text-left">
              <h3 className="font-bold text-foreground mb-2">📊 Rapports</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Statistiques d&apos;utilisation</li>
                <li>• Activité par utilisateur</li>
                <li>• Rapports d&apos;accès</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <strong>Status actuel :</strong> Mode développement actif (authentification désactivée)
            </p>
            
            <div className="flex justify-center gap-4">
              <Button onClick={() => router.push('/dashboard')}>
                Retour au tableau de bord
              </Button>
              <Button variant="secondary" onClick={() => router.push('/admin/classes')}>
                Gérer les classes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Motif de fond subtil */}
      <div className="fixed inset-0 islamic-pattern pointer-events-none -z-10"></div>
    </div>
  );
} 