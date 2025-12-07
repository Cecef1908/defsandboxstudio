'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase'; // On utilise le fichier créé à l'étape 1
import { collection, getDocs, FirestoreError } from 'firebase/firestore'; // Import de FirestoreError
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

// Nom de la collection que l'on veut tester pour confirmer la connexion du module.
// Dans ce module, nous testons la collection des plans médias.
const COLLECTION_TO_TEST = "Media-plans";

export default function DatabaseStatus() {
  const [status, setStatus] = useState<'chargement' | 'succes' | 'erreur'>('chargement');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const testerLaConnexion = async () => {
      try {
        // *** MODIFICATION CLÉ : On cible maintenant la collection des plans médias ***
        const query = await getDocs(collection(db, COLLECTION_TO_TEST));
        setStatus('succes');
        setMessage(`Connecté ! ${query.size} plans trouvés dans "${COLLECTION_TO_TEST}".`);
      } catch (erreur) {
        console.error("Erreur:", erreur);
        setStatus('erreur');
        
        // On vérifie si c'est une erreur Firestore connue, sinon on utilise un message par défaut
        if (erreur instanceof FirestoreError) {
             setMessage(erreur.message);
        } else {
             setMessage("Erreur inconnue. Avez-vous les bonnes dépendances installées ?");
        }
      }
    };

    testerLaConnexion();
  }, []);

  if (status === 'chargement') return <div className="flex gap-2 text-blue-500"><Loader2 className="animate-spin" /> Connexion...</div>;
  
  if (status === 'erreur') return (
    <div className="p-3 bg-red-50 text-red-600 rounded border border-red-200 flex gap-2 items-start">
        <WifiOff size={20} className="mt-1 shrink-0"/>
        <div>
            <strong>Erreur de connexion :</strong><br/>
            <span className="text-xs">{message}</span>
            <div className="mt-2 text-red-500 font-sans">
                <strong>Conseil :</strong> Vérifie le nom de la collection, tes identifiants, et surtout tes **règles de sécurité Firestore**.
            </div>
        </div>
    </div>
  );

  return (
    <div className="p-3 bg-green-50 text-green-700 rounded border border-green-200 flex gap-2 items-center">
        <Wifi size={20} />
        <strong>{message}</strong>
    </div>
  );
}