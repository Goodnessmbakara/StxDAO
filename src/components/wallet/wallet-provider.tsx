"use client";

import { createContext, useState, useEffect } from "react";
import { AppConfig, UserSession, showConnect } from "@stacks/connect";
import { HiroMainnet, HiroTestnet } from "@stacks/network";
import type { StacksNetwork } from "@stacks/network";

interface WalletContextType {
  userSession: UserSession;
  stxAddress: string | null;
  network: StacksNetwork | null;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

export const WalletContext = createContext<WalletContextType | null>(null);

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [stxAddress, setStxAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<StacksNetwork | null>(null);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setStxAddress(userData.profile.stxAddress.mainnet);
      setNetwork(new HiroMainnet());
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
            const currentNetwork = userData.profile.stxAddress.testnet 
                ? new HiroTestnet() 
                : new HiroMainnet();

            setStxAddress(
                currentNetwork.isMainnet()
                ? userData.profile.stxAddress.mainnet
                : userData.profile.stxAddress.testnet
            );
            setNetwork(currentNetwork);
        }
      },
      userSession,
    });
  };

  const disconnectWallet = () => {
    if (userSession.isUserSignedIn()) {
      userSession.signUserOut("/");
      setStxAddress(null);
      setNetwork(null);
    }
  };

  return (
    <WalletContext.Provider value={{ userSession, stxAddress, network, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
}
