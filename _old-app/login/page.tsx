"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);
  
  const router = useRouter();
  const { signIn, resetPassword, user, loading, clearError } = useAuth();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (user && !loading) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Connexion Email/Password
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();
    setLocalLoading(true);

    try {
      if (showReset) {
        await resetPassword(email);
        setResetSent(true);
      } else {
        await signIn(email, password);
        router.push("/");
      }
    } catch (err) {
      // Error handled by AuthContext
    } finally {
      setLocalLoading(false);
    }
  };

  // Connexion Google
  const handleGoogleLogin = async () => {
    setLocalError("");
    clearError();
    setGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      
      const userRef = doc(db, "users", result.user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email: result.user.email,
          display_name: result.user.displayName || result.user.email?.split('@')[0],
          avatar_url: result.user.photoURL,
          role: 'analyst',
          status: 'pending',
          client_access: 'assigned',
          assigned_client_ids: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      
      router.push("/");
    } catch (err: any) {
      console.error('Google login error:', err);
      let errorMsg = "Erreur de connexion Google";
      if (err.code === 'auth/popup-closed-by-user') errorMsg = "Connexion annulée";
      else if (err.code === 'auth/popup-blocked') errorMsg = "Pop-up bloqué par le navigateur";
      setLocalError(errorMsg);
    } finally {
      setGoogleLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex font-sans text-slate-200 selection:bg-indigo-500/30">
      {/* Left Panel - Branding (Dynamic) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0F172A] flex-col justify-between p-16">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-[#0F172A]/95 to-[#020617]" />
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/10">
              <span className="text-white font-bold text-xl tracking-tighter">Ah</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Agence Hub</span>
          </div>
          
          <div className="space-y-6 max-w-lg">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Pilotez votre <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                croissance digitale
              </span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              La plateforme tout-en-un pour gérer vos campagnes média, suivre vos performances et collaborer avec vos équipes.
            </p>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="relative z-10 grid grid-cols-2 gap-4">
          {[
            { label: 'Media Planning', icon: '📊' },
            { label: 'Reporting Live', icon: '📈' },
            { label: 'Collaboration', icon: '🤝' },
            { label: 'Automatisation', icon: '⚡' },
          ].map(item => (
            <div key={item.label} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors cursor-default">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-white font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#020617]">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="text-white font-bold text-xl">Ah</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              {showReset ? "Réinitialisation" : "Bienvenue"}
            </h2>
            <p className="text-slate-400">
              {showReset 
                ? "Entrez votre email pour recevoir un lien"
                : "Connectez-vous à votre espace de travail"}
            </p>
          </div>

          {resetSent ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-emerald-500/10">
                <CheckCircle2 className="text-emerald-400" size={32} />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Email envoyé !</h3>
              <p className="text-slate-400 text-sm mb-6">
                Vérifiez votre boîte de réception pour réinitialiser votre mot de passe.
              </p>
              <button
                onClick={() => { setShowReset(false); setResetSent(false); }}
                className="text-indigo-400 hover:text-indigo-300 font-medium text-sm flex items-center justify-center gap-2 w-full py-2 hover:bg-indigo-500/10 rounded-lg transition-colors"
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              {/* Google Button */}
              {!showReset && (
                <button
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="w-full bg-white hover:bg-slate-50 text-slate-900 font-semibold py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-white/5 group"
                >
                  {googleLoading ? (
                    <Loader2 size={20} className="animate-spin text-slate-900" />
                  ) : (
                    <>
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continuer avec Google
                    </>
                  )}
                </button>
              )}

              {/* Divider */}
              {!showReset && (
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-slate-800" />
                  <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">ou</span>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>
              )}

              {/* Email Form */}
              <form onSubmit={handleEmailLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Email professionnel
                  </label>
                  <div className="relative group">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@agence.com"
                      required
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {!showReset && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Mot de passe
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowReset(true)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Oublié ?
                      </button>
                    </div>
                    <div className="relative group">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-11 pr-12 py-3.5 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}

                {(localError) && (
                  <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400 animate-in slide-in-from-top-2">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <span>{localError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={localLoading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {localLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      {showReset ? "Envoyer le lien" : "Se connecter"}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {showReset && (
                <button
                  onClick={() => setShowReset(false)}
                  className="w-full text-slate-500 hover:text-white text-sm py-2 transition-colors"
                >
                  Annuler et revenir
                </button>
              )}

              {!showReset && (
                <div className="text-center pt-4 border-t border-slate-800/50">
                  <p className="text-slate-500 text-xs">
                    Pas encore de compte ? <span className="text-slate-400">Contactez votre administrateur.</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
