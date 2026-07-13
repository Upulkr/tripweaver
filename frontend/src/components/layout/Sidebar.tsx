import { useEffect, useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { PlusCircle, MessageSquare, Trash2, Edit2, Moon, Sun, Plane } from 'lucide-react';
import { useChatStore } from '@/hooks/use-chat-store';
import { useTheme } from '@/hooks/use-theme';
import Link from 'next/link';

export function Sidebar() {
  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();
  const { threads, activeThreadId, loadThreads, createThread, switchThread, deleteThread, renameThread } = useChatStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadThreads(user.id);
    }
  }, [user?.id, loadThreads]);

  const handleNewChat = async () => {
    if (user?.id) {
      await createThread(user.id);
    }
  };

  const handleRenameSubmit = (id: string) => {
    if (editTitle.trim()) {
      renameThread(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <aside className="w-64 border-r border-border bg-secondary/30 flex flex-col h-full transition-colors">
      <div className="p-4 flex items-center gap-2 border-b border-border">
        <Plane className="w-6 h-6 text-primary" />
        <span className="font-bold text-lg">TripWeaver</span>
      </div>

      <div className="p-4">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:opacity-90 py-2.5 rounded-radius transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        {threads.map(thread => (
          <div
            key={thread.id}
            className={`group flex items-center justify-between p-2 rounded-radius cursor-pointer transition-colors
              ${activeThreadId === thread.id ? 'bg-secondary' : 'hover:bg-secondary/50'}
            `}
            onClick={() => {
              if (editingId !== thread.id) switchThread(thread.id);
            }}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <MessageSquare className="w-4 h-4 text-ring shrink-0" />
              {editingId === thread.id ? (
                <input
                  autoFocus
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  onBlur={() => handleRenameSubmit(thread.id)}
                  onKeyDown={e => e.key === 'Enter' && handleRenameSubmit(thread.id)}
                  className="bg-background text-sm border-none outline-none w-full px-1"
                />
              ) : (
                <span className="truncate text-sm">{thread.title}</span>
              )}
            </div>
            
            <div className="hidden group-hover:flex items-center gap-1 shrink-0">
              <button 
                onClick={(e) => { e.stopPropagation(); setEditTitle(thread.title); setEditingId(thread.id); }}
                className="p-1 hover:bg-background rounded"
              >
                <Edit2 className="w-3 h-3 text-ring" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteThread(thread.id); }}
                className="p-1 hover:bg-background text-red-500 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border flex flex-col gap-3">
        <Link href="/bookings" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2 px-2 py-1">
          My Bookings
        </Link>
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <UserButton afterSignOutUrl="/" />
            <span className="text-sm font-medium truncate max-w-[100px]">{user?.firstName || 'User'}</span>
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-secondary transition-colors">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
