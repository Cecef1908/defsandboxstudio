import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, title, data } = body;

    if (!code) {
      return NextResponse.json({ success: false, message: "Code manquant" }, { status: 400 });
    }

    // Génération d'un slug propre
    const safeTitle = (title || "dashboard").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${safeTitle}-${Date.now()}`;
    
    // Chemin du dossier public
    const dashboardDir = path.join(process.cwd(), 'public', 'dashboards');
    const filePath = path.join(dashboardDir, `${slug}.json`);

    await mkdir(dashboardDir, { recursive: true });

    // Sauvegarde COMPLÈTE (Code + Data Snapshot)
    // C'est ce qui permet au lien de fonctionner sans accès à la BDD
    const fileContent = JSON.stringify({
      id: slug,
      title: title || "Sans titre",
      code: code,
      data: data, // <--- CRITIQUE : On fige les données ici
      createdAt: new Date().toISOString()
    }, null, 2);

    await writeFile(filePath, fileContent, 'utf-8');

    return NextResponse.json({ success: true, slug: slug });

  } catch (error) {
    console.error("❌ Erreur publication:", error);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}