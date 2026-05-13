/** @format */

export function Loading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" />
        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
        <span className="text-xs text-slate-500 ml-1">{text}</span>
      </div>
    </div>
  );
}
