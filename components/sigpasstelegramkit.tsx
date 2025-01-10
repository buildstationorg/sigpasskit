"use client";

// react imports
import { useState, useEffect } from "react";

// rainbowkit
import '@rainbow-me/rainbowkit/styles.css';

// viem
import { Address } from 'viem';
import { mnemonicToAccount } from "viem/accounts";
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

// sigpass
import { 
  initTelegramMiniApp
} from "@/lib/sigpasstelegram";

// wagmi
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

// UI elements
import { 
  Copy, 
  Check, 
  KeyRound, 
  Ban, 
  ExternalLink, 
  LogOut, 
  ChevronDown, 
  X, 
  ChevronRight,
  ScanFace,
  Undo
} from 'lucide-react';
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

// image
import Image from 'next/image';

// jotai for state management
import { useAtom } from 'jotai';
import { atomWithStorage, RESET } from 'jotai/utils';

import { on } from '@telegram-apps/sdk-react';
import { postEvent } from '@telegram-apps/sdk-react';


// Set the string key and the initial value
const addressAtom = atomWithStorage<Address | undefined>('SIGPASS_ADDRESS', undefined)
const biometricAccessAtom = atomWithStorage<boolean>('SIGPASS_BIOMETRIC_ACCESS', false)
const walletStatusAtom = atomWithStorage<boolean>('SIGPASS_WALLET_STATUS', false)

