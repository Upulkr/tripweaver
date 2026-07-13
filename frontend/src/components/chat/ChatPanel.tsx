import { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Send, ArrowDown } from 'lucide-react';
import { useChatStore } from '@/hooks/use-chat-store';
import { useAgent } from '@/hooks/use-agent';
import { MessageBubble } from './MessageBubble';
import { ThinkingIndicator } from './ThinkingIndicator';

export function ChatPanel() {
  const { user } = useUser();
  const { messages, activeThreadId, streamingText, isAgentThinking } = useChatStore();
  const { sendMessage } = useAgent();
  
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const threadMessages = activeThreadId ? (messages[activeThreadId] || []) : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [threadMessages, streamingText, isAgentThinking]);

  const handleSend = () => {
    if (!input.trim() || !user?.id || !activeThreadId) return;
    sendMessage(input, user.id, user.firstName || user.fullName || 'Guest');
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeThreadId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Welcome to TripWeaver</h2>
          <p className="text-ring">Select a thread or start a new chat to begin planning your trip.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {threadMessages.length === 0 && !isAgentThinking && (
          <div className="h-full flex flex-col items-center justify-center opacity-50">
            <h3 className="text-xl font-medium mb-2">How can I help you travel today?</h3>
            <p className="text-sm">Try asking "Find me flights to Tokyo" or "Book a hotel in Paris"</p>
          </div>
        )}
        
        {threadMessages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        
        {isAgentThinking && !streamingText && (
          <div className="flex justify-start">
            <ThinkingIndicator />
          </div>
        )}
        
        {streamingText && (
          <MessageBubble 
            message={{ id: 'streaming', role: 'assistant', content: streamingText, createdAt: '', threadId: activeThreadId }} 
            isStreaming={true} 
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border bg-background">
        <div className="max-w-3xl mx-auto relative flex items-end gap-2 bg-secondary/50 border border-border rounded-radius-lg p-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <textarea
            className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 min-h-[44px] p-2"
            placeholder="Ask me about flights, hotels, or travel tips..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isAgentThinking || !!streamingText}
            className="p-2 bg-primary text-primary-foreground rounded-radius-md hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0 mb-1 mr-1"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-center text-ring mt-2">TripWeaver agents can make mistakes. Verify important bookings.</p>
      </div>
    </div>
  );
}
