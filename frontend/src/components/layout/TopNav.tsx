/** @format */

import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  GitPullRequest,
  GitBranch,
  Activity,
  BarChart3,
  Zap,
  Shield,
  Radio,
} from 'lucide-react';
import { usePigeonStore } from '../../store/usePigeonStore';

const NAV = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/shipments', label: 'Shipments', icon: Boxes },
  { path: '/decisions', label: 'Decisions', icon: GitPullRequest },
  { path: '/network', label: 'Network', icon: GitBranch },
  { path: '/activity', label: 'Activity', icon: Activity },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/scan', label: 'Scan', icon: Zap },
];

export function TopNav() {
  const location = useLocation();
  const connected = usePigeonStore((s) => s.connected);
  const pendingDecisions = usePigeonStore((s) => s.pendingDecisions.length);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2.5 mr-8 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-[15px] text-gray-900 tracking-tight">Pigeon</span>
      </Link>

      <nav className="flex items-center gap-1 mx-auto">
        {NAV.map((item) => {
          const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
                active
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
              {item.path === '/decisions' && pendingDecisions > 0 && (
                <span className="ml-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {pendingDecisions}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Radio className={`w-3.5 h-3.5 ${connected ? 'text-emerald-500' : 'text-red-500'}`} />
          <span className={`text-[11px] font-semibold ${connected ? 'text-emerald-600' : 'text-red-600'}`}>
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>
    </header>
  );
}
