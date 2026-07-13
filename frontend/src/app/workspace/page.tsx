"use client";
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { ContextPanel } from '@/components/panels/ContextPanel';

export default function Workspace() {
  return (
    <main className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <ChatPanel />
      <ContextPanel />
    </main>
  );
}
