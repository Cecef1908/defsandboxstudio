import { NextResponse } from 'next/server';

export async function GET() {
    // Cette route est désactivée intentionnellement pour l'environnement Canvas.
    // L'application utilise désormais le SDK Client (firestore) directement dans page.tsx
    // pour éviter les problèmes de clés privées manquantes (Admin SDK).
    
    return NextResponse.json({ 
        error: "Route API désactivée. Utilisez la récupération de données côté client.",
        status: "disabled" 
    }, { status: 200 });
}
