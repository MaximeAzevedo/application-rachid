import { redirect } from 'next/navigation';

// Redirection côté serveur vers la page de connexion
export default function HomePage() {
  redirect('/login');
} 