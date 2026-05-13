/** @format */

import { Link } from 'react-router-dom';
import { Box, GitPullRequest, Command } from 'lucide-react';
import { usePigeonStore } from '../../store/usePigeonStore';

export function MobileNav() {
  const pendingDecisions = usePigeonStore((s) => s.pendingDecisions);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-bg-elevated/90 backdrop-blur-xl border-t border-white/5 z-50 px-6 py-2">
      <div className="flex items-center justify-around">
        <Link to="/" className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-gray-300 transition-colors">
          <Box className="w-5 h-5" />
          <span className="text-[9px] font-bold">Command</span>
        </Link>
        <Link to="/decisions" className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-gray-300 transition-colors relative">
          <GitPullRequest className="w-5 h-5" />
          <span className="text-[9px] font-bold">Queue</span>
          {pendingDecisions.length > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-bg-primary text-[9px] font-bold flex items-center justify-center">
              {pendingDecisions.length}
            </span>
          )}
        </Link>
        <button className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-gray-300 transition-colors">
          <Command className="w-5 h-5" />
          <span className="text-[9px] font-bold">Search</span>
        </button>
      </div>
    </nav>
  );
}
