/** @format */

import { useEffect, useState } from 'react';
import { Keyboard, X, Command } from 'lucide-react';

interface Shortcut { keys: string[]; description: string; }

const SHORTCUTS: Shortcut[] = [
  { keys: ['Cmd', 'K'], description: 'Open command palette' },
  { keys: ['Esc'], description: 'Close modals / Go back' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
  { keys: ['R'], description: 'Refresh data' },
  { keys: ['G', 'D'], description: 'Go to dashboard' },
  { keys: ['G', 'Q'], description: 'Go to decisions' },
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-md bg-bg-elevated rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-gray-500" />
            <h2 className="text-base font-semibold text-white">Keyboard Shortcuts</h2>
          </div>
          <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-3">
          {SHORTCUTS.map((shortcut, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, j) => (
                  <span key={j} className="flex items-center">
                    {j > 0 && <span className="text-gray-700 mx-1">+</span>}
                    <kbd className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-gray-400 font-mono font-medium min-w-[24px] text-center">{key === 'Cmd' ? <Command className="w-3 h-3" /> : key}</kbd>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
