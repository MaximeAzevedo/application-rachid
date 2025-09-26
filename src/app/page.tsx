'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirection côté client vers la page de connexion
export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirection immédiate vers /login
    router.replace('/login');
  }, [router]);

  // Affichage d'un loader pendant la redirection
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection...</p>
      </div>
    </div>
  );
} 