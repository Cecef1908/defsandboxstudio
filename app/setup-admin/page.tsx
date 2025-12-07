'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { USERS_COLLECTION } from '@/lib/firebase/collections';
import { UserEntity } from '@/types';

export default function SetupAdminPage() {
  const [email, setEmail] = useState('admin@agencehub.com');
  const [password, setPassword] = useState('Admin123!');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const createAdmin = async () => {
    setLoading(true);
    setMessage('');

    try {
      // 1. Créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 2. Créer le document utilisateur dans Firestore
      const userData: UserEntity = {
        id: uid,
        email: email,
        display_name: 'Administrateur',
        role: 'super_admin',
        client_access: 'all',
        status: 'active',
        last_login: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, USERS_COLLECTION, uid), userData);

      setMessage('✅ Utilisateur admin créé avec succès !');
      
      // Rediriger vers la page d'accueil après 2 secondes
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

    } catch (error: any) {
      console.error('Erreur:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setMessage('⚠️ Cet email existe déjà. Utilisez la page de login.');
      } else {
        setMessage(`❌ Erreur: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">Ah</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Configuration initiale</h1>
          <p className="text-slate-400">Créer un utilisateur administrateur</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              placeholder="admin@agencehub.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Mot de passe</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              placeholder="Minimum 6 caractères"
            />
          </div>

          <button
            onClick={createAdmin}
            disabled={loading}
            className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Création en cours...' : 'Créer l\'administrateur'}
          </button>

          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes('✅') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              message.includes('⚠️') ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {message}
            </div>
          )}

          <div className="text-center text-sm text-slate-400">
            <p>Rôle : <span className="text-white font-medium">Super Administrateur</span></p>
            <p className="mt-2">Après création, vous serez redirigé vers la page d'accueil</p>
          </div>
        </div>
      </div>
    </div>
  );
}
