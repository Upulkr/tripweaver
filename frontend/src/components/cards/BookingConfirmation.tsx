import { BookingConfirmation as BookingType } from '@/types/agent';
import { CheckCircle2, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function BookingConfirmation({ booking }: { booking: BookingType }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 p-5 rounded-radius-lg relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Ticket className="w-24 h-24" />
      </div>
      
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
          <CheckCircle2 className="w-6 h-6" />
          <h3 className="font-bold text-lg">Booking Confirmed!</h3>
        </div>
        
        <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md p-4 rounded-radius border border-green-100 dark:border-green-900/30">
          <p className="text-xs text-ring mb-1 uppercase tracking-wider font-semibold">Confirmation Code</p>
          <p className="text-2xl font-mono font-bold tracking-widest text-foreground">{booking.confirmationCode}</p>
        </div>
        
        <div className="space-y-2 text-sm">
          {Object.entries(booking.details).map(([key, value], i) => (
            <div key={i} className="flex justify-between border-b border-border/40 pb-1 last:border-0 last:pb-0">
              <span className="text-ring">{key}</span>
              <span className="font-medium text-right text-foreground">{value}</span>
            </div>
          ))}
        </div>
        
        <Link 
          href="/bookings"
          className="mt-2 block w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-center rounded-radius-md font-medium transition-colors"
        >
          View My Bookings
        </Link>
      </div>
    </motion.div>
  );
}
