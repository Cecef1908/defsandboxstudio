"use client";

import React from "react";
import AppShell from "../components/AppShell";
import { RequireAuth } from "../lib/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth requiredRole={['admin', 'super_admin']}>
      <AppShell context="admin">
        {children}
      </AppShell>
    </RequireAuth>
  );
}
