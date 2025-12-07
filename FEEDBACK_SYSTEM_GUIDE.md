# 🎨 GUIDE DU SYSTÈME DE FEEDBACK UX

## ✅ COMPOSANTS CRÉÉS

1. **Toast** - Notifications flottantes (Succès, Erreur, Info, Warning)
2. **Modal** - Fenêtres modales avec backdrop blur
3. **ConfirmDialog** - Dialogues de confirmation pour actions destructives
4. **Skeleton** - États de chargement élégants

---

## 📝 UTILISATION

### **1. TOASTS (Notifications)**

```typescript
'use client';

import { useToast } from '@/components/ui';

export default function MyComponent() {
  const toast = useToast();

  const handleSave = () => {
    // Succès
    toast.success('Enregistré !', 'Le client a été créé avec succès');
    
    // Erreur
    toast.error('Erreur', 'Impossible de sauvegarder les données');
    
    // Info
    toast.info('Information', 'Les données sont synchronisées');
    
    // Warning
    toast.warning('Attention', 'Cette action est irréversible');
  };

  return (
    <button onClick={handleSave}>
      Sauvegarder
    </button>
  );
}
```

**Options :**
- `title` : Titre du toast (obligatoire)
- `message` : Message détaillé (optionnel)
- `duration` : Durée en ms (défaut: 5000)

---

### **2. MODAL (Fenêtre modale)**

```typescript
'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui';

export default function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Ouvrir la modale
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Créer un client"
        size="md" // sm | md | lg | xl | full
      >
        <form>
          {/* Contenu de la modale */}
          <input type="text" placeholder="Nom du client" />
          <button type="submit">Créer</button>
        </form>
      </Modal>
    </>
  );
}
```

**Props :**
- `isOpen` : État d'ouverture (boolean)
- `onClose` : Fonction de fermeture
- `title` : Titre (optionnel)
- `size` : Taille (sm, md, lg, xl, full)
- `showCloseButton` : Afficher le bouton X (défaut: true)

---

### **3. CONFIRM DIALOG (Confirmation)**

```typescript
'use client';

import { useState } from 'react';
import { ConfirmDialog, useToast } from '@/components/ui';

export default function MyComponent() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Appel API
      await deleteClient(clientId);
      toast.success('Supprimé', 'Le client a été supprimé');
      setShowConfirm(false);
    } catch (error) {
      toast.error('Erreur', 'Impossible de supprimer le client');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>
        Supprimer
      </button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer le client ?"
        message="Cette action est irréversible. Toutes les données associées seront perdues."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger" // danger | warning | info
        isLoading={isDeleting}
      />
    </>
  );
}
```

**Variants :**
- `danger` : Rouge (suppression)
- `warning` : Ambre (avertissement)
- `info` : Bleu (information)

---

### **4. SKELETON (Chargement)**

```typescript
import { Skeleton, SkeletonCard, SkeletonTable, SkeletonStat } from '@/components/ui';

export default function MyComponent({ isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-6">
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
        </div>

        {/* Table */}
        <SkeletonTable rows={5} />

        {/* Cards */}
        <div className="grid grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Custom */}
        <Skeleton variant="text" width="60%" height="20px" />
        <Skeleton variant="circular" width="48px" height="48px" />
        <Skeleton variant="rectangular" height="200px" />
      </div>
    );
  }

  return <div>{/* Contenu réel */}</div>;
}
```

**Presets disponibles :**
- `SkeletonStat` : Pour les cartes de statistiques
- `SkeletonTable` : Pour les tableaux
- `SkeletonCard` : Pour les cartes génériques
- `Skeleton` : Composant de base personnalisable

---

## 🎯 EXEMPLES CONCRETS

### **Exemple 1 : Formulaire de création**

```typescript
'use client';

import { useState } from 'react';
import { Modal, useToast } from '@/components/ui';

export default function CreateClientButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Appel API
      await createClient(formData);
      toast.success('Client créé !', 'Le client a été ajouté avec succès');
      setIsOpen(false);
    } catch (error) {
      toast.error('Erreur', 'Impossible de créer le client');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Nouveau client
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Créer un client">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Nom" required />
          <input type="email" placeholder="Email" required />
          
          <div className="flex gap-3">
            <button type="button" onClick={() => setIsOpen(false)}>
              Annuler
            </button>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
```

### **Exemple 2 : Liste avec chargement**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { SkeletonTable } from '@/components/ui';

export default function ClientsList() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClients().then(data => {
      setClients(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <SkeletonTable rows={10} />;
  }

  return (
    <table>
      {clients.map(client => (
        <tr key={client.id}>
          <td>{client.name}</td>
          <td>{client.email}</td>
        </tr>
      ))}
    </table>
  );
}
```

---

## ✨ CARACTÉRISTIQUES

### **Design Premium**
- ✅ Glassmorphism (backdrop-blur)
- ✅ Animations fluides (slide-in, fade-in, zoom-in)
- ✅ Couleurs cohérentes avec le design system
- ✅ Responsive (mobile-first)

### **Accessibilité**
- ✅ Fermeture avec Escape
- ✅ Focus trap dans les modales
- ✅ ARIA labels
- ✅ Contraste suffisant

### **UX**
- ✅ Auto-dismiss des toasts (5s par défaut)
- ✅ Blocage du scroll body quand modale ouverte
- ✅ Loading states pour les actions async
- ✅ Feedback visuel immédiat

---

**SYSTÈME DE FEEDBACK PRÊT !** 🎉

Tous les composants sont intégrés et prêts à l'emploi dans toute l'application.
