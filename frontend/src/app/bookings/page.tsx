"use client";
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { AgentService } from '@/services/api';
import { Booking } from '@/types/agent';
import { PlaneTakeoff, Building, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BookingsPage() {
  const { user } = useUser();
  const [hotels, setHotels] = useState<Booking[]>([]);
  const [flights, setFlights] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<'hotels' | 'flights'>('hotels');

  useEffect(() => {
    if (user?.id) {
      AgentService.getBookings(user.id).then(data => {
        setHotels(data.hotels);
        setFlights(data.flights);
        setIsLoading(false);
      });
    }
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-secondary/20 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/workspace" className="inline-flex items-center gap-2 text-ring hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Workspace
        </Link>
        
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
        
        <div className="flex gap-4 mb-6 border-b border-border">
          <button 
            className={`pb-4 px-2 font-medium transition-colors relative ${tab === 'hotels' ? 'text-foreground' : 'text-ring hover:text-foreground'}`}
            onClick={() => setTab('hotels')}
          >
            Hotel Stays ({hotels.length})
            {tab === 'hotels' && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-foreground" />}
          </button>
          <button 
            className={`pb-4 px-2 font-medium transition-colors relative ${tab === 'flights' ? 'text-foreground' : 'text-ring hover:text-foreground'}`}
            onClick={() => setTab('flights')}
          >
            Flights ({flights.length})
            {tab === 'flights' && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-foreground" />}
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : tab === 'hotels' ? (
          <div className="grid gap-4">
            {hotels.length === 0 ? <EmptyState type="hotel" /> : hotels.map(h => (
              <BookingCard 
                key={h.id} 
                icon={<Building className="w-5 h-5 text-purple-500" />}
                title={h.hotelName || 'Hotel Stay'}
                subtitle={`Guest: ${h.guestName}`}
                code={h.confirmationCode}
                date={h.createdAt}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {flights.length === 0 ? <EmptyState type="flight" /> : flights.map(f => (
              <BookingCard 
                key={f.id} 
                icon={<PlaneTakeoff className="w-5 h-5 text-blue-500" />}
                title={`Flight ${f.flightId}`}
                subtitle={`Passenger: ${f.passengerName}`}
                code={f.confirmationCode}
                date={f.createdAt}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingCard({ icon, title, subtitle, code, date }: { icon: React.ReactNode, title: string, subtitle: string, code: string, date: string }) {
  return (
    <div className="glass p-6 rounded-radius-lg flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-ring text-sm">{subtitle}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-ring mb-1">Confirmation</p>
        <p className="font-mono font-bold text-lg bg-secondary px-3 py-1 rounded">{code}</p>
        <div className="flex items-center justify-end gap-1 text-xs text-ring mt-2">
          <Calendar className="w-3 h-3" />
          <span>{new Date(date).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ type }: { type: 'hotel' | 'flight' }) {
  return (
    <div className="text-center py-20 glass rounded-radius-lg">
      <p className="text-lg font-medium">No {type} bookings found.</p>
      <p className="text-ring mt-2">Go to the workspace to start planning your trip.</p>
    </div>
  );
}
