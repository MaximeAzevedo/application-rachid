'use client';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="min-h-screen">
      {/* Contenu principal sans navigation bottom */}
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
} 