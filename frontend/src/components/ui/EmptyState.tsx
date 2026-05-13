/** @format */

import { Search, Inbox, AlertTriangle, Box } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: 'search' | 'inbox' | 'error' | 'box';
  action?: React.ReactNode;
}

const ICONS = {
  search: Search,
  inbox: Inbox,
  error: AlertTriangle,
  box: Box,
};

export function EmptyState({ title, description, icon = 'inbox', action }: EmptyStateProps) {
  const Icon = ICONS[icon];

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-gray-300" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
