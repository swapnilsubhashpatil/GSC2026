/** @format */

import { Download } from 'lucide-react';
import { Button } from './Button';

interface ExportButtonProps {
  data: unknown[];
  filename: string;
  label?: string;
}

export function ExportButton({ data, filename, label = 'Export' }: ExportButtonProps) {
  function handleExport() {
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((h) => {
            const val = (row as Record<string, unknown>)[h];
            const str = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (data.length === 0) return null;

  return (
    <Button variant="secondary" size="sm" onClick={handleExport}>
      <Download className="w-3.5 h-3.5" />
      {label}
    </Button>
  );
}
