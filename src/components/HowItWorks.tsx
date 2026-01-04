import { Search, Upload, Bell, MessageCircle } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Sign In',
    description: 'Log in securely with your Google account to access the portal.',
    color: 'gradient-primary',
  },
  {
    icon: Upload,
    title: 'Report Item',
    description: 'Submit details about lost or found items with images and location.',
    color: 'gradient-lost',
  },
  {
    icon: Bell,
    title: 'Get Notified',
    description: 'Browse items in real-time as they are reported across campus.',
    color: 'gradient-found',
  },
  {
    icon: MessageCircle,
    title: 'Connect',
    description: 'Contact the owner or finder directly to arrange item recovery.',
    color: 'gradient-accent',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Reuniting students with their belongings in four simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-border" />
              )}
              
              <div className="flex flex-col items-center text-center">
                {/* Step number */}
                <div className="relative mb-6">
                  <div className={`h-24 w-24 rounded-2xl ${step.color} flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform`}>
                    <step.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                </div>

                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
