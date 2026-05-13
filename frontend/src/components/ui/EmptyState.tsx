/** @format */

export function EmptyState({ title, description, icon = 'inbox' }: { title: string; description?: string; icon?: 'search' | 'inbox' | 'error' | 'box' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
        <span className="text-xl text-gray-700">{icon === 'box' ? '📦' : icon === 'search' ? '🔍' : icon === 'error' ? '⚠️' : '📭'}</span>
      </div>
      <h3 className="text-sm font-semibold text-gray-400 mb-1">{title}</h3>
      {description && <p className="text-xs text-gray-600 max-w-xs">{description}</p>}
    </div>
  );
}
