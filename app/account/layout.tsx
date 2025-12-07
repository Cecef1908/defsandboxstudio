import { ReactNode } from 'react';

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#020617]">
      {children}
    </div>
  );
}
