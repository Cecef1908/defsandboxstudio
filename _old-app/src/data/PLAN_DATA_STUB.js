// Ceci simule le Plan Média EMSI 2025, structuré pour être facilement consommé par React.
// Il ne contient AUCUNE logique de calcul ou de rendu.

const PLAN_DATA = {
  // --- SYNTHÈSE GLOBALE (Issue de mediaplans.csv et clients.csv) ---
  plan_id: "plan_emsi_2025",
  client_name: "Honoris EMSI",
  plan_name: "Plan Annuel 2025",
  dates: "01/01/2025 - 31/12/2025",
  
  // Ces totaux doivent être précis et calculés une seule fois.
  total_budget_ht: 1245800, 
  total_impressions_est: 85400000, // Exemple basé sur le PDF
  total_clicks_est: 1350000, // Exemple basé sur le PDF

  // --- COULEURS pour les graphiques (Chart Colors) ---
  colors: {
    meta: '#0668E1',
    google: '#EA4335',
    youtube: '#FF0000',
    tiktok: '#000000',
    premium: '#26A96C', 
    primary: '#FB660B', // Orange
    secondary: '#1E293B',
    grid: '#E2E8F0'
  },

  // --- DÉTAIL DES INSERTIONS (Basé sur inesrtions.csv + jointures des autres CSV) ---
  insertions: [
    {
      id: 'ins_emsi_01',
      channel_id: 'meta',
      channel_name: 'Meta Ads',
      format_name: 'Instagram Reels',
      objective: 'Notoriété - Always ON PE',
      buying_model_name: 'CPM',
      buying_model_unit: 'Impressions',
      budget: 45000, // MAD
      unit_cost: 21.40, // MAD
      volume_est: 2100000,
      color: '#0668E1'
    },
    {
      id: 'ins_emsi_02',
      channel_id: 'google',
      channel_name: 'Google Ads',
      format_name: 'Google Search RSA',
      objective: 'Trafic Qualifié',
      buying_model_name: 'CPC',
      buying_model_unit: 'Clics',
      budget: 22000, // MAD
      unit_cost: 4.00, // MAD
      volume_est: 5500,
      color: '#EA4335'
    },
    // Ajout d'une ligne pour simuler un type d'achat différent
    {
      id: 'ins_emsi_03',
      channel_id: 'premium',
      channel_name: 'Premium Publishers',
      format_name: 'Habillage Site',
      objective: 'Image de Marque',
      buying_model_name: 'Forfait',
      buying_model_unit: 'Forfait',
      budget: 100000, // MAD
      unit_cost: 0, // N/A pour le forfait
      volume_est: 0,
      color: '#26A96C'
    },
  ],

  // --- DONNÉES AGRÉGÉES POUR GRAPHIQUES (Pré-calculées pour la simplicité) ---
  budget_by_channel: [
    { name: 'Meta', value: 45000, fill: '#0668E1' },
    { name: 'Google', value: 22000, fill: '#EA4335' },
    { name: 'Premium', value: 100000, fill: '#26A96C' },
    // A compléter avec le reste des 1.2M MAD si on veut que le total corresponde
    { name: 'Autres', value: 1245800 - 45000 - 22000 - 100000, fill: '#64748B' },
  ],
  budget_by_objective: [
    { name: 'Notoriété', value: 45000, fill: '#000000' }, 
    { name: 'Trafic / Perf', value: 22000, fill: '#FB660B' }, 
    { name: 'Branding', value: 100000, fill: '#6366f1' }, 
    { name: 'Autres', value: 1245800 - 45000 - 22000 - 100000, fill: '#F1F5F9' },
  ],
};

// IMPORTANT: Le code React Live doit exposer le PLAN_DATA au reste du scope.
// Nous allons adapter le DashboardRenderer pour cela. Pour l'instant, on l'exporte.
export default PLAN_DATA;