'use client';

// ============================================================================
// ACCOUNT PAGE - Version Simplifiée Temporaire
// ============================================================================

import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </Link>
          <h1 className="text-3xl font-bold text-white">Mon Compte</h1>
        </div>

        {/* Content */}
        <div className="bg-slate-900 rounded-lg p-8 border border-slate-800">
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Page en Construction
            </h2>
            <p className="text-slate-400 mb-6">
              La page de compte sera bientôt disponible.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
