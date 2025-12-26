"use client";

import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ConnectWallet() {
  const { stxAddress, network, connectWallet, disconnectWallet } = useWallet();
  const { toast } = useToast();

  const handleCopy = () => {
    if (stxAddress) {
      navigator.clipboard.writeText(stxAddress);
      toast({ title: "Address Copied!" });
    }
  };

  if (stxAddress) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <User className="mr-2 h-4 w-4" />
            {`${stxAddress.slice(0, 6)}...${stxAddress.slice(-4)}`}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            My Wallet ({network?.isMainnet() ? 'Mainnet' : 'Testnet'})
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem onClick={disconnectWallet}>
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return <Button onClick={connectWallet}>Connect Wallet</Button>;
}
