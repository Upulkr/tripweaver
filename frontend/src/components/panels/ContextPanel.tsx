import { useChatStore } from '@/hooks/use-chat-store';
import { HotelCard } from '@/components/cards/HotelCard';
import { FlightCard } from '@/components/cards/FlightCard';
import { BookingConfirmation } from '@/components/cards/BookingConfirmation';
import { Map, Plane, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ContextPanel() {
  const { contextPanelData, isAgentThinking } = useChatStore();

  if (!contextPanelData && !isAgentThinking) {
    return (
      <div className="w-80 border-l border-border bg-secondary/10 flex flex-col items-center justify-center p-6 text-center h-full">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Compass className="w-10 h-10 text-ring" />
        </div>
        <h3 className="font-medium text-lg mb-2">Trip Context</h3>
        <p className="text-sm text-ring">
          Search for hotels or flights to see results appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-96 border-l border-border bg-secondary/10 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-border bg-background flex items-center gap-2">
        <Map className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Interactive Results</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {isAgentThinking && !contextPanelData && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-secondary rounded-radius-lg animate-pulse" />
              ))}
            </motion.div>
          )}

          {contextPanelData?.type === 'hotel_search' && contextPanelData.data?.map((hotel: any, i) => (
            <HotelCard key={i} hotel={hotel} />
          ))}

          {contextPanelData?.type === 'flight_search' && contextPanelData.data?.map((flight: any, i) => (
            <FlightCard key={i} flight={flight} />
          ))}

          {contextPanelData?.type === 'booking' && contextPanelData.data && (
            <BookingConfirmation booking={contextPanelData.data as any} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
