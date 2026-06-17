'use client';

import { Sidebar, BottomNav } from './sidebar';
import { TopBar } from './top-bar';

export function AppShell({
  children,
  title,
  showPeriod,
}: {
  children: React.ReactNode;
  title?: string;
  showPeriod?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0 pb-16 lg:pb-0">
        <TopBar title={title} showPeriod={showPeriod} />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
