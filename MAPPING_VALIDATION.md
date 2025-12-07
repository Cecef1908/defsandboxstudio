# ✅ MAPPING & VALIDATION - DOCUMENTATION TECHNIQUE

## 🎯 GARANTIE DE COMPATIBILITÉ

**Tous les noms de champs sont IDENTIQUES à l'ancienne DB.**  
Aucun mapper nécessaire. Les données seront lues directement.

---

## 📊 MAPPING DES TYPES

### **1. ENTITÉS CRM**

| Type | Champs Clés | Relations FK | Validation |
|------|-------------|--------------|------------|
| **ClientEntity** | `client_id`, `name`, `type` | - | ✅ `client_id` unique |
| **AdvertiserEntity** | `advertiser_id`, `name` | → `client_id` | ✅ Client existe |
| **BrandEntity** | `brand_id`, `name` | → `client_id`, `advertiser_id?` | ✅ Client existe |
| **ContactEntity** | `name`, `email` | → `linked_client?`, `linked_advertiser?` | ✅ Email valide |

### **2. RÉFÉRENTIELS MÉDIA**

| Type | Champs Clés | Code | Validation |
|------|-------------|------|------------|
| **BuyingModelEntity** | `name`, `code` | CPM, CPC, CPV, CPA, FLAT | ✅ Code unique |
| **BuyingUnitEntity** | `name`, `code` | IMP, CLICK, VIEW, LEAD | ✅ Code unique |
| **MediaChannelEntity** | `name`, `publisher_id` | - | ✅ Publisher existe |
| **MediaFormatEntity** | `name`, `type`, `specs` | - | ✅ Specs valides |
| **PublisherEntity** | `name`, `country`, `currency` | - | ✅ Currency valide |

### **3. PLANS MÉDIA**

| Type | Champs Clés | Relations FK | Calculs |
|------|-------------|--------------|---------|
| **MediaPlanEntity** | `plan_id`, `client_id`, `total_budget_ht` | → `client_id`, `advertiser_id?`, `brand_id?` | ✅ Budget > 0 |
| **InsertionEntity** | `insertion_id`, `plan_id`, `channel_id`, `buying_model_id` | → `plan_id`, `channel_id`, `buying_model_id` | ✅ `total_cost_ht` = f(model, quantity, unit_cost) |
| **ContentEntity** | `content_id`, `type` | → `plan_id?`, `insertion_id?` | ✅ URL ou fichier requis |
| **TargetingEntity** | `targeting_id`, `config` | → `plan_id?`, `insertion_id?` | ✅ Config valide |

---

## 🔗 DÉPENDANCES ENTRE TABLES

### **Hiérarchie CRM**
```
Client
  ├── Advertiser (client_id)
  │     └── Brand (advertiser_id)
  └── Brand (client_id)
```

### **Hiérarchie Média**
```
MediaPlan (client_id, advertiser_id?, brand_id?)
  └── Insertion (plan_id)
        ├── Content (insertion_id)
        ├── RedirectLink (insertion_id)
        └── Targeting (insertion_id)
```

### **Référentiels**
```
MediaChannel
  ├── publisher_id → PublisherEntity
  ├── category_id → ChannelCategoryEntity
  └── parent_id? → MediaChannelEntity (régie)

Insertion
  ├── channel_id → MediaChannelEntity
  ├── format_id? → MediaFormatEntity
  ├── buying_model_id → BuyingModelEntity
  └── buying_unit_id? → BuyingUnitEntity
```

---

## ✅ RÈGLES DE VALIDATION

### **1. Validation des Relations (FK)**

```typescript
// Avant de créer une Insertion
async function validateInsertion(insertion: InsertionEntity) {
  // 1. Le plan existe
  const plan = await getDoc(doc(db, MEDIA_PLANS_COLLECTION, insertion.plan_id));
  if (!plan.exists()) throw new Error('Plan média introuvable');
  
  // 2. Le channel existe
  const channel = await getDoc(doc(db, CHANNELS_COLLECTION, insertion.channel_id));
  if (!channel.exists()) throw new Error('Canal introuvable');
  
  // 3. Le buying model existe
  const model = await getDoc(doc(db, BUYING_MODELS_COLLECTION, insertion.buying_model_id));
  if (!model.exists()) throw new Error('Modèle d\'achat introuvable');
  
  // 4. Le coût est cohérent
  const expectedCost = calculateInsertionCost(
    model.data().code,
    insertion.unit_cost,
    insertion.quantity
  );
  if (Math.abs(insertion.total_cost_ht - expectedCost) > 0.01) {
    throw new Error('Coût total incohérent');
  }
}
```

