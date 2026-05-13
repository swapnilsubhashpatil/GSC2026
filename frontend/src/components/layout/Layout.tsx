/** @format */

import { TopNav } from './TopNav';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col bg-bg-secondary">
      <TopNav />
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
