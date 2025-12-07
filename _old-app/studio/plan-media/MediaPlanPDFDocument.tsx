/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { Theme } from "../../types/agence";

// Register a nice sans-serif font if available, otherwise stick to Helvetica which is standard
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v1/1.ttf' }, // Regular
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v1/1.ttf', fontWeight: 'bold' } // Bold (using same for now as placeholder)
  ]
});

interface MediaPlanPDFProps {
    data: any;
    theme: (Theme & { logoUrl?: string }) | null;
}

const DEFAULT_BENCHMARKS = {
    CTR_DISPLAY: 0.2,
    CTR_SEARCH: 5.0,
    VTR_VIDEO: 45.0,
    CONV_RATE: 2.0
};

// --- HELPERS ---
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
    if (!ts) return '--/--/----';
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

export const MediaPlanPDFDocument = ({ data, theme }: MediaPlanPDFProps) => {
    if (!data || !data.plan) return <Document><Page><Text>Données manquantes</Text></Page></Document>;

    const { plan, annonceur, marques, insertions, formats } = data;
    
    // Theme Colors
    const PRIMARY = theme?.themeColors?.primaryAccent || '#4F46E5';
    const SECONDARY = theme?.themeColors?.secondaryAccent || '#64748B';
    const BG_HEADER = '#F8FAFC'; // Light gray for headers
    
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

    // --- DYNAMIC STYLES ---
    const styles = StyleSheet.create({
        page: {
            flexDirection: 'column',
            backgroundColor: '#FFFFFF',
            padding: 40, // More whitespace
            fontFamily: 'Helvetica',
            color: '#1E293B',
            fontSize: 10
        },
        // HEADER
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 30,
            borderBottomWidth: 2,
            borderBottomColor: PRIMARY,
            paddingBottom: 20
        },
        brandCol: {
            flexDirection: 'column',
            justifyContent: 'flex-end'
        },
        logo: {
            height: 40,
            marginBottom: 10,
            objectFit: 'contain'
        },
        planTitle: {
            fontSize: 28,
            fontWeight: 'bold',
            color: '#0F172A',
            marginBottom: 5
        },
        planMetaRow: {
            flexDirection: 'row',
            gap: 15,
            marginTop: 5
        },
        planMetaItem: {
            fontSize: 9,
            color: '#64748B',
            backgroundColor: '#F1F5F9',
            paddingVertical: 3,
            paddingHorizontal: 8,
            borderRadius: 4
        },
        // SUMMARY CARDS
        summarySection: {
            flexDirection: 'row',
            gap: 15,
            marginBottom: 30
        },
        summaryCard: {
            flex: 1,
            backgroundColor: BG_HEADER,
            padding: 15,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: PRIMARY
        },
        summaryCardAlt: {
            flex: 1,
            backgroundColor: '#FFFFFF',
            padding: 15,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            borderLeftWidth: 4,
            borderLeftColor: SECONDARY
        },
        summaryLabel: {
            fontSize: 8,
            textTransform: 'uppercase',
            color: '#64748B',
            marginBottom: 5,
            fontWeight: 'bold'
        },
        summaryValue: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#0F172A'
        },
        summaryUnit: {
            fontSize: 10,
            color: '#94A3B8',
            fontWeight: 'normal'
        },
        // BENCHMARKS
        benchmarksRow: {
            flexDirection: 'row',
            marginBottom: 30,
            backgroundColor: '#F8FAFC',
            padding: 10,
            borderRadius: 6,
            justifyContent: 'space-around',
            borderWidth: 1,
            borderColor: '#E2E8F0'
        },
        benchmarkItem: {
            alignItems: 'center'
        },
        benchmarkLabel: {
            fontSize: 7,
            color: '#64748B',
            marginBottom: 2
        },
        benchmarkValue: {
            fontSize: 10,
            fontWeight: 'bold',
            color: '#334155'
        },
        // TABLES
        sectionHeader: {
            fontSize: 14,
            fontWeight: 'bold',
            color: PRIMARY,
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: 1,
            borderBottomWidth: 1,
            borderBottomColor: '#E2E8F0',
            paddingBottom: 5
        },
        table: {
            width: '100%',
            marginBottom: 20
        },
        tableHeader: {
            flexDirection: 'row',
            backgroundColor: PRIMARY,
            paddingVertical: 8,
            paddingHorizontal: 5,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4
        },
        tableHeaderCell: {
            color: '#FFFFFF',
            fontSize: 8,
            fontWeight: 'bold',
            textTransform: 'uppercase'
        },
        tableRow: {
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: '#E2E8F0',
            paddingVertical: 8,
            paddingHorizontal: 5,
            alignItems: 'center'
        },
        tableRowAlt: {
            backgroundColor: '#F8FAFC'
        },
        colSupport: { width: '25%' },
        colFormat: { width: '20%' },
        colVol: { width: '15%', textAlign: 'right' },
        colCU: { width: '15%', textAlign: 'right' },
        colBudget: { width: '15%', textAlign: 'right' },
        colPerf: { width: '10%', textAlign: 'right' }, // Mini KPI column
        
        cellTitle: { fontSize: 9, fontWeight: 'bold', color: '#1E293B' },
        cellSubtitle: { fontSize: 7, color: '#64748B', marginTop: 2 },
        cellMono: { fontFamily: 'Helvetica', fontSize: 9, color: '#334155' }, // Using Helvetica as mono substitute for now
        cellBudget: { fontSize: 9, fontWeight: 'bold', color: PRIMARY },
        
        // TOTALS FOOTER
        totalsSection: {
            marginTop: 10,
            alignSelf: 'flex-end',
            width: '40%',
            backgroundColor: BG_HEADER,
            padding: 15,
            borderRadius: 8
        },
        totalRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 5
        },
        totalLabel: { fontSize: 9, color: '#64748B' },
        totalValue: { fontSize: 9, fontWeight: 'bold', color: '#334155' },
        grandTotalRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 10,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: '#CBD5E1'
        },
        grandTotalLabel: { fontSize: 11, fontWeight: 'bold', color: PRIMARY, textTransform: 'uppercase' },
        grandTotalValue: { fontSize: 14, fontWeight: 'bold', color: PRIMARY },

        // TECHNICAL SPECS
        techGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10
        },
        techCard: {
            width: '31%',
            padding: 8,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            borderRadius: 4,
            marginBottom: 10
        },
        techLabel: { fontSize: 7, color: '#94A3B8', marginBottom: 2 },
        techVal: { fontSize: 8, color: '#334155' },

        footer: {
            position: 'absolute',
            bottom: 30,
            left: 40,
            right: 40,
            borderTopWidth: 1,
            borderTopColor: '#E2E8F0',
            paddingTop: 10,
            flexDirection: 'row',
            justifyContent: 'space-between'
        },
        footerText: { fontSize: 8, color: '#94A3B8' }
    });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* --- HEADER --- */}
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 10, color: '#94A3B8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Plan Média</Text>
                        <Text style={styles.planTitle}>{plan.nomPlan || plan.name}</Text>
                        <Text style={{ fontSize: 12, color: '#475569', marginBottom: 8 }}>
                            {(annonceur ? (annonceur.nomAnnonceur || annonceur.annonceur) : 'Annonceur Inconnu')} 
                            {"  •  "}
                            {(marques || []).map((m: any) => m.nomMarque || m.name).join(', ') || 'Global'}
                        </Text>
                        
                        <View style={styles.planMetaRow}>
                            <Text style={styles.planMetaItem}>{plan.status || 'Brouillon'}</Text>
                            <Text style={styles.planMetaItem}>{formatDate(plan.dateDebut || plan.startDate)} ➔ {formatDate(plan.dateFin || plan.endDate)}</Text>
                            <Text style={styles.planMetaItem}>{duration} Jours</Text>
                        </View>

                        {plan.description && (
                            <Text style={{ marginTop: 10, fontSize: 9, color: '#64748B', fontStyle: 'italic', maxWidth: 350 }}>
                                {plan.description}
                            </Text>
                        )}
                    </View>
                    <View style={styles.brandCol}>
                        {theme?.logoUrl ? (
                            // eslint-disable-next-line jsx-a11y/alt-text
                            <Image src={theme.logoUrl} style={styles.logo} />
                        ) : (
                            <View style={{ backgroundColor: PRIMARY, padding: 5, borderRadius: 4 }}>
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>AGENCE STUDIO</Text>
                            </View>
                        )}
                        <Text style={{ textAlign: 'right', fontSize: 8, color: '#94A3B8', marginTop: 5 }}>Généré via Sandbox OS</Text>
                    </View>
                </View>

                {/* --- EXECUTIVE SUMMARY --- */}
                <View style={styles.summarySection}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Investissement Total HT</Text>
                        <Text style={[styles.summaryValue, { color: PRIMARY }]}>{totalInvestiHT.toLocaleString('fr-FR')}</Text>
                        <Text style={styles.summaryUnit}>MAD</Text>
                    </View>
                    <View style={styles.summaryCardAlt}>
                        <Text style={styles.summaryLabel}>Impressions Est.</Text>
                        <Text style={styles.summaryValue}>{(totalImp / 1000000).toFixed(1)}</Text>
                        <Text style={styles.summaryUnit}>Millions</Text>
                    </View>
                    <View style={styles.summaryCardAlt}>
                        <Text style={styles.summaryLabel}>Clics Est.</Text>
                        <Text style={styles.summaryValue}>{(totalClics / 1000).toFixed(1)}</Text>
                        <Text style={styles.summaryUnit}>Milliers</Text>
                    </View>
                    <View style={styles.summaryCardAlt}>
                        <Text style={styles.summaryLabel}>Vues Vidéo Est.</Text>
                        <Text style={styles.summaryValue}>{(totalVues / 1000).toFixed(1)}</Text>
                        <Text style={styles.summaryUnit}>Milliers</Text>
                    </View>
                </View>

                {/* --- HYPOTHESES --- */}
                <View style={styles.benchmarksRow}>
                    <View style={styles.benchmarkItem}>
                        <Text style={styles.benchmarkLabel}>CTR Display</Text>
                        <Text style={styles.benchmarkValue}>{(CTR_DISPLAY * 100).toFixed(2)}%</Text>
                    </View>
                    <View style={styles.benchmarkItem}>
                        <Text style={styles.benchmarkLabel}>CTR Search</Text>
                        <Text style={styles.benchmarkValue}>{(CTR_SEARCH * 100).toFixed(2)}%</Text>
                    </View>
                    <View style={styles.benchmarkItem}>
                        <Text style={styles.benchmarkLabel}>VTR Vidéo</Text>
                        <Text style={styles.benchmarkValue}>{(VTR_VIDEO * 100).toFixed(0)}%</Text>
                    </View>
                    <View style={styles.benchmarkItem}>
                        <Text style={styles.benchmarkLabel}>Taux Conv.</Text>
                        <Text style={styles.benchmarkValue}>{(CPA_LEADS * 100).toFixed(1)}%</Text>
                    </View>
                </View>

                {/* --- MEDIA PLAN TABLE --- */}
                <Text style={styles.sectionHeader}>Détail du Plan Média</Text>
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <View style={styles.colSupport}><Text style={styles.tableHeaderCell}>Support / Format</Text></View>
                        <View style={styles.colFormat}><Text style={styles.tableHeaderCell}>Ciblage / Notes</Text></View>
                        <View style={styles.colVol}><Text style={styles.tableHeaderCell}>Quantité</Text></View>
                        <View style={styles.colCU}><Text style={styles.tableHeaderCell}>C.U.</Text></View>
                        <View style={styles.colBudget}><Text style={styles.tableHeaderCell}>Budget Net</Text></View>
                        <View style={styles.colPerf}><Text style={styles.tableHeaderCell}>Clics</Text></View>
                    </View>
                    
                    {insertionsWithMetrics.map((ins: any, i: number) => (
                        <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]} wrap={false}>
                            <View style={styles.colSupport}>
                                <Text style={styles.cellTitle}>{ins.canal || ins.channelId}</Text>
                                <Text style={styles.cellSubtitle}>{ins.nomInsertion || ins.format}</Text>
                                <Text style={{ fontSize: 6, color: PRIMARY, marginTop: 2 }}>{ins.modeleAchat} • {ins.metrics.unitLabel}</Text>
                            </View>
                            <View style={styles.colFormat}>
                                <Text style={{ fontSize: 7, color: '#475569' }}>{ins.targeting || '-'}</Text>
                            </View>
                            <View style={styles.colVol}>
                                <Text style={styles.cellMono}>{ins.volumeAchete.toLocaleString()}</Text>
                            </View>
                            <View style={styles.colCU}>
                                <Text style={styles.cellMono}>{ins.unitCost.toFixed(2)}</Text>
                            </View>
                            <View style={styles.colBudget}>
                                <Text style={styles.cellBudget}>{ins.budgetNet.toLocaleString()}</Text>
                            </View>
                            <View style={styles.colPerf}>
                                <Text style={{ fontSize: 8, color: '#64748B', textAlign: 'right' }}>{ins.metrics.clics.toLocaleString()}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* --- FINANCIAL BREAKDOWN --- */}
                <View style={styles.totalsSection} wrap={false}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Net Média</Text>
                        <Text style={styles.totalValue}>{totalNetMedia.toLocaleString()} MAD</Text>
                    </View>
                    {plan.showCommission !== false && (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Commission Agence ({tauxComm}%)</Text>
                            <Text style={styles.totalValue}>{commissionAgence.toLocaleString()} MAD</Text>
                        </View>
                    )}
                    {plan.showFees !== false && (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Frais Techniques ({tauxFrais}%)</Text>
                            <Text style={styles.totalValue}>{fraisTechniques.toLocaleString()} MAD</Text>
                        </View>
                    )}
                    <View style={styles.grandTotalRow}>
                        <Text style={styles.grandTotalLabel}>Total Investissement HT</Text>
                        <Text style={styles.grandTotalValue}>{totalInvestiHT.toLocaleString()} MAD</Text>
                    </View>
                </View>

                {/* --- TECH SPECS --- */}
                <Text style={[styles.sectionHeader, { marginTop: 20 }]} break>Spécifications Techniques</Text>
                <View style={styles.techGrid}>
                    {insertionsWithMetrics.map((ins: any, i: number) => (
                        <View key={i} style={styles.techCard} wrap={false}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold', color: PRIMARY, marginBottom: 4 }}>{ins.format}</Text>
                            <Text style={styles.techLabel}>Dimensions</Text>
                            <Text style={styles.techVal}>{ins.techSpecs.specsDimensions || '-'}</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                                <View>
                                    <Text style={styles.techLabel}>Poids Max</Text>
                                    <Text style={styles.techVal}>{ins.techSpecs.specsMaxWeight || '-'}</Text>
                                </View>
                                <View>
                                    <Text style={styles.techLabel}>Format</Text>
                                    <Text style={styles.techVal}>{ins.techSpecs.specsFileType || '-'}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* --- FOOTER --- */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>{plan.nomPlan || 'Plan Média'}</Text>
                    <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (
                        `${pageNumber} / ${totalPages}`
                    )} fixed />
                    <Text style={styles.footerText}>{new Date().toLocaleDateString()}</Text>
                </View>
            </Page>
        </Document>
    );
};
