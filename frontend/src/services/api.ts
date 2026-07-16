import axios from 'axios';
import { Thread, ChatMessage, Booking } from '@/types/agent';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
});

export const AgentService = {
  createThread: async (clerkUserId: string, title: string = "New Chat"): Promise<Thread> => {
    const { data } = await api.post('/api/threads', { clerk_user_id: clerkUserId, title });
    return data;
  },
  
  getThreads: async (clerkUserId: string): Promise<Thread[]> => {
    const { data } = await api.get(`/api/threads?clerk_user_id=${clerkUserId}`);
    return data;
  },
  
  getMessages: async (threadId: string): Promise<ChatMessage[]> => {
    const { data } = await api.get(`/api/threads/${threadId}/messages`);
    return data;
  },
  
  deleteThread: async (threadId: string): Promise<void> => {
    await api.delete(`/api/threads/${threadId}`);
  },
  
  renameThread: async (threadId: string, title: string): Promise<Thread> => {
    const { data } = await api.patch(`/api/threads/${threadId}`, { title });
    return data;
  },
  
  getBookings: async (clerkUserId: string): Promise<{ hotels: Booking[], flights: Booking[] }> => {
    const { data } = await api.get(`/api/bookings?clerk_user_id=${clerkUserId}`);
    return data;
  }
};