export type AgentType = 'hotel' | 'flight' | 'general';

export interface ChatMessage {
  id: string;
  threadId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface Thread {
  id: string;
  clerkUserId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface HotelResult {
  name: string;
  city?: string;
  code?: string;
  price?: number;
  address?: string;
}

export interface FlightResult {
  airline: string;
  code: string;
  destination?: string;
  price?: number;
  departureTime?: string;
}

export interface BookingConfirmation {
  type: 'hotel' | 'flight';
  confirmationCode: string;
  details: Record<string, string>;
}

export interface ParsedResponse {
  type: 'hotel_search' | 'flight_search' | 'booking' | 'general';
  rawReply: string;
  data?: HotelResult[] | FlightResult[] | BookingConfirmation;
}

export interface Booking {
  id: string;
  clerkUserId: string;
  confirmationCode: string;
  createdAt: string;
  // Hotel specific
  hotelName?: string;
  guestName?: string;
  checkIn?: string;
  checkOut?: string;
  // Flight specific
  flightId?: string;
  passengerName?: string;
}