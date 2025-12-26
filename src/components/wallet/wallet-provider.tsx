"use client";

import { createContext, useState, useEffect } from "react";
import { AppConfig, UserSession, showConnect } from "@stacks/connect";
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import type { StacksNetwork } from "@stacks/network";

interface WalletContextType {
  userSession: UserSession;
  stxAddress: string | null;
  network: StacksNetwork;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

export const WalletContext = createContext<WalletContextType | null>(null);

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

// It's better to default to one network and let user switch if needed
const network = new StacksTestnet(); 

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [stxAddress, setStxAddress] = useState<string | null>(null);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      // Logic to determine address based on network
      const address = network.isMainnet
        ? userData.profile.stxAddress.mainnet
        : userData.profile.stxAddress.testnet;
      setStxAddress(address);
    }
  }, []);

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: "Stacks DAO View",
        icon: window.location.origin + "/logo.png",
      },
      onFinish: () => {
        if (userSession.isUserSignedIn()) {
            const userData = userSession.loadUserData();
            const address = network.isMainnet
                ? userData.profile.stxAddress.mainnet
                : userData.profile.stxAddress.testnet;
            setStxAddress(address);
        }
      },
      userSession,
    });
  };

  const disconnectWallet = () => {
    if (userSession.isUserSignedIn()) {
      userSession.signUserOut("/");
      setStxAddress(null);
    }
  };

  return (
    <WalletContext.Provider value={{ userSession, stxAddress, network, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
}
