/** @format */

import { TopNav } from './TopNav';
import { ToastContainer } from '../ui/ToastContainer';
import { GlobalProgress } from '../ui/GlobalProgress';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col bg-bg-secondary">
      <GlobalProgress />
      <TopNav />
      <main className="flex-1 overflow-auto p-4 lg:p-8 pb-20 lg:pb-8">
        {children}
      </main>
      <ToastContainer />
    </div>
  );
}
