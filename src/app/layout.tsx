import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { MobileLayout } from "@/components/ui/MobileLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CSCBM - Gestion des Présences",
  description: "Application de gestion des présences pour le Centre Socio-Culturel du Bassin Méditerranéen",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CSCBM Présences"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#22c55d", // Vert parfait, vif et moderne !
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-sans antialiased page-layout">
        <AuthProvider>
          <MobileLayout>
            {children}
          </MobileLayout>
        </AuthProvider>
      </body>
    </html>
  );
} 