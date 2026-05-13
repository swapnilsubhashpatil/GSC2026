/** @format */

import { TopNav } from './TopNav';
import { ToastContainer } from '../ui/ToastContainer';
import { GlobalProgress } from '../ui/GlobalProgress';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      <TopNav />
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <GlobalProgress />
      <ToastContainer />
    </div>
  );
}
