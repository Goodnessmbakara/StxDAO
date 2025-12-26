import Link from 'next/link';
import { Eye, ShieldCheck, Layers } from 'lucide-react';
import ConnectWallet from '../wallet/connect-wallet';
import { ThemeToggle } from '../theme/theme-toggle';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-orange-500/20 bg-gradient-to-r from-background via-background to-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent pointer-events-none" />
      
      <div className="container flex h-16 items-center relative">
        {/* Logo and Brand */}
        <Link 
          href="/" 
          className="flex items-center gap-3 font-bold text-xl mr-8 group hover:scale-105 transition-transform duration-200"
        >
          <div className="relative">
            {/* Animated glow effect */}
            <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-md group-hover:bg-orange-500/40 transition-all duration-300 animate-pulse" />
            
            {/* Icon stack for depth */}
            <div className="relative">
              <Layers className="h-7 w-7 text-orange-500 absolute -translate-x-0.5 -translate-y-0.5 opacity-30" />
              <Eye className="h-7 w-7 text-orange-500 relative" />
            </div>
          </div>
          
          <div className="flex flex-col leading-none">
            <span className="text-foreground group-hover:text-orange-500 transition-colors">
              StackSight
            </span>
            <span className="text-xs text-muted-foreground font-normal">
              Bitcoin-Secured Transparency
            </span>
          </div>
        </Link>

        {/* Navigation Pills */}
        <nav className="hidden md:flex items-center gap-2 flex-1">
          <Link
            href="/"
            className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-500/10 hover:text-orange-500 transition-all duration-200 flex items-center gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            Explorer
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Network Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs font-medium text-orange-500">Mainnet</span>
          </div>
          
          <ThemeToggle />
          <ConnectWallet />
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
    </header>
  );
}
