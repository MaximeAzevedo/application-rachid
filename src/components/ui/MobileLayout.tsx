'use client';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Contenu principal sans navigation bottom */}
      <main className="min-h-screen w-full max-w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
} 
