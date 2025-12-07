import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { ToastProvider } from '@/components/ui';

export const metadata: Metadata = {
  title: "Agence Hub",
  description: "Hub multi-modules pour planification média et administration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="h-full bg-slate-50">
        <ToastProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