export default function SigpassTelegramKit() {

  // set the wallet state
  const [wallet, setWallet] = useAtom(walletStatusAtom);

  // set the open state
  const [walletOpen, setWalletOpen] = useState<boolean>(false);

  // set the webAuthn support state
  const [telegramMiniAppSupport, setTelegramMiniAppSupport] = useState<boolean>(false);

  // check if the user is on desktop
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // get the account
  const account = useAccount();

  // get the address
  const [address, setAddress] = useAtom(addressAtom);

  // check if the address is copied
  const [isCopied, setIsCopied] = useState(false);

  // test
  const [biometricAccess, setBiometricAccess] = useAtom(biometricAccessAtom);


  // check if the browser supports telegram mini app
  useEffect(() => {
    const telegramMiniAppSupport = initTelegramMiniApp();
    setTelegramMiniAppSupport(telegramMiniAppSupport);
  }, []);


  // truncate address to 6 characters and add ... at the end
  function truncateAddress(address: Address, length: number = 0) {
    if (length !== 0) {
      return `${address.slice(0, length)}...${address.slice(-length)}`;
    } 
    if (length === 0) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
  }

  // copy the address to the clipboard
  function copyAddress() {
    if (address) {
      navigator.clipboard.writeText(address ? address : "");
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    }
  }

  // disconnect the wallet
  function disconnect() {
    setAddress(undefined);
    setWalletOpen(false);
    setAddress(RESET);
  }

  function createSigpassTelegramWallet() {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    // Convert bytes to base64 string for safe transmission
    const bytesString = Buffer.from(bytes).toString('base64');
    postEvent('web_app_biometry_update_token', { token: bytesString });
    setWallet(true);
  }

  function getSigpassTelegramWallet() {
    postEvent('web_app_biometry_request_auth', {
      reason: 'Please authenticate to load your wallet',
    });
  }

  // When receiving the token back, you can convert it like this:
  function parseToken(tokenString: string): Uint8Array {
    // Convert base64 string back to Uint8Array
    return new Uint8Array(Buffer.from(tokenString, 'base64'));
  }

  // Use useEffect to manage the event listener
  useEffect(() => {
    // Set up the biometry auth listener
    const removeListener = on('biometry_auth_requested', payload => {
      console.log('Biometry auth requested:', payload);
      // setBiometryToken(payload?.token || null);
      const biometricAccessStatus = payload?.status;
      const bytes = payload?.token;
      if (biometricAccessStatus === 'authorized' && !bytes) {
        setBiometricAccess(true);
      }

      if (biometricAccessStatus === 'authorized' && !bytes) {
        console.log('Declined:');
      }
      if (!bytes) {
        return null;
      }
      const bytesArray = parseToken(bytes);
      const mnemonicPhrase = bip39.entropyToMnemonic(bytesArray, wordlist);
      if (mnemonicPhrase) {
        // const account = privateKeyToAccount(privateKey as Address);
        // derive the evm account from mnemonic
        const evmAccount = mnemonicToAccount(mnemonicPhrase,
          {
            accountIndex: 0,
            addressIndex: 0,
          }
        );
        setAddress(evmAccount.address);
      } else {
        setAddress(undefined);
      }
    });

    // Clean up the listener when component unmounts
    return () => removeListener();
  }, [setBiometricAccess, setAddress]);


  function requestBiometricAccess() {
    postEvent('web_app_biometry_request_access', {
      reason: 'Please grant the app biometric access to create your wallet',
    });
    setBiometricAccess(true);
  }

  function resetEverything() {
    setAddress(RESET);
    setWallet(RESET);
    setBiometricAccess(RESET);
  }

  if (isDesktop) {
    return (
      <div className="flex flex-row gap-2 items-center">
        {!wallet && !account.isConnected && !address ? (
          <Dialog open={walletOpen} onOpenChange={setWalletOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl font-bold text-md hover:scale-105 transition-transform">Create Wallet</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Wallet</DialogTitle>
                <DialogDescription>
                  Instantly get a wallet with <a href="https://www.yubico.com/resources/glossary/what-is-a-passkey/" className="inline-flex items-center gap-1 font-bold underline underline-offset-2" target="_blank" rel="noopener noreferrer">Passkey<ExternalLink className="h-4 w-4" /></a>
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-row gap-8">
                <div className="flex flex-col gap-4">
                  <h2 className="font-bold">What is a Wallet?</h2>
                  <div className="flex flex-row gap-4 items-center">
                    <Image 
                      src="/rainbowkit-1.svg" 
                      alt="icon-1" 
                      width={50}
                      height={50}
                    />
                    <div className="flex flex-col gap-2">
                      <h3 className="text-sm font-bold">A Home for your Digital Assets</h3>
                      <p className="text-sm text-muted-foreground">Wallets are used to send, receive, store, and display digital assets like Polkadot and NFTs.</p>
                    </div>
                  </div>
                  <div className="flex flex-row gap-4 items-center">
                    <Image 
                      src="/rainbowkit-2.svg" 
                      alt="icon-2" 
                      width={50}
                      height={50}
                    />
                    <div className="flex flex-col gap-2">
                      <h3 className="font-bold">A new way to Log In</h3>
                      <p className="text-sm text-muted-foreground">Instead of creating new accounts and passwords on every website, just connect your wallet.</p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <div className="flex flex-row gap-2 mt-4 justify-between w-full items-center">
                  <a href="https://learn.rainbow.me/understanding-web3?utm_source=rainbowkit&utm_campaign=learnmore" className="text-md font-bold" target="_blank" rel="noopener noreferrer">Learn more</a> 
                  {
                  telegramMiniAppSupport ? (
                    <Button 
                      className="rounded-xl font-bold text-md hover:scale-105 transition-transform" 
                    >
                      <KeyRound />
                      Create
                    </Button>
                  ) : (
                    <Button disabled className="rounded-xl font-bold text-md hover:scale-105 transition-transform">
                      <Ban />
                      Unsupported Browser
                    </Button>
                  )
                }
                </div>
              </DialogFooter>
              <div className="text-sm text-muted-foreground">
                Powered by <a href="https://github.com/gmgn-app/sigpass" className="inline-flex items-center gap-1 font-bold underline underline-offset-4"  target="_blank" rel="noopener noreferrer">Sigpass<ExternalLink className="h-4 w-4" /></a>
              </div>
            </DialogContent>
          </Dialog>
        ) : wallet && !account.isConnected && address === undefined ? (
          <Button 
            className="rounded-xl font-bold text-md hover:scale-105 transition-transform"
          >
            Get Wallet
          </Button>
        ) : wallet && !account.isConnected && address ? 
          <Dialog open={walletOpen} onOpenChange={setWalletOpen}>
            <DialogTrigger asChild>
              <Button 
                className="border-2 border-primary rounded-xl font-bold text-md hover:scale-105 transition-transform"
                variant="outline"
              >
                {truncateAddress(address)}
                <ChevronDown />
              </Button>
            </DialogTrigger>
            <DialogContent className="flex flex-col sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Wallet</DialogTitle>
              </DialogHeader>
              <DialogDescription className="flex flex-col gap-2 text-primary text-center font-bold text-lg items-center">
                {truncateAddress(address)}
              </DialogDescription>
              <Balances />
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={copyAddress} className="rounded-xl font-bold text-md hover:scale-105 transition-transform">
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button onClick={disconnect} variant="outline" className="rounded-xl font-bold text-md hover:scale-105 transition-transform">
                  <LogOut />
                  Disconnect
                </Button>
              </div>
            </DialogContent>
          </Dialog>
         : null}
        {
          !address ? <ConnectButton /> : null
        }
        <Button size="icon" onClick={resetEverything}>
          <Undo />
        </Button>
      </div>
    )
  }
 
  return (
    <div className="flex flex-row gap-2 items-center">
      {(!wallet && !account.isConnected && !address) ? (
        <Drawer open={walletOpen} onOpenChange={setWalletOpen}>
          <DrawerTrigger asChild>
            <Button className="rounded-xl font-bold text-md hover:scale-105 transition-transform">Create Wallet</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Create Wallet</DrawerTitle>
              <DrawerDescription>
                Instantly get a wallet with <a href="https://www.yubico.com/resources/glossary/what-is-a-passkey/" className="inline-flex items-center gap-1 font-bold underline underline-offset-2" target="_blank" rel="noopener noreferrer">Passkey<ExternalLink className="h-4 w-4" /></a>
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <div className="flex flex-col gap-4">
                <h2 className="font-bold">What is a Wallet?</h2>
                <div className="flex flex-row gap-4 items-center">
                  <Image 
                    src="/rainbowkit-1.svg" 
                    alt="icon-1" 
                    width={50}
                    height={50}
                  />
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-bold">A Home for your Digital Assets</h3>
                    <p className="text-sm text-muted-foreground">Wallets are used to send, receive, store, and display digital assets like Polkadot and NFTs.</p>
                  </div>
                </div>
                <div className="flex flex-row gap-4 items-center">
                  <Image 
                    src="/rainbowkit-2.svg" 
                    alt="icon-2" 
                    width={50}
                    height={50}
                  />
                  <div className="flex flex-col gap-2">
                    <h3 className="font-bold">A new way to Log In</h3>
                    <p className="text-sm text-muted-foreground">Instead of creating new accounts and passwords on every website, just connect your wallet.</p>
                  </div>
                </div>
                <a href="https://learn.rainbow.me/understanding-web3?utm_source=rainbowkit&utm_campaign=learnmore" className="text-md font-bold text-center" target="_blank" rel="noopener noreferrer">Learn more</a> 
              </div>
            </div>
            <DrawerFooter>
              {telegramMiniAppSupport && biometricAccess ? (
                  <Button 
                    className="rounded-xl font-bold text-md hover:scale-105 transition-transform" 
                    onClick={createSigpassTelegramWallet}
                  >
                    <KeyRound />
                    Create
                  </Button>
                )
                : telegramMiniAppSupport && !biometricAccess ? (
                  <Button 
                    className="rounded-xl font-bold text-md hover:scale-105 transition-transform" 
                    onClick={requestBiometricAccess}
                  >
                    <ScanFace />
                    Request Biometric Access
                  </Button>
                ) : (
                  <Button disabled className="rounded-xl font-bold text-md hover:scale-105 transition-transform">
                    <Ban />
                    Unsupported
                  </Button>
                )}
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
              <div className="text-sm text-muted-foreground">
                Powered by <a href="https://github.com/gmgn-app/sigpass" className="inline-flex items-center gap-1 font-bold underline underline-offset-4" target="_blank" rel="noopener noreferrer">Sigpass<ExternalLink className="h-4 w-4" /></a>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : wallet && !account.isConnected && address === undefined ? (
        <Button 
          className="rounded-xl font-bold text-md hover:scale-105 transition-transform"
          onClick={getSigpassTelegramWallet}
        >
          Get Wallet
        </Button>
      ) : wallet && !account.isConnected && address ? (
        <Drawer open={walletOpen} onOpenChange={setWalletOpen}>
          <DrawerTrigger asChild>
            <Button 
              className="border-2 border-primary rounded-xl font-bold text-md hover:scale-105 transition-transform"
              variant="outline"
            >
              {truncateAddress(address)}
              <ChevronDown />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[250px]">
            <DrawerHeader className="flex flex-col items-center justify-between">
              <div className="flex flex-row items-center justify-between w-full">
                <DrawerTitle>Wallet</DrawerTitle>
                <DrawerClose asChild>
                  <Button variant="outline" size="icon">
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
              <DrawerDescription className="flex flex-col gap-2 text-primary text-center font-bold text-lg items-center">
                {truncateAddress(address)}
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col items-center gap-2">
              <Balances />
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={copyAddress} className="rounded-xl font-bold text-md hover:scale-105 transition-transform">
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button onClick={disconnect} variant="outline" className="rounded-xl font-bold text-md hover:scale-105 transition-transform">
                  <LogOut />
                  Disconnect
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      ) : null}
      {!address ? <ConnectButton /> : null}
      <Button size="icon" onClick={resetEverything}>
        <Undo />
      </Button>
    </div>
  )
}

function Balances() {

  // set the balances open state
  const [balancesOpen, setBalancesOpen] = useState<boolean>(false);

  // check if the user is on desktop
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={balancesOpen} onOpenChange={setBalancesOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="rounded-xl font-bold text-md hover:scale-105 transition-transform">
            Balances
            <ChevronRight />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Balances</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={balancesOpen} onOpenChange={setBalancesOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" className="rounded-xl font-bold text-md hover:scale-105 transition-transform">
          Balances
          <ChevronRight />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Balances</DrawerTitle>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  )
}