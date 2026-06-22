"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportCsvButton({
  filename,
  headers,
  rows,
}: {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
}) {
  function exportCsv() {
    const esc = (cell: string | number) => {
      const s = String(cell);
      return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button size="sm" variant="subtle" onClick={exportCsv} data-testid="export-csv">
      <Download size={14} /> Export CSV
    </Button>
  );
}
