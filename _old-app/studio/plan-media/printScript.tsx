import React from 'react';
import { createRoot } from 'react-dom/client';
import MediaPlanPrintView from './MediaPlanPrintView';
import { Theme } from "../../types/agence";

export const printMediaPlan = (data: any, theme: (Theme & { logoUrl?: string }) | null) => {
    // 1. Open a new window
    const printWindow = window.open('', '_blank', 'width=1100,height=800');
    if (!printWindow) {
        alert("Veuillez autoriser les pop-ups pour imprimer.");
        return;
    }

    // 2. Prepare the document structure
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Impression Plan Média</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                @page {
                    size: A4;
                    margin: 0;
                }
                body {
                    margin: 0;
                    padding: 0;
                    background: white;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                /* Custom Reset for Print */
                .print-container {
                    width: 210mm;
                    min-height: 297mm;
                    margin: 0 auto;
                    background: white;
                    padding: 15mm; /* Safe margin */
                    box-sizing: border-box;
                }
                @media print {
                    .print-container {
                        width: 100%;
                        padding: 10mm;
                        margin: 0;
                        box-shadow: none;
                    }
                    body {
                        background: white;
                    }
                }
                
                /* Utility utilities */
                .page-break { page-break-before: always; }
                .no-break { break-inside: avoid; }
            </style>
        </head>
        <body>
            <div id="print-root"></div>
        </body>
        </html>
    `);

    printWindow.document.close();

    // 3. Render the React component into the new window
    const container = printWindow.document.getElementById('print-root');
    if (container) {
        const root = createRoot(container);
        
        // We wrap in a strict A4 container
        root.render(
            <div className="print-container">
                <MediaPlanPrintView data={data} theme={theme} />
            </div>
        );

        // 4. Wait for content to render and fonts/images to load before printing
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            // Optional: close after print
            // printWindow.close(); 
        }, 1000);
    }
};
