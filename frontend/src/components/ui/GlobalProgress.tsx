/** @format */

import { useProgressStore } from '../../store/useProgressStore';

export function GlobalProgress() {
  const { isLoading, progress, message } = useProgressStore();

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200]">
      <div className="h-1 bg-gray-100 w-full">
        <div
          className="h-full bg-indigo-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      {message && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-white rounded-lg shadow-lg border border-gray-200 text-xs text-gray-600">
          {message}
        </div>
      )}
    </div>
  );
}
