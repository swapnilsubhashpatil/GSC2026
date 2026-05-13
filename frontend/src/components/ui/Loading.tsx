/** @format */

export function Loading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gray-900 animate-spin" />
        </div>
        <span className="text-xs text-gray-400 font-medium">{text}</span>
      </div>
    </div>
  );
}
