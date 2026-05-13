/** @format */

import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';

export function CopyButton({ text, label = 'Copied!' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      addToast({ message: label, type: 'success' });
    } catch {
      addToast({ message: 'Failed to copy', type: 'error' });
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
      title="Copy"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}
