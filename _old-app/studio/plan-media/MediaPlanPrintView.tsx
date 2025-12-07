import React from 'react';
import { 
    Target, Eye, MousePointerClick, PlayCircle, List, PieChart, 
    Calendar, Info, Check, Layout, Users, Scan
} from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Theme } from "../../types/agence";

interface MediaPlanPrintViewProps {
    data: any;
    theme: (Theme & { logoUrl?: string }) | null;
}

const DEFAULT_BENCHMARKS = {
    CTR_DISPLAY: 0.2,
    CTR_SEARCH: 5.0,
    VTR_VIDEO: 45.0,
    CONV_RATE: 2.0
};

// Helper Functions (Duplicated from page.tsx for stability)
const getUnitLabel = (model: string) => {
    const m = (model || '').toUpperCase();
    if (m === 'CPM') return 'Impressions';
    if (m === 'CPC') return 'Clics';
    if (m === 'CPV') return 'Vues';
    if (m === 'CPL') return 'Leads';
    if (m === 'FLAT' || m === 'FORFAIT') return 'Forfait';
    return 'Unités';
};

const simulateMetrics = (insertion: any, ctrDisplay: number, ctrSearch: number, vtrVideo: number, cpaLeads: number) => {
    const model = (insertion.modeleAchat || insertion.buyingModelId || 'FLAT').toUpperCase();
    const volAchete = Number(insertion.quantiteAchetee || insertion.volumeEst || 0);
    const canal = (insertion.canal || insertion.channelId || '').toLowerCase();
    
    let activeCTR = ctrDisplay;
    if (canal.includes('google') || canal.includes('search')) activeCTR = ctrSearch;
    
    let imp = 0, clics = 0, vues = 0, leads = 0;

    if (model === 'CPM') { 
        imp = volAchete; 
        clics = imp * activeCTR; 
        if (canal.includes('video')) vues = imp * vtrVideo; 
    } else if (model === 'CPC') { 
        clics = volAchete; 
        imp = activeCTR > 0 ? clics / activeCTR : 0; 
        if (canal.includes('video')) vues = imp * vtrVideo; 
    } else if (model === 'CPV') { 
        vues = volAchete; 
        imp = vtrVideo > 0 ? vues / vtrVideo : 0; 
        clics = imp * activeCTR; 
    } else if (model === 'CPL') { 
        leads = volAchete; 
        clics = cpaLeads > 0 ? leads / cpaLeads : 0; 
        imp = activeCTR > 0 ? clics / activeCTR : 0; 
    }
    
    if (model !== 'CPL') leads = clics * cpaLeads;
    
    return { 
        impressions: Math.round(imp), 
        clics: Math.round(clics), 
        vues: Math.round(vues), 
        leads: Math.round(leads), 
        unitLabel: getUnitLabel(model) 
    };
};

const formatDate = (ts: any) => {
    if (!ts) return null;
    if (typeof ts === 'string') return new Date(ts).toLocaleDateString('fr-FR');
    if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleDateString('fr-FR');
    return new Date(ts).toLocaleDateString('fr-FR');
};

