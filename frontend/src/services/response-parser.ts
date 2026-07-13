import { ParsedResponse, HotelResult, FlightResult, BookingConfirmation } from '@/types/agent';

export const ResponseParser = {
  parse(reply: string): ParsedResponse {
    if (!reply) return { type: 'general', rawReply: '' };

    // Booking Confirmation
    if (reply.includes("BOOKING CONFIRMED")) {
      const codeMatch = reply.match(/Confirmation Code:\s*([A-Z0-9-]+)/i);
      const isHotel = reply.includes("Hotel:");
      
      const details: Record<string, string> = {};
      const lines = reply.split('\n');
      for (const line of lines) {
        if (line.includes(':') && !line.includes('CONFIRMED')) {
          const [k, v] = line.split(':').map(s => s.trim());
          if (v) details[k] = v;
        }
      }

      return {
        type: 'booking',
        rawReply: reply,
        data: {
          type: isHotel ? 'hotel' : 'flight',
          confirmationCode: codeMatch ? codeMatch[1] : 'UNKNOWN',
          details
        } as BookingConfirmation
      };
    }

    // Hotel Search Results
    if (reply.toLowerCase().includes("found hotels") || reply.includes("hotels in")) {
      const hotels: HotelResult[] = [];
      const regex = /-\s*\*\*(.*?)\*\*\s*\(.*?:\s*(.*?)\)/g;
      let match;
      // also match format: - Hotel Name (ID: XX): $price/night
      const fallbackRegex = /-\s*(.*?)\s*\(ID:\s*(.*?)\):\s*\$([0-9.]+)/g;

      while ((match = regex.exec(reply)) !== null) {
        hotels.push({ name: match[1], address: match[2] });
      }
      
      if (hotels.length === 0) {
         while ((match = fallbackRegex.exec(reply)) !== null) {
            hotels.push({ name: match[1].replace(/\*\*/g, ''), code: match[2], price: parseFloat(match[3]) });
         }
      }

      if (hotels.length > 0) {
        return { type: 'hotel_search', rawReply: reply, data: hotels };
      }
    }

    // Flight Search Results
    if (reply.toLowerCase().includes("found flights") || reply.toLowerCase().includes("flights to")) {
      const flights: FlightResult[] = [];
      const regex = /-\s*\*\*(.*?)\*\*\s*\(.*?:\s*(.*?)\)\s*-\s*\$([0-9.]+)/g;
      const fallbackRegex = /-\s*(.*?)\s*\(ID:\s*(.*?)\).*?:\s*\$([0-9.]+)/g;
      
      let match;
      while ((match = regex.exec(reply)) !== null) {
        flights.push({ airline: match[1], code: match[2], price: parseFloat(match[3]) });
      }
      
      if (flights.length === 0) {
         while ((match = fallbackRegex.exec(reply)) !== null) {
            flights.push({ airline: match[1].replace(/\*\*/g, ''), code: match[2], price: parseFloat(match[3]) });
         }
      }

      if (flights.length > 0) {
        return { type: 'flight_search', rawReply: reply, data: flights };
      }
    }

    return { type: 'general', rawReply: reply };
  }
};
