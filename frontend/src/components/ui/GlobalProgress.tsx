/** @format */

import { useProgressStore } from '../../store/useProgressStore';

export function GlobalProgress() {
  const { isLoading, progress } = useProgressStore();

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200]">
      <div className="h-0.5 bg-white/5 w-full">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