const calcDuration = (start: any, end: any) => {
    if (!start || !end) return 0;
    const d1 = start.seconds ? new Date(start.seconds * 1000) : new Date(start);
    const d2 = end.seconds ? new Date(end.seconds * 1000) : new Date(end);
    return Math.ceil(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
};

export default function MediaPlanPrintView({ data, theme }: MediaPlanPrintViewProps) {
    if (!data || !data.plan) return null;

    const { plan, annonceur, marques, insertions, formats } = data;
    const themeColors = theme?.themeColors || { primaryAccent: '#4F46E5', secondaryAccent: '#64748B', background: '#FFFFFF', text: '#0F172A' };
    
    // Params extraction
    const CTR_DISPLAY = (plan.ctrDisplay || DEFAULT_BENCHMARKS.CTR_DISPLAY) / 100;
    const CTR_SEARCH = (plan.ctrSearch || DEFAULT_BENCHMARKS.CTR_SEARCH) / 100;
    const VTR_VIDEO = (plan.vtrVideo || DEFAULT_BENCHMARKS.VTR_VIDEO) / 100;
    const CPA_LEADS = (plan.convRate || DEFAULT_BENCHMARKS.CONV_RATE) / 100;

    const duration = calcDuration(plan.dateDebut || plan.startDate, plan.dateFin || plan.endDate);

    const insertionsWithMetrics = (insertions || []).map((ins: any) => {
        const formatSpec = (formats || []).find((f: any) => f.id === ins.format || f.name === ins.format);
        return {
            ...ins,
            metrics: simulateMetrics(ins, CTR_DISPLAY, CTR_SEARCH, VTR_VIDEO, CPA_LEADS),
            budgetNet: Number(ins.coutEstime || ins.budget || 0),
            volumeAchete: Number(ins.quantiteAchetee || ins.volumeEst || 0),
            unitCost: Number(ins.coutUnitaire || ins.unitCost || 0),
            techSpecs: formatSpec || { specsDimensions: '-', specsMaxWeight: '-', specsFileType: '-', name: null }
        };
    });

    const totalNetMedia = insertionsWithMetrics.reduce((acc: number, i: any) => acc + i.budgetNet, 0);
    const totalImp = insertionsWithMetrics.reduce((acc: number, i: any) => acc + i.metrics.impressions, 0);
    const totalClics = insertionsWithMetrics.reduce((acc: number, i: any) => acc + i.metrics.clics, 0);
    const totalVues = insertionsWithMetrics.reduce((acc: number, i: any) => acc + i.metrics.vues, 0);

    const tauxComm = plan.showCommission !== false ? (plan.commissionRate || 10) : 0;
    const tauxFrais = plan.showFees !== false ? (plan.feesRate || 0) : 0;
    const commissionAgence = totalNetMedia * (tauxComm / 100);
    const fraisTechniques = totalNetMedia * (tauxFrais / 100);
    const totalInvestiHT = totalNetMedia + commissionAgence + fraisTechniques;

    const dataCanal = insertionsWithMetrics.reduce((acc: any[], ins: any) => {
        const c = ins.canal || ins.channelId || 'Autre'; 
        const v = ins.budgetNet;
        const existing = acc.find(x => x.name === c); 
        if (existing) existing.value += v; else acc.push({ name: c, value: v });
        return acc;
    }, []).sort((a: any, b: any) => b.value - a.value);

    const DYNAMIC_COLORS = [themeColors.primaryAccent, themeColors.secondaryAccent, '#f59e0b', '#ef4444', '#8b5cf6', '#06B6D4'];

    const kpis = [
        { label: "Net Média Investi", val: totalNetMedia.toLocaleString('fr-FR'), unit: "MAD", icon: Target, color: themeColors.text, show: true },
        { label: "Impressions Est.", val: (totalImp / 1000000).toFixed(1), unit: "M", icon: Eye, color: themeColors.primaryAccent, show: totalImp > 0 },
        { label: "Clics Est.", val: (totalClics / 1000).toFixed(1), unit: "K", icon: MousePointerClick, color: themeColors.secondaryAccent, show: totalClics > 0 },
        { label: "Vues Vidéo Est.", val: (totalVues / 1000).toFixed(1), unit: "K", icon: PlayCircle, color: '#EC4899', show: totalVues > 0 },
    ].filter(k => k.show);

    const getInsertionLabel = (ins: any, index: number) => ins.nomInsertion || ins.name || (ins.techSpecs && ins.techSpecs.name) || (ins.format && (ins.format.startsWith('INS-') || ins.format.startsWith('FMT-')) ? ins.canal + ' #' + (index + 1) : ins.format || `Insertion #${index + 1}`);

    return (
        <div className="print-container w-full bg-white text-slate-900 p-8 space-y-8 font-sans">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6">
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">{plan.nomPlan || plan.name}</h1>
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-slate-200 text-slate-500">
                            {plan.status || 'Brouillon'}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1 mt-4">
                        <div className="flex items-center text-base gap-3 text-slate-600">
                            <span className="font-bold text-slate-900 uppercase">{annonceur ? (annonceur.nomAnnonceur || annonceur.annonceur) : '...'}</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-indigo-600 font-medium">{(marques || []).map((m: any) => m.nomMarque || m.name).join(', ') || 'Global'}</span>
                        </div>
                        {plan.description && (
                            <div className="flex items-start gap-2 text-sm text-slate-500 italic mt-2 bg-slate-50 p-3 rounded-lg max-w-2xl">
                                <Info size={16} className="mt-0.5 shrink-0" />
                                {plan.description}
                            </div>
                        )}
                    </div>
                </div>
                <div className="text-right flex flex-col items-end gap-4">
                    {theme?.logoUrl && (
                        <img src={theme.logoUrl} alt="Logo Agence" className="h-12 w-auto object-contain mb-2" />
                    )}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-[200px]">
                        <div className="text-[10px] uppercase font-bold tracking-widest mb-1 text-slate-500">Total Investissement HT</div>
                        <div className="text-3xl font-bold font-mono tracking-tight text-indigo-600">
                            {totalInvestiHT.toLocaleString('fr-FR')} <span className="text-base font-normal text-slate-400">MAD</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-600">
                        <Calendar size={16} className="text-indigo-500"/>
                        <div className="font-mono">
                            {formatDate(plan.dateDebut || plan.startDate) || '--/--/----'} 
                            <span className="mx-2 text-slate-300">➔</span> 
                            {formatDate(plan.dateFin || plan.endDate) || '--/--/----'}
                        </div>
                        {duration > 0 && (
                            <div className="ml-2 pl-3 border-l border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-400">
                                {duration} Jours
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-4 gap-6">
                {kpis.map((kpi, i) => (
                    <div key={i} className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm break-inside-avoid">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{kpi.label}</span>
                            <kpi.icon size={16} style={{ color: kpi.color }} className="opacity-80" />
                        </div>
                        <div className="text-2xl font-bold font-mono text-slate-900">
                            {kpi.val} <span className="text-sm font-normal text-slate-400">{kpi.unit}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Plan Média & Budget */}
            <div className="grid grid-cols-3 gap-8 print:block print:space-y-8">
                <div className="col-span-2 rounded-xl border border-slate-200 overflow-hidden break-inside-avoid shadow-sm bg-white print:w-full">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-sm flex items-center gap-2 text-slate-800">
                            <List size={16} className="text-indigo-500"/> Plan Média & Budget
                        </h3>
                    </div>
                    <div className="p-0">
                        <table className="w-full text-xs text-left">
                            <thead className="text-[10px] uppercase font-bold border-b border-slate-200 bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 pl-6">Support / Format</th>
                                    <th className="px-4 py-3">Modèle</th>
                                    <th className="px-4 py-3 text-right">Vol. Est.</th>
                                    <th className="px-4 py-3 text-right">C.U.</th>
                                    <th className="px-4 py-3 text-right">Budget Net</th>
                                    <th className="px-4 py-3 text-right pr-6">%</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {insertionsWithMetrics.map((ins: any, i: number) => {
                                    const budget = ins.budgetNet;
                                    const part = totalNetMedia > 0 ? (budget / totalNetMedia) * 100 : 0;
                                    return (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3 pl-6">
                                                <div className="font-bold text-slate-900">{ins.canal || ins.channelId}</div>
                                                <div className="text-[10px] text-slate-500">{getInsertionLabel(ins, i)}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold font-mono text-slate-700">{ins.modeleAchat}</span>
                                                    <span className="text-[10px] uppercase text-slate-400">{ins.metrics.unitLabel}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono font-medium text-slate-600">
                                                {ins.volumeAchete.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-slate-600">
                                                {ins.unitCost.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold font-mono text-indigo-600">
                                                {budget.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-right pr-6 font-mono text-slate-400">
                                                {part.toFixed(1)}%
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="border-t-2 border-indigo-100 bg-indigo-50/30">
                                <tr>
                                    <td colSpan={4} className="text-right px-4 py-2 font-medium uppercase text-[10px] tracking-wider text-slate-500">Total Net Média</td>
                                    <td className="px-4 py-2 text-right font-bold font-mono text-slate-900">{totalNetMedia.toLocaleString()}</td>
                                    <td></td>
                                </tr>
                                {plan.showCommission !== false && (
                                    <tr>
                                        <td colSpan={4} className="text-right px-4 py-1 text-[10px] text-slate-500">Commission Agence ({tauxComm}%)</td>
                                        <td className="px-4 py-1 text-right font-mono text-xs text-slate-500">{commissionAgence.toLocaleString()}</td>
                                        <td></td>
                                    </tr>
                                )}
                                {plan.showFees !== false && (
                                    <tr>
                                        <td colSpan={4} className="text-right px-4 py-1 text-[10px] text-slate-500">Frais Techniques ({tauxFrais}%)</td>
                                        <td className="px-4 py-1 text-right font-mono text-xs text-slate-500">{fraisTechniques.toLocaleString()}</td>
                                        <td></td>
                                    </tr>
                                )}
                                <tr className="border-t border-indigo-200 bg-indigo-50">
                                    <td colSpan={4} className="text-right px-4 py-3 font-bold uppercase tracking-wider text-xs text-indigo-900">Total Investissement HT</td>
                                    <td className="px-4 py-3 text-right font-bold text-lg font-mono text-indigo-700">{totalInvestiHT.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right font-mono text-xs text-indigo-900">MAD</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-6 flex flex-col shadow-sm bg-white break-inside-avoid print:w-full print:mt-8">
                    <h3 className="font-bold mb-4 text-xs uppercase tracking-widest flex items-center gap-2 text-slate-800">
                        <PieChart size={14} className="text-indigo-500"/> Répartition
                    </h3>
                    <div className="flex-1 w-full min-h-[250px] h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie 
                                    data={dataCanal} 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={60} 
                                    outerRadius={80} 
                                    paddingAngle={5} 
                                    dataKey="value" 
                                    stroke="none"
                                    isAnimationActive={false}
                                >
                                    {dataCanal.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={DYNAMIC_COLORS[index % DYNAMIC_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#64748B' }} />
                            </RePieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Page Break for Technical Specs & Performance if needed */}
            <div className="break-before-page">
                {/* Performances */}
                <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white mb-8 break-inside-avoid">
                    <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                            <Users size={16} className="text-indigo-500" /> Estimations de Performance
                        </h3>
                        <span className="text-[10px] text-slate-500">
                            Search {(CTR_SEARCH*100).toFixed(0)}% • Display {(CTR_DISPLAY*100).toFixed(1)}% • VTR {(VTR_VIDEO*100).toFixed(0)}%
                        </span>
                    </div>
                    <table className="w-full text-xs text-left">
                        <thead className="text-[10px] uppercase font-bold border-b border-slate-200 bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-4 py-3 pl-6">Canal</th>
                                <th className="px-4 py-3 text-right">Impressions</th>
                                <th className="px-4 py-3 text-right">Clics</th>
                                <th className="px-4 py-3 text-right">Vues Vidéo</th>
                                <th className="px-4 py-3 text-right pr-6">Leads / Conv.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {insertionsWithMetrics.map((ins: any, i: number) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 pl-6">
                                        <div className="font-bold text-slate-900">{ins.canal || ins.channelId}</div>
                                        <div className="text-[10px] uppercase text-slate-500">{ins.modeleAchat}</div>
                                    </td>
                                    <td className={`px-4 py-3 text-right font-mono ${ins.metrics.impressions > 0 ? 'text-indigo-600' : 'text-slate-300'}`}>
                                        {ins.metrics.impressions > 0 ? ins.metrics.impressions.toLocaleString() : '-'}
                                    </td>
                                    <td className={`px-4 py-3 text-right font-mono ${ins.metrics.clics > 0 ? 'text-blue-600' : 'text-slate-300'}`}>
                                        {ins.metrics.clics > 0 ? ins.metrics.clics.toLocaleString() : '-'}
                                    </td>
                                    <td className={`px-4 py-3 text-right font-mono ${ins.metrics.vues > 0 ? 'text-pink-500' : 'text-slate-300'}`}>
                                        {ins.metrics.vues > 0 ? ins.metrics.vues.toLocaleString() : '-'}
                                    </td>
                                    <td className={`px-4 py-3 text-right pr-6 font-mono ${ins.metrics.leads > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                                        {ins.metrics.leads > 0 ? ins.metrics.leads.toLocaleString() : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Specs Techniques */}
                <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white break-inside-avoid">
                    <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                            <Scan size={16} className="text-indigo-500" /> Spécifications Techniques
                        </h3>
                    </div>
                    <table className="w-full text-xs text-left">
                        <thead className="text-[10px] uppercase font-bold border-b border-slate-200 bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-4 py-3 pl-6">Insertion</th>
                                <th className="px-4 py-3">Format Requis</th>
                                <th className="px-4 py-3">Dimensions</th>
                                <th className="px-4 py-3">Poids Max</th>
                                <th className="px-4 py-3 pr-6">Type de fichier</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {insertionsWithMetrics.map((ins: any, i: number) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 pl-6">
                                        <div className="font-bold text-slate-900">{ins.canal}</div>
                                        <div className="text-[10px] text-slate-500">{getInsertionLabel(ins, i)}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-medium text-slate-800">{ins.format}</span>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-indigo-600">{ins.techSpecs.specsDimensions || '-'}</td>
                                    <td className="px-4 py-3 font-mono text-slate-500">{ins.techSpecs.specsMaxWeight || '-'}</td>
                                    <td className="px-4 py-3 pr-6 font-mono text-slate-500">{ins.techSpecs.specsFileType || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="pt-8 text-center text-[10px] text-slate-400 border-t mt-8">
                Document généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')} via Sandbox OS Media Studio.
            </div>
        </div>
    );
}
