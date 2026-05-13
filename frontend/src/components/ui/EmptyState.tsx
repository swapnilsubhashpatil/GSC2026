/** @format */

import { Package, Search, AlertTriangle, Inbox } from 'lucide-react';

const ICON_MAP = {
  box: Package,
  search: Search,
  error: AlertTriangle,
  inbox: Inbox,
};

export function EmptyState({ title, description, icon = 'inbox' }: { title: string; description?: string; icon?: 'search' | 'inbox' | 'error' | 'box' }) {
  const Icon = ICON_MAP[icon];
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-500 mb-1">{title}</h3>
      {description && <p className="text-xs text-gray-400 max-w-xs">{description}</p>}
    </div>
  );
}
