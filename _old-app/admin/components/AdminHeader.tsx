"use client";
import React from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  accentColorClass: string; // "text-emerald-500"
  buttonColorClass: string; // "bg-emerald-600 hover:bg-emerald-500"
}

export function AdminHeader({ 
  title, subtitle, icon, onAdd, addLabel, accentColorClass, buttonColorClass 
}: AdminHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link href="/admin" className="text-slate-500 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className={accentColorClass}>{icon}</div>
            {title}
          </h1>
        </div>
        <p className="text-slate-400 ml-7">
          {subtitle}
        </p>
      </div>
      {onAdd && (
        <button 
          onClick={onAdd}
          className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 font-medium shadow-lg ${buttonColorClass}`}
        >
          <Plus size={18} /> {addLabel || "Ajouter"}
        </button>
      )}
    </div>
  );
}
