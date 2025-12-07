"use client";

import React, { useState } from "react";
import { 
  Upload, FileSpreadsheet, ArrowRight, BrainCircuit, 
  Table as TableIcon, List, CheckCircle, AlertCircle 
} from "lucide-react";
import Papa from "papaparse";
import Link from "next/link";

// Types for our detected structures
type DetectedSection = {
  id: string;
  title?: string;
  type: "key-value" | "table" | "unknown";
  data: any[];
  headers?: string[]; // For tables
  confidence: number;
};

export default function SmartImportPage() {
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [sections, setSections] = useState<DetectedSection[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // --- SMART PARSING LOGIC ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRawFile(file);
    analyzeFile(file);
  };

  const analyzeFile = (file: File) => {
    setAnalyzing(true);
    Papa.parse(file, {
      complete: (results) => {
        processRawData(results.data as string[][]);
        setAnalyzing(false);
      },
      skipEmptyLines: false // Keep empty lines to detect section breaks
    });
  };

  const processRawData = (rows: string[][]) => {
    const detectedSections: DetectedSection[] = [];
    let currentBuffer: string[][] = [];
    let sectionTitle = "Section 1";

    // Helper to finalize a buffer into a section
    const analyzeBuffer = (buffer: string[][], title: string) => {
      if (buffer.length === 0) return;

      // Heuristic: Is it a table or key-value?
      // If row 0 has many columns and subsequent rows have similar length -> Table
      // If rows are mostly [Key, Value] -> Key-Value
      
      // Clean empty columns at the end
      const cleanBuffer = buffer.map(r => {
        // Remove trailing empty strings
        let i = r.length - 1;
        while (i >= 0 && !r[i]?.trim()) i--;
        return r.slice(0, i + 1);
      }).filter(r => r.length > 0); // Remove fully empty rows

      if (cleanBuffer.length === 0) return;

      // Check for Table Structure
      // Assume header is first row of clean buffer
      const headerRow = cleanBuffer[0];
      const isTable = cleanBuffer.length > 1 && cleanBuffer.slice(1).every(r => r.length >= headerRow.length - 2); // Loose tolerance

      if (isTable && headerRow.length > 2) {
        detectedSections.push({
          id: Math.random().toString(36).substr(2, 9),
          title: title || "Tableau Détecté",
          type: "table",
          headers: headerRow,
          data: cleanBuffer.slice(1).map(row => {
            const obj: any = {};
            headerRow.forEach((h, i) => obj[h || `col_${i}`] = row[i]);
            return obj;
          }),
          confidence: 0.9
        });
      } else {
        // Treat as Key-Value or Metadata
        const kvData = cleanBuffer.map(row => ({ key: row[0], value: row.slice(1).join(", ") }));
        detectedSections.push({
          id: Math.random().toString(36).substr(2, 9),
          title: title || "Métadonnées",
          type: "key-value",
          data: kvData,
          confidence: 0.7
        });
      }
    };

    // Loop through rows to split by empty blocks or headers
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const isEmpty = row.every(cell => !cell || !cell.trim());

      if (isEmpty) {
        // End of a section
        if (currentBuffer.length > 0) {
          analyzeBuffer(currentBuffer, sectionTitle);
          currentBuffer = [];
          sectionTitle = `Section ${detectedSections.length + 1}`;
        }
      } else {
        // Potential Title Detection: Single cell non-empty?
        const nonEmptyCells = row.filter(c => c && c.trim());
        if (nonEmptyCells.length === 1 && currentBuffer.length === 0) {
            sectionTitle = nonEmptyCells[0];
        } else {
            currentBuffer.push(row);
        }
      }
    }
    // Final buffer
    if (currentBuffer.length > 0) analyzeBuffer(currentBuffer, sectionTitle);

    setSections(detectedSections);
    if (detectedSections.length > 0) setActiveSection(detectedSections[0].id);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BrainCircuit className="text-indigo-500" size={32} />
              Smart Import <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full border border-indigo-500/30">BETA</span>
            </h1>
            <p className="text-slate-400 mt-2 max-w-2xl">
              Ce module analyse des fichiers CSV/Excel non-structurés (comme des plans médias), 
              identifie les différentes sections (tableaux, métadonnées) et vous aide à les mapper vers votre base de données.
            </p>
          </div>
          <Link href="/" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm">Retour</Link>
        </div>

        {/* UPLOAD ZONE */}
        {!rawFile && (
          <div className="border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center hover:border-indigo-500/50 hover:bg-slate-900/50 transition-all group">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Upload className="text-slate-400 group-hover:text-indigo-400" size={28} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Glissez votre Plan Média ici</h3>
            <p className="text-slate-500 mb-6">Format CSV supporté. Le fichier sera découpé intelligemment.</p>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload} 
              className="hidden" 
              id="file-upload"
            />
            <label 
              htmlFor="file-upload" 
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg cursor-pointer transition-colors"
            >
              Sélectionner un fichier
            </label>
          </div>
        )}

        {/* ANALYSIS UI */}
        {rawFile && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT: DETECTED SECTIONS */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                  Structure Détectée
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded-full text-white">{sections.length}</span>
                </h3>
                <div className="space-y-2">
                  {sections.map(section => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3
                        ${activeSection === section.id 
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20" 
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        }
                      `}
                    >
                      {section.type === 'table' ? <TableIcon size={16} /> : <List size={16} />}
                      <div className="truncate">
                        <div className="font-medium text-sm truncate">{section.title}</div>
                        <div className="text-[10px] opacity-70">{section.type === 'table' ? `${section.data.length} lignes` : 'Clé-Valeur'}</div>
                      </div>
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={() => { setRawFile(null); setSections([]); }}
                  className="mt-4 w-full py-2 text-xs text-red-400 hover:text-red-300 border border-red-900/30 bg-red-900/10 rounded-lg"
                >
                  Recommencer
                </button>
              </div>
            </div>

            {/* MIDDLE: PREVIEW & MAPPING */}
            <div className="lg:col-span-9">
              {activeSection && (() => {
                const section = sections.find(s => s.id === activeSection);
                if (!section) return null;

                return (
                  <div className="space-y-6">
                    {/* SECTION HEADER */}
                    <div className="flex items-center justify-between bg-slate-900 p-6 rounded-xl border border-slate-800">
                      <div>
                        <h2 className="text-xl font-bold text-white mb-1">{section.title}</h2>
                        <p className="text-sm text-slate-400 flex items-center gap-2">
                          Type identifié : 
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${section.type === 'table' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {section.type === 'table' ? 'Tableau de Données' : 'Liste de Propriétés'}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg">
                          Ignorer cette section
                        </button>
                        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg flex items-center gap-2">
                          Mapper vers la BDD <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>

                    {/* DATA VIEW */}
                    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
                      {section.type === 'table' ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-slate-950 text-slate-400">
                              <tr>
                                {section.headers?.map((h, i) => (
                                  <th key={i} className="px-6 py-3 border-b border-slate-800 whitespace-nowrap font-mono text-xs">{h || `Col ${i}`}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                              {section.data.slice(0, 10).map((row, i) => (
                                <tr key={i} className="hover:bg-slate-800/50">
                                  {section.headers?.map((h, j) => (
                                    <td key={j} className="px-6 py-3 text-slate-300 whitespace-nowrap max-w-[200px] truncate">
                                      {String(row[h || `col_${j}`] || "")}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {section.data.length > 10 && (
                            <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/50">
                              + {section.data.length - 10} lignes masquées
                            </div>
                          )}
                        </div>
                      ) : (
                        // KEY-VALUE VIEW
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {section.data.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
                              <div className="min-w-[4px] h-full bg-amber-500/50 rounded-full" />
                              <div className="overflow-hidden">
                                <div className="text-xs text-slate-500 font-mono uppercase mb-1">{item.key || "Info"}</div>
                                <div className="text-sm text-white truncate">{item.value}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300 flex items-start gap-3">
                       <AlertCircle className="shrink-0 mt-0.5" size={18} />
                       <div>
                         <p className="font-bold mb-1">En attente de schéma cible</p>
                         <p className="opacity-80">
                           Une fois que vous aurez fourni la structure de la base de données (Collections et Champs), 
                           vous pourrez associer les colonnes de ce tableau aux champs de votre base.
                         </p>
                       </div>
                    </div>

                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
