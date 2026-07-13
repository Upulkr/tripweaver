import { create } from 'zustand';
import { Thread, ChatMessage, ParsedResponse } from '@/types/agent';
import { AgentService } from '@/services/api';
import { ResponseParser } from '@/services/response-parser';

interface ChatState {
  threads: Thread[];
  activeThreadId: string | null;
  messages: Record<string, ChatMessage[]>;
  streamingText: string;
  isAgentThinking: boolean;
  contextPanelData: ParsedResponse | null;
  
  // Actions
  loadThreads: (clerkUserId: string) => Promise<void>;
  createThread: (clerkUserId: string) => Promise<string>;
  switchThread: (threadId: string) => Promise<void>;
  deleteThread: (threadId: string) => Promise<void>;
  renameThread: (threadId: string, title: string) => Promise<void>;
  
  addMessage: (threadId: string, message: ChatMessage) => void;
  setStreamingText: (text: string | ((prev: string) => string)) => void;
  setAgentThinking: (thinking: boolean) => void;
  setContextData: (data: ParsedResponse | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  threads: [],
  activeThreadId: null,
  messages: {},
  streamingText: '',
  isAgentThinking: false,
  contextPanelData: null,

  loadThreads: async (clerkUserId) => {
    try {
      const threads = await AgentService.getThreads(clerkUserId);
      set({ threads });
    } catch (e) {
      console.error("Failed to load threads", e);
    }
  },

  createThread: async (clerkUserId) => {
    try {
      const newThread = await AgentService.createThread(clerkUserId);
      set(state => ({
        threads: [newThread, ...state.threads],
        activeThreadId: newThread.id,
        messages: { ...state.messages, [newThread.id]: [] },
        contextPanelData: null,
        streamingText: '',
        isAgentThinking: false
      }));
      return newThread.id;
    } catch (e) {
      console.error("Failed to create thread", e);
      throw e;
    }
  },

  switchThread: async (threadId) => {
    set({ activeThreadId: threadId, contextPanelData: null, streamingText: '', isAgentThinking: false });
    // Load messages if not cached
    if (!get().messages[threadId]) {
      try {
        const msgs = await AgentService.getMessages(threadId);
        set(state => ({
          messages: { ...state.messages, [threadId]: msgs }
        }));
        
        // Parse the last message for context panel if it's from assistant
        if (msgs.length > 0) {
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg.role === 'assistant') {
            const parsed = ResponseParser.parse(lastMsg.content);
            if (parsed.type !== 'general') {
              set({ contextPanelData: parsed });
            }
          }
        }
      } catch (e) {
        console.error("Failed to load messages", e);
      }
    }
  },

  deleteThread: async (threadId) => {
    try {
      await AgentService.deleteThread(threadId);
      set(state => {
        const newThreads = state.threads.filter(t => t.id !== threadId);
        const { [threadId]: _, ...newMessages } = state.messages;
        return {
          threads: newThreads,
          messages: newMessages,
          activeThreadId: state.activeThreadId === threadId ? (newThreads[0]?.id || null) : state.activeThreadId
        };
      });
    } catch (e) {
      console.error("Failed to delete thread", e);
    }
  },

  renameThread: async (threadId, title) => {
    try {
      const updated = await AgentService.renameThread(threadId, title);
      set(state => ({
        threads: state.threads.map(t => t.id === threadId ? updated : t)
      }));
    } catch (e) {
      console.error("Failed to rename thread", e);
    }
  },

  addMessage: (threadId, message) => {
    set(state => ({
      messages: {
        ...state.messages,
        [threadId]: [...(state.messages[threadId] || []), message]
      }
    }));
  },

  setStreamingText: (text) => set(state => ({ 
    streamingText: typeof text === 'function' ? text(state.streamingText) : text 
  })),
  setAgentThinking: (thinking) => set({ isAgentThinking: thinking }),
  setContextData: (data) => set({ contextPanelData: data })
}));
