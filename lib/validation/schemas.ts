// ============================================================================
// VALIDATION SCHEMAS - Zod
// ============================================================================
// ⚠️ MAPPING EXACT avec les types TypeScript et la structure Firebase
// ============================================================================

import { z } from 'zod';

// ============================================================================
// CLIENTS
// ============================================================================

export const clientSchema = z.object({
  // ID Firestore (généré automatiquement, non requis en création)
  id: z.string().optional(),
  
  // Custom ID (ex: CL_LOREAL) - Généré automatiquement si non fourni
  client_id: z.string().min(1, 'ID client requis'),
  
  // Champs obligatoires
  name: z.string().min(1, 'Nom requis').max(200, 'Nom trop long'),
  type: z.enum(['direct', 'agency', 'holding'], {
    message: 'Type invalide'
  }),
  
  // Champs optionnels
  contact_email: z.string().email('Email invalide').optional().or(z.literal('')),
  vat_number: z.string().optional(),
  billing_address: z.string().optional(),
  
  // Frais d'agence par défaut (optionnel)
  default_agency_fees: z.object({
    commission_rate: z.number().min(0).max(100),
    management_fee_type: z.enum(['percent', 'flat']),
    management_fee_value: z.number().min(0),
    additional_fees: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(['percent', 'flat']),
      value: z.number().min(0),
      description: z.string().optional(),
    })).optional(),
  }).optional(),
  
  // Timestamps (gérés automatiquement par Firebase)
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// ============================================================================
// ADVERTISERS
// ============================================================================

export const advertiserSchema = z.object({
  id: z.string().optional(),
  advertiser_id: z.string().min(1, 'ID annonceur requis'),
  name: z.string().min(1, 'Nom requis').max(200, 'Nom trop long'),
  
  // FK obligatoire vers Client
  client_id: z.string().min(1, 'Client requis'),
  
  contact_email: z.string().email('Email invalide').optional().or(z.literal('')),
  createdAt: z.any().optional(),
});

export type AdvertiserFormData = z.infer<typeof advertiserSchema>;

// ============================================================================
// BRANDS
// ============================================================================

export const brandSchema = z.object({
  id: z.string().optional(),
  brand_id: z.string().min(1, 'ID marque requis'),
  name: z.string().min(1, 'Nom requis').max(200, 'Nom trop long'),
  
  // FK obligatoire vers Client
  client_id: z.string().min(1, 'Client requis'),
  
  // FK optionnelle vers Advertiser
  advertiser_id: z.string().optional(),
  
  createdAt: z.any().optional(),
});

export type BrandFormData = z.infer<typeof brandSchema>;

// ============================================================================
// CONTACTS
// ============================================================================

export const contactSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nom requis').max(200, 'Nom trop long'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  job_title: z.string().optional(),
  
  // FK optionnelles
  linked_client: z.string().optional(),
  linked_advertiser: z.string().optional(),
  linked_brand: z.string().optional(),
  
  createdAt: z.any().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Valider des données avec un schéma Zod
 * @returns { success: boolean, data?: T, errors?: Record<string, string> }
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true as const, data: result.data };
  }
  
  // Transformer les erreurs Zod en objet clé-valeur
  const errors: Record<string, string> = {};
  result.error.issues.forEach((err: any) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  
  return { success: false as const, errors };
}
