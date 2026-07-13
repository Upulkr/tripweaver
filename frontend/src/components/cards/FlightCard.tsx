import { FlightResult } from '@/types/agent';
import { useAgent } from '@/hooks/use-agent';
import { useUser } from '@clerk/nextjs';
import { PlaneTakeoff, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function FlightCard({ flight }: { flight: FlightResult }) {
  const { sendMessage } = useAgent();
  const { user } = useUser();

  const handleBook = () => {
    if (user?.id) {
      sendMessage(`Book flight ${flight.code} for passenger ${user.firstName || 'Guest'}`, user.id, user.firstName || user.fullName || 'Guest');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-4 rounded-radius-lg flex flex-col gap-4"
    >
      <div className="flex justify-between items-center border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center">
            <PlaneTakeoff className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">{flight.airline}</h4>
            <p className="text-xs text-ring font-mono">{flight.code}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold">${flight.price}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm font-medium">
        <div className="text-center">
          <p className="text-lg">NYC</p>
          <p className="text-xs text-ring font-normal">Origin</p>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
          <div className="w-full border-t border-dashed border-ring/50 absolute top-1/2 -translate-y-1/2 z-0" />
          <PlaneTakeoff className="w-4 h-4 text-ring bg-background z-10 px-1" />
        </div>
        
        <div className="text-center">
          <p className="text-lg">{flight.destination?.substring(0, 3).toUpperCase() || 'DST'}</p>
          <p className="text-xs text-ring font-normal">Destination</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1 text-xs text-ring">
          <Clock className="w-3 h-3" />
          <span>{flight.departureTime || '10:00 AM'}</span>
        </div>
        <button 
          onClick={handleBook}
          className="bg-blue-600 text-white px-4 py-2 rounded-radius-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Select Flight
        </button>
      </div>
    </motion.div>
  );
}
