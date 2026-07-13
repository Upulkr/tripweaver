import { ChatMessage } from '@/types/agent';
import { User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 max-w-3xl mx-auto ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-primary' : 'bg-secondary'}`}>
        {isUser ? <User className="w-5 h-5 text-primary-foreground" /> : <Sparkles className="w-5 h-5 text-foreground" />}
      </div>
      
      <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <span className="text-xs font-medium text-ring px-1">
          {isUser ? 'You' : 'TripWeaver Agent'}
        </span>
        <div 
          className={`px-4 py-3 rounded-radius-lg ${
            isUser 
              ? 'bg-primary text-primary-foreground rounded-tr-none' 
              : 'bg-secondary text-secondary-foreground rounded-tl-none border border-border'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className={`markdown-body ${isStreaming ? 'animate-pulse' : ''} text-sm leading-relaxed`}>
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
