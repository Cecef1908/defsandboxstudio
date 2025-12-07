import { ReactNode } from 'react';
import AppShell from '@/components/AppShell';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell context="admin">
      {children}
    </AppShell>
  );
}
