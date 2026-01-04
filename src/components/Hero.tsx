import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Bell } from 'lucide-react';
import { AuthModal } from './AuthModal';

interface HeroProps {
  onOpenReportModal: () => void;
  itemCount: number;
}

export function Hero({ onOpenReportModal, itemCount }: HeroProps) {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-hero opacity-95" />
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-white/5 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              <span className="text-sm font-medium text-white/90">
                {itemCount} items reported this month
              </span>
            </div>

            {/* Main heading */}
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-slide-up">
              Lost Something?{' '}
              <span className="block mt-2">
                We'll Help You{' '}
                <span className="relative">
                  Find It
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M2 10C50 4 150 4 198 10" stroke="hsl(var(--accent))" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span>
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Your campus-wide lost and found portal. Report missing items, upload found belongings, and reunite with what's yours.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {user ? (
                <Button
                  size="lg"
                  onClick={onOpenReportModal}
                  className="gradient-accent text-accent-foreground px-8 py-6 text-lg font-semibold shadow-xl hover:opacity-90 transition-opacity"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Report an Item
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={() => setAuthModalOpen(true)}
                  className="gradient-accent text-accent-foreground px-8 py-6 text-lg font-semibold shadow-xl hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 px-8 py-6 text-lg font-semibold backdrop-blur-sm"
                onClick={() => document.getElementById('items')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Browse Items
              </Button>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              {[
                { icon: Search, label: 'Easy Reporting', desc: 'Quick and simple item submission' },
                { icon: MapPin, label: 'Location Tags', desc: 'Find items by campus location' },
                { icon: Bell, label: 'Instant Alerts', desc: 'Get notified when items match' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex flex-col items-center p-4 rounded-xl glass-dark">
                  <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-white mb-1">{label}</h3>
                  <p className="text-sm text-white/70">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full h-auto">
            <path
              d="M0 120V60C240 20 480 0 720 0C960 0 1200 20 1440 60V120H0Z"
              fill="hsl(var(--background))"
            />
          </svg>
        </div>
      </section>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
