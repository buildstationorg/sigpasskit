'use client';

import * as React from 'react';
import {
  RainbowKitProvider,
  getDefaultWallets,
  getDefaultConfig,
} from '@rainbow-me/rainbowkit';
import {
  trustWallet,
  ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  optimism,
  optimismSepolia,
  sepolia,
  kaia,
  kairos
} from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { Provider as JotaiProvider } from 'jotai';
// import according to docs

const { wallets } = getDefaultWallets();
// initialize and destructure wallets object

// create a local config for the wallet
export const localConfig = createConfig({
  chains: [arbitrum, arbitrumSepolia, base, baseSepolia, optimism, optimismSepolia, sepolia, kaia, kairos],
  transports: {
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [optimism.id]: http(),
    [optimismSepolia.id]: http(),
    [sepolia.id]: http(),
    [kaia.id]: http(),
    [kairos.id]: http(),
  },
  ssr: true,
});

const config = getDefaultConfig({
  appName: 'SIGPASS', // Name your app
  projectId: "68a1d22856b8144f2ce4692afa1e40a4", // Enter your WalletConnect Project ID here
  wallets: [
    ...wallets,
    {
      groupName: 'Other',
      wallets: [trustWallet, ledgerWallet],
    },
  ],
  chains: [
    arbitrum, arbitrumSepolia, base, baseSepolia, optimism, optimismSepolia, sepolia, kaia, kairos
  ],
  transports: {
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [optimism.id]: http(),
    [optimismSepolia.id]: http(),
    [sepolia.id]: http(),
    [kaia.id]: http(),
    [kairos.id]: http(),
  },
  ssr: true, // Because it is Nextjs's App router, you need to declare ssr as true
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
          {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </JotaiProvider>
  );
}
