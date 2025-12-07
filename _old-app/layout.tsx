import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./lib/AuthContext";

export const metadata: Metadata = {
  title: "Agence Studio",
  description: "Sandbox de génération de rapports",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="h-full bg-slate-50">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}