'use client';

// ============================================================================
// LOGIN PAGE - Authentification moderne (Normes 2025)
// Google OAuth + Email/Password + Reset Password + Rate Limiting
// ============================================================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { signInWithGoogle, signInWithEmail, checkRateLimit } from '@/lib/firebase/auth.service';
import { useToast } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const toast = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Rediriger si déjà connecté
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    // Rate limiting
    if (!checkRateLimit(email)) {
      setError('Trop de tentatives. Réessayez dans 1 minute');
      return;
    }

    setIsSubmitting(true);

    const result = await signInWithEmail(email, password);
    
    if (result.success) {
      toast.success('Connexion réussie !', 'Bienvenue');
      router.push('/');
    } else {
      setError(result.error || 'Erreur de connexion');
    }
    
    setIsSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsSubmitting(true);

    const result = await signInWithGoogle();
    
    if (result.success) {
      toast.success('Connexion réussie !', 'Bienvenue');
      router.push('/');
    } else {
      setError(result.error || 'Erreur de connexion avec Google');
    }
    
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/20 mb-4">
            <span className="text-white font-bold text-2xl">Ah</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Agence Hub</h1>
          <p className="text-slate-400">Connectez-vous à votre espace</p>
        </div>

        {/* Card */}
        <div className="bg-[#1E293B]/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-8">
          {/* Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continuer avec Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#1E293B] text-slate-400">ou</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-6">
            {/* Error message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{error}</p>
                </div>
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
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting || !email || !password}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Se connecter</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <Link 
              href="/forgot-password"
              className="text-sm text-slate-400 hover:text-indigo-400 transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>© 2025 Agence Hub. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
}
