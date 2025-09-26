import { redirect } from 'next/navigation';

// Redirection côté serveur vers la page de connexion
export default function HomePage() {
  // Vérifier que les variables d'environnement Supabase sont présentes
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-4">Configuration manquante</h1>
                     <p className="text-gray-600 mb-6">
             Les variables d&apos;environnement Supabase ne sont pas configurées.
           </p>
          <div className="text-left bg-gray-50 p-4 rounded text-sm">
            <p className="font-semibold mb-2">Variables requises :</p>
            <p>• NEXT_PUBLIC_SUPABASE_URL</p>
            <p>• NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
          </div>
        </div>
      </div>
    );
  }
  
  redirect('/login');
} 