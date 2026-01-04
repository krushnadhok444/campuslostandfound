import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Bell } from 'lucide-react';

interface HeroProps {
  onOpenReportModal: () => void;
  itemCount: number;
}

export function Hero({ onOpenReportModal, itemCount }: HeroProps) {
  const { user, signInWithGoogle } = useAuth();

  return (
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
                onClick={signInWithGoogle}
                className="gradient-accent text-accent-foreground px-8 py-6 text-lg font-semibold shadow-xl hover:opacity-90 transition-opacity"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Get Started with Google
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
  );
}
