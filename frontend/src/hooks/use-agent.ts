import { useChatStore } from './use-chat-store';
import { streamChat } from '@/services/stream';
import { ResponseParser } from '@/services/response-parser';

export const useAgent = () => {
  const { 
    addMessage, 
    setStreamingText, 
    setAgentThinking,
    setContextData,
    activeThreadId,
    loadThreads // to refresh titles if updated
  } = useChatStore();

  const sendMessage = async (message: string, clerkUserId: string, clerkUserName: string = 'Guest') => {
    if (!activeThreadId) return;

    // Add user message optimistically
    const userMsg = {
      id: Date.now().toString(),
      threadId: activeThreadId,
      role: 'user' as const,
      content: message,
      createdAt: new Date().toISOString()
    };
    addMessage(activeThreadId, userMsg);
    
    setAgentThinking(true);
    setStreamingText('');
    setContextData(null); // Clear context panel on new request

    streamChat(
      message,
      activeThreadId,
      clerkUserId,
      clerkUserName,
      // onToken
      (token) => {
        setAgentThinking(false);
        setStreamingText((prev: string) => prev + token);
      },
      // onDone
      (fullReply) => {
        setStreamingText('');
        setAgentThinking(false);
        
        // Add final assistant message
        const asstMsg = {
          id: Date.now().toString() + "-ast",
          threadId: activeThreadId,
          role: 'assistant' as const,
          content: fullReply,
          createdAt: new Date().toISOString()
        };
        addMessage(activeThreadId, asstMsg);

        // Parse for context panel (hotels, flights, bookings)
        const parsed = ResponseParser.parse(fullReply);
        if (parsed.type !== 'general') {
          setContextData(parsed);
        }

        // We might need to refresh threads to get the auto-generated title
        loadThreads(clerkUserId);
      },
      // onError
      (error) => {
        setAgentThinking(false);
        setStreamingText('');
        console.error("Chat error:", error);
        
        addMessage(activeThreadId, {
          id: Date.now().toString() + "-err",
          threadId: activeThreadId,
          role: 'assistant',
          content: "Sorry, I encountered an error. Please try again.",
          createdAt: new Date().toISOString()
        });
      }
    );
  };

  return { sendMessage };
};