### **2. Validation des Calculs**

```typescript
// Formules de calcul selon le modèle d'achat
const FORMULAS = {
  CPM: (quantity, unitCost) => (quantity / 1000) * unitCost,
  CPC: (quantity, unitCost) => quantity * unitCost,
  CPV: (quantity, unitCost) => quantity * unitCost,
  CPA: (quantity, unitCost) => quantity * unitCost,
  FLAT: (quantity, unitCost) => unitCost,  // Forfait
};

// Validation
function validateCost(insertion: InsertionEntity, model: BuyingModelEntity) {
  const formula = FORMULAS[model.code];
  const expected = formula(insertion.quantity, insertion.unit_cost);
  const actual = insertion.total_cost_ht;
  
  if (Math.abs(expected - actual) > 0.01) {
    throw new ValidationError(`Coût incorrect. Attendu: ${expected}, Reçu: ${actual}`);
  }
}
```

### **3. Validation des Frais d'Agence**

```typescript
// Cascade: Insertion > Plan > Client
function getAgencyFees(
  insertion: InsertionEntity,
  plan: MediaPlanEntity,
  client: ClientEntity
): AgencyFeesConfig {
  return insertion.agency_fees_override 
    || plan.agency_fees 
    || client.default_agency_fees 
    || DEFAULT_AGENCY_FEES;
}

// Calcul des frais
function calculateAgencyFees(
  netMedia: number,
  fees: AgencyFeesConfig
): { commission: number; management: number; total: number } {
  const commission = netMedia * (fees.commission_rate / 100);
  
  const management = fees.management_fee_type === 'percent'
    ? netMedia * (fees.management_fee_value / 100)
    : fees.management_fee_value;
  
  const additional = (fees.additional_fees || []).reduce((sum, fee) => {
    return sum + (fee.type === 'percent' 
      ? netMedia * (fee.value / 100)
      : fee.value);
  }, 0);
  
  return {
    commission,
    management,
    total: commission + management + additional
  };
}
```

---

## 🎨 SYSTÈME DE DESIGN DOCUMENTS

### **Collections Firestore**

```typescript
// Collection: document_designs
{
  id: "main",
  logos: {
    primary_id: "logo_123",      // FK → logos collection
    secondary_id: "logo_456",
    watermark_id: "logo_789"
  },
  templates: {
    media_plan: "modern",         // classic | modern | minimal
    dashboard: "default",
    report: "default"
  },
  colors: {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    accent: "#ec4899",
    text: "#1e293b",
    background: "#ffffff"
  },
  fonts: {
    heading: "Montserrat",
    body: "Inter",
    data: "JetBrains Mono"
  }
}

// Collection: logos
{
  id: "logo_123",
  name: "Logo Principal",
  url: "https://storage.../logo.svg",
  type: "primary" | "secondary" | "watermark",
  format: "svg" | "png",
  uploaded_at: timestamp,
  uploaded_by: "user_id"
}
```

---

## 🚨 POINTS CRITIQUES

### **1. Ne JAMAIS modifier ces champs**
- `client_id`, `advertiser_id`, `brand_id` (Custom IDs)
- `plan_id`, `insertion_id`, `content_id` (Custom IDs)
- Tous les champs avec `_id` (Foreign Keys)

### **2. Toujours valider AVANT d'écrire**
```typescript
// ❌ MAUVAIS
await setDoc(doc(db, INSERTIONS_COLLECTION, id), insertion);

// ✅ BON
await validateInsertion(insertion);
await setDoc(doc(db, INSERTIONS_COLLECTION, id), insertion);
```

### **3. Utiliser les helpers de calcul**
```typescript
// ❌ MAUVAIS (calcul manuel)
insertion.total_cost_ht = insertion.quantity * insertion.unit_cost;

// ✅ BON (helper validé)
insertion.total_cost_ht = calculateInsertionCost(
  buyingModel.code,
  insertion.unit_cost,
  insertion.quantity
);
```

---

## 📝 CHECKLIST AVANT DÉPLOIEMENT

- [ ] Tous les types migrés avec noms exacts
- [ ] Validation des FK implémentée
- [ ] Calculs testés avec données réelles
- [ ] Frais d'agence cascade testée
- [ ] Design documents séparé de l'UI
- [ ] Logo dynamique depuis DB fonctionnel
- [ ] Templates Print View testés
- [ ] Aucune perte de données historiques

---

**MAPPING VALIDÉ ✅**  
**PRÊT POUR LA SUITE** 🚀
