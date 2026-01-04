import { Search, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
              <Search className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold">
                Campus<span className="text-primary">Find</span>
              </h3>
              <p className="text-xs text-background/60">Lost & Found Portal</p>
            </div>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-background/70">
            <a href="#items" className="hover:text-background transition-colors">
              Browse Items
            </a>
            <a href="#how-it-works" className="hover:text-background transition-colors">
              How It Works
            </a>
            <a href="#" className="hover:text-background transition-colors">
              Contact
            </a>
            <a href="#" className="hover:text-background transition-colors">
              Privacy
            </a>
          </nav>

          {/* Made with love */}
          <div className="flex items-center gap-2 text-sm text-background/60">
            Made with <Heart className="h-4 w-4 text-lost fill-lost" /> for students
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-background/10 text-center text-sm text-background/40">
          © {new Date().getFullYear()} CampusFind. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
