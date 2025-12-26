import Link from 'next/link';
import { Bitcoin } from 'lucide-react';
import ConnectWallet from '../wallet/connect-wallet';
import { ThemeToggle } from '../theme/theme-toggle';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg mr-6">
          <Bitcoin className="h-6 w-6 text-primary" />
          <span>Stacks DAO View</span>
        </Link>
        <div className="flex-1 flex items-center justify-end gap-2">
          <ThemeToggle />
          <ConnectWallet />
        </div>
      </div>
    </header>
  );
}
