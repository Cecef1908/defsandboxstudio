"use client";

import React from "react";
import AppShell from "../components/AppShell";
import { RequireAuth } from "../lib/AuthContext";

export default function StudioLayoutRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <AppShell context="studio">
        {children}
      </AppShell>
    </RequireAuth>
  );
}
