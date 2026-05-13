/** @format */

import { Link } from 'react-router-dom';
import { Box, Search, GitPullRequest, Settings } from 'lucide-react';
import { usePigeonStore } from '../../store/usePigeonStore';

export function MobileNav() {
  const pendingDecisions = usePigeonStore((s) => s.pendingDecisions);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-6 py-2">
      <div className="flex items-center justify-around">
        <Link to="/" className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-gray-900">
          <Box className="w-5 h-5" />
          <span className="text-[10px]">Shipments</span>
        </Link>
        <Link to="/decisions" className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-gray-900 relative">
          <GitPullRequest className="w-5 h-5" />
          <span className="text-[10px]">Decisions</span>
          {pendingDecisions.length > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
              {pendingDecisions.length}
            </span>
          )}
        </Link>
        <button className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-gray-900">
          <Search className="w-5 h-5" />
          <span className="text-[10px]">Search</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-gray-900">
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">Settings</span>
        </button>
      </div>
    </nav>
  );
}
