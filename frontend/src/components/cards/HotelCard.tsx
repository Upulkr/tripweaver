import { HotelResult } from '@/types/agent';
import { useAgent } from '@/hooks/use-agent';
import { useUser } from '@clerk/nextjs';
import { MapPin, Star, Building } from 'lucide-react';
import { motion } from 'framer-motion';

export function HotelCard({ hotel }: { hotel: HotelResult }) {
  const { sendMessage } = useAgent();
  const { user } = useUser();

  const handleBook = () => {
    if (user?.id) {
      sendMessage(`Book ${hotel.name} for 2 nights under the name ${user.firstName || 'Guest'}`, user.id, user.firstName || user.fullName || 'Guest');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-4 rounded-radius-lg flex flex-col gap-3"
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-lg leading-tight">{hotel.name}</h4>
          <div className="flex items-center text-ring text-xs mt-1 gap-1">
            <MapPin className="w-3 h-3" />
            <span>{hotel.address || hotel.city || 'Unknown Location'}</span>
          </div>
        </div>
        <div className="bg-primary/10 text-primary p-2 rounded-radius flex items-center justify-center">
          <Building className="w-5 h-5" />
        </div>
      </div>
      
      <div className="flex items-center gap-1 text-yellow-500">
        <Star className="w-4 h-4 fill-current" />
        <Star className="w-4 h-4 fill-current" />
        <Star className="w-4 h-4 fill-current" />
        <Star className="w-4 h-4 fill-current" />
        <Star className="w-4 h-4 fill-current opacity-30" />
      </div>
      
      <div className="flex items-end justify-between mt-2">
        <div>
          <span className="text-2xl font-bold">${hotel.price || 150}</span>
          <span className="text-ring text-sm">/night</span>
        </div>
        <button 
          onClick={handleBook}
          className="bg-foreground text-background px-4 py-2 rounded-radius-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Book Now
        </button>
      </div>
    </motion.div>
  );
}
