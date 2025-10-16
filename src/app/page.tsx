import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirection automatique vers la page de login
  redirect('/login');
} 