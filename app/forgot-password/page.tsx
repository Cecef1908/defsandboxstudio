'use client';

// ============================================================================
// FORGOT PASSWORD PAGE - Réinitialisation mot de passe
// ============================================================================

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Send, CheckCircle2 } from 'lucide-react';
import { sendPasswordReset } from '@/lib/firebase/auth.service';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Veuillez entrer votre email');
      return;
    }

    setIsSubmitting(true);

    const result = await sendPasswordReset(email);
    
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Erreur lors de l\'envoi de l\'email');
    }
    
    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <div className="bg-[#1E293B]/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 rounded-full mb-6">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">Email envoyé !</h1>
            
            <p className="text-slate-300 mb-6">
              Un email de réinitialisation a été envoyé à <span className="font-medium text-white">{email}</span>.
              <br /><br />
              Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.
            </p>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors"
            >
              <ArrowLeft size={18} />
              <span>Retour à la connexion</span>
            </Link>

            <p className="mt-6 text-sm text-slate-400">
              Vous n'avez pas reçu l'email ?{' '}
              <button
                onClick={() => setSuccess(false)}
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Renvoyer
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative w-full max-w-md">
        {/* Back button */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={18} />
          <span>Retour</span>
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/20 mb-4">
            <span className="text-white font-bold text-2xl">Ah</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Mot de passe oublié ?</h1>
          <p className="text-slate-400">Entrez votre email pour recevoir un lien de réinitialisation</p>
        </div>

        {/* Card */}
        <div className="bg-[#1E293B]/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="votre@email.com"
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Envoyer le lien</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>© 2025 Agence Hub. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
}
