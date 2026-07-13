import Link from 'next/link';
import { Plane, Hotel, MessageCircleQuestion, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px]" />

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl px-6 py-20 z-10 text-center">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-8 border border-border">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          TripWeaver AI Agents are online
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl">
          Your Intelligent Travel <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Command Center
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-ring max-w-2xl mb-12">
          Experience the future of travel planning. Chat with specialized AI agents to instantly search for flights, book premium hotels, and get expert travel advice.
        </p>

        <Link 
          href="/workspace"
          className="group inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-all shadow-xl shadow-foreground/10"
        >
          Get Started
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>

        <div className="grid md:grid-cols-3 gap-6 mt-24 w-full text-left">
          <FeatureCard 
            icon={<Plane className="w-6 h-6 text-blue-500" />}
            title="Flight Agent"
            description="Find and book flights across hundreds of airlines with real-time pricing and availability."
          />
          <FeatureCard 
            icon={<Hotel className="w-6 h-6 text-purple-500" />}
            title="Hotel Agent"
            description="Discover luxury accommodations and boutique hotels tailored to your specific preferences."
          />
          <FeatureCard 
            icon={<MessageCircleQuestion className="w-6 h-6 text-green-500" />}
            title="Travel Expert"
            description="Get personalized itineraries, visa requirements, and local recommendations anywhere."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass p-6 rounded-radius-lg flex flex-col gap-4 border border-border/50 hover:border-border transition-colors">
      <div className="w-12 h-12 bg-background rounded-radius flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-ring leading-relaxed">{description}</p>
    </div>
  );
}