// ============================================================================
// THÈMES PERSONNALISÉS - Charte graphique SandBox
// ============================================================================

export interface CustomTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    // Couleurs principales
    primary: string;
    secondary: string;
    accent: string;
    
    // Backgrounds
    bg: {
      main: string;
      card: string;
      hover: string;
    };
    
    // Texte
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    
    // Bordures
    border: {
      default: string;
      hover: string;
    };
    
    // États
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  
  // Classes Tailwind pré-générées
  classes: {
    gradient: string;
    cardBg: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
  };
}

// ============================================================================
// THÈME 1 : SANDBOX (Charte officielle)
// ============================================================================

export const SANDBOX_THEME: CustomTheme = {
  id: 'sandbox',
  name: 'SandBox',
  description: 'Charte graphique officielle SandBox',
  colors: {
    primary: '#96C9F0',      // Light Sky Blue - Performance Marketing
    secondary: '#FB660B',    // Orange - Brand Strategy
    accent: '#26A96C',       // Jade - Digital Product
    
    bg: {
      main: '#FBF9F5',       // Baby Powder - Fond général
      card: '#FFFFFF',
      hover: '#F5F3EF',
    },
    
    text: {
      primary: '#000000',    // Cobalt Black - Texte principal
      secondary: '#4A4A4A',
      muted: '#9CA3AF',
    },
    
    border: {
      default: '#E5E7EB',
      hover: '#D1D5DB',
    },
    
    success: '#26A96C',      // Jade
    warning: '#FDCA40',      // Sunglow
    error: '#EF4444',
    info: '#96C9F0',         // Light Sky Blue
  },
  
  classes: {
    gradient: 'from-[#96C9F0] to-[#FB660B]',
    cardBg: 'bg-white border border-gray-200',
    textPrimary: 'text-black',
    textSecondary: 'text-gray-600',
    border: 'border-gray-200',
  },
};

// ============================================================================
// THÈME 2 : DARK (Mode sombre élégant)
// ============================================================================

export const DARK_THEME: CustomTheme = {
  id: 'dark',
  name: 'Dark',
  description: 'Mode sombre élégant (actuel)',
  colors: {
    primary: '#6366F1',      // Indigo
    secondary: '#8B5CF6',    // Violet
    accent: '#EC4899',       // Pink
    
    bg: {
      main: '#020617',       // Slate 950
      card: '#1E293B',       // Slate 800
      hover: '#334155',      // Slate 700
    },
    
    text: {
      primary: '#FFFFFF',
      secondary: '#CBD5E1',  // Slate 300
      muted: '#64748B',      // Slate 500
    },
    
    border: {
      default: '#334155',    // Slate 700
      hover: '#475569',      // Slate 600
    },
    
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  classes: {
    gradient: 'from-indigo-500 to-violet-600',
    cardBg: 'bg-slate-900/50 backdrop-blur-sm border border-slate-800',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-300',
    border: 'border-slate-800',
  },
};

// ============================================================================
// THÈME 3 : PERFORMANCE (Bleu ciel - Performance Marketing)
// ============================================================================

export const PERFORMANCE_THEME: CustomTheme = {
  id: 'performance',
  name: 'Performance',
  description: 'Thème Performance Marketing (Bleu ciel)',
  colors: {
    primary: '#96C9F0',      // Light Sky Blue
    secondary: '#3B82F6',    // Blue
    accent: '#26A96C',       // Jade
    
    bg: {
      main: '#F8FAFC',       // Slate 50
      card: '#FFFFFF',
      hover: '#F1F5F9',      // Slate 100
    },
    
    text: {
      primary: '#0F172A',    // Slate 900
      secondary: '#475569',  // Slate 600
      muted: '#94A3B8',      // Slate 400
    },
    
    border: {
      default: '#E2E8F0',    // Slate 200
      hover: '#CBD5E1',      // Slate 300
    },
    
    success: '#26A96C',
    warning: '#FDCA40',
    error: '#EF4444',
    info: '#96C9F0',
  },
  
  classes: {
    gradient: 'from-[#96C9F0] to-[#3B82F6]',
    cardBg: 'bg-white border border-slate-200',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    border: 'border-slate-200',
  },
};

// ============================================================================
// LISTE DES THÈMES DISPONIBLES
// ============================================================================

export const AVAILABLE_THEMES: CustomTheme[] = [
  DARK_THEME,           // Par défaut (actuel)
  SANDBOX_THEME,        // Charte officielle
  PERFORMANCE_THEME,    // Bleu ciel
];

// ============================================================================
// HELPERS
// ============================================================================

export function getThemeById(themeId: string): CustomTheme {
  return AVAILABLE_THEMES.find(t => t.id === themeId) || DARK_THEME;
}

export function getThemeClasses(themeId: string) {
  const theme = getThemeById(themeId);
  return theme.classes;
}
