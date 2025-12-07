import { ReactNode } from 'react';
import AppShell from '@/components/AppShell';

export default function MediaLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell context="media">
      {children}
    </AppShell>
  );
}
