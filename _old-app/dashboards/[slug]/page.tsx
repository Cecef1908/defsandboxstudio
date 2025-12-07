import { readFile } from 'fs/promises';
import path from 'path';
import DashboardRenderer from "../../components/DashboardRenderer"; // Ajustez le chemin selon votre structure
import { LayoutTemplate } from 'lucide-react';

export default async function DashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let dashboardData = null;

  try {
    const filePath = path.join(process.cwd(), 'public', 'dashboards', `${slug}.json`);
    const fileContent = await readFile(filePath, 'utf-8');
    dashboardData = JSON.parse(fileContent);
  } catch (error) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0F172A] text-slate-500 gap-4">
        <LayoutTemplate size={48} strokeWidth={1} />
        <p>Ce rapport est introuvable ou a expiré.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0F172A] flex flex-col">
      {/* Header Lecture Seule */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0F172A]/90 backdrop-blur fixed top-0 w-full z-50">
         <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <span className="font-bold text-xs">5B</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">{dashboardData.title}</h1>
              <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Rapport Figé</p>
              </div>
            </div>
         </div>
         <div className="text-xs text-slate-500 font-mono">
           Publié le {new Date(dashboardData.createdAt).toLocaleDateString('fr-FR')}
         </div>
      </header>

      {/* Rendu avec injection des données sauvegardées */}
      <div className="flex-1 pt-16">
        <DashboardRenderer 
            code={dashboardData.code} 
            rawPlanData={dashboardData.data} // <--- Injection des données figées
        />
      </div>
    </div>
  );
}