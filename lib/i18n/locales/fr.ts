// ============================================================================
// TRADUCTIONS FRANÇAISES
// ============================================================================

export const fr = {
  // Navigation
  nav: {
    home: 'Accueil',
    admin: 'Administration',
    media: 'Studio Média',
    social: 'Social Media',
    web: 'Web Analytics',
    projects: 'Gestion Projets',
  },

  // Modules
  modules: {
    admin: {
      title: 'Administration',
      description: 'Gestion clients, utilisateurs et configuration',
    },
    media: {
      title: 'Studio Média',
      description: 'Planification et gestion des campagnes média',
    },
    social: {
      title: 'Social Media',
      description: 'Calendrier éditorial et analytics social',
    },
    web: {
      title: 'Web Analytics',
      description: 'Suivi performance web et SEO',
    },
    projects: {
      title: 'Gestion Projets',
      description: 'Planning, tâches et collaboration',
    },
  },

  // Common
  common: {
    select: 'Sélectionner',
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
    edit: 'Modifier',
    create: 'Créer',
    search: 'Rechercher',
    filter: 'Filtrer',
    export: 'Exporter',
    import: 'Importer',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    confirm: 'Confirmer',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    close: 'Fermer',
    view: 'Voir',
    download: 'Télécharger',
    upload: 'Téléverser',
    comingSoon: 'Bientôt',
    access: 'Accéder',
  },

  // Auth
  auth: {
    login: 'Connexion',
    logout: 'Déconnexion',
    email: 'Email',
    password: 'Mot de passe',
    forgotPassword: 'Mot de passe oublié ?',
    signIn: 'Se connecter',
    signUp: 'S\'inscrire',
    signOut: 'Se déconnecter',
    welcome: 'Bienvenue',
    connectToYourSpace: 'Connectez-vous à votre espace',
  },

  // Dashboard
  dashboard: {
    overview: 'Vue d\'ensemble',
    quickActions: 'Actions rapides',
    stats: 'Statistiques',
    recentActivity: 'Activité récente',
  },

  // Admin
  admin: {
    clients: 'Clients',
    advertisers: 'Annonceurs',
    brands: 'Marques',
    contacts: 'Contacts',
    users: 'Utilisateurs',
    settings: 'Configuration',
    manageClients: 'Gérer les clients',
    manageAdvertisers: 'Gérer les annonceurs',
    manageBrands: 'Gérer les marques',
    manageUsers: 'Gérer les utilisateurs',
    activeClients: 'Clients actifs',
  },

  // Media
  media: {
    newPlan: 'Nouveau Plan',
    plans: 'Plans Média',
    portfolio: 'Portefeuille',
    reports: 'Bilans & Rapports',
    aiPlanner: 'AI Media Planner',
    activePlans: 'Plans média actifs',
    totalBudget: 'Budget total',
    insertions: 'Insertions',
    activeCampaigns: 'Campagnes en cours',
    createNewPlan: 'Créer un nouveau plan de campagne',
    viewPlans: 'Consulter tous les plans média',
    globalView: 'Vue globale de tous les projets',
    analytics: 'Analyses et performances',
    aiAssistant: 'Assistant IA pour la planification',
  },

  // Stats
  stats: {
    activeModules: 'Modules Actifs',
    yourRole: 'Votre Rôle',
    comingSoon: 'À Venir',
    mediaAdminOperational: 'Media & Admin opérationnels',
    accessByPermissions: 'Accès selon permissions',
    modulesInDevelopment: 'Modules en développement',
  },

  // Roles
  roles: {
    super_admin: 'Super Administrateur',
    admin: 'Administrateur',
    manager: 'Manager',
    media_buyer: 'Acheteur Média',
    social_manager: 'Community Manager',
    web_analyst: 'Analyste Web',
    project_lead: 'Chef de Projet',
    analyst: 'Analyste',
    client: 'Client',
  },

  // Messages
  messages: {
    selectModule: 'Sélectionnez un module',
    accessWorkspaces: 'Accédez aux différents espaces de travail de la plateforme',
    platformCollaborative: 'Plateforme collaborative multi-modules',
  },
} as const;

export type Translations = typeof fr;
