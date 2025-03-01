"use client";

import { useState, useEffect } from "react";
// hooks
import { useMediaQuery } from "@/hooks/use-media-query";
// lucide icons
import {
  Copy,
  Check,
  KeyRound,
  Ban,
  ExternalLink,
  LogOut,
  X,
  ChevronDown,
  WalletMinimal
} from "lucide-react";
// viem
import { Address } from "viem";
// evm
import { mnemonicToAccount } from 'viem/accounts'
// bip39
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import {
  createSigpassWallet,
  getSigpassWallet,
  checkSigpassWallet,
  checkBrowserWebAuthnSupport,
} from "@/lib/sigpass";
import {
  useAccount,
  Connector,
  useConnect,
  useDisconnect,
} from "wagmi";
// components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// images
import Image from "next/image";
// jotai
import { useAtom, useAtomValue } from "jotai";
import { atomWithStorage, RESET } from "jotai/utils";


// Set the string key and the initial value
export const addressAtom = atomWithStorage<Address | undefined>(
  "SIGPASS_ADDRESS",
  undefined
);

// SIGPASS KIT COMPONENT
export default function SigpassKit() {
  const address = useAtomValue(addressAtom);
  const account = useAccount();

  // If wallet exists or address is set, show CreateComponent directly
  if (address) {
    return <CreateComponent />;
  }

  if (account.isConnected) {
    return <ConnectComponent />;
  }

  // Otherwise show the popover with both options
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="rounded-xl font-bold text-md hover:scale-105 transition-transform w-fit">
          Connect
          <ChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-2 w-48" align="end">
        <CreateComponent />
        <ConnectComponent />
      </PopoverContent>
    </Popover>
  );
}

// EMBEDDED WALLET COMPONENT (IN-DAPP WALLET)

function EmbeddedComponent() {
  const [wallet, setWallet] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [webAuthnSupport, setWebAuthnSupport] = useState<boolean>(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const account = useAccount();
  const [address, setAddress] = useAtom(addressAtom);
  const [isCopied, setIsCopied] = useState(false);

  // check if the wallet is already created
  useEffect(() => {
    async function fetchWalletStatus() {
      const status = await checkSigpassWallet();
      setWallet(status);
    }
    fetchWalletStatus();
  }, []);

  // check if the browser supports WebAuthn
  useEffect(() => {
    const support = checkBrowserWebAuthnSupport();
    setWebAuthnSupport(support);
  }, []);

  // get the wallet
  async function getWallet() {
    const account = await getSigpassWallet();
    if (account) {
      setAddress(account.address);
    } else {
      console.error("Issue getting wallet");
    }
  }

  // create a wallet
  async function createWallet() {
    const account = await createSigpassWallet("dapp");
    if (account) {
      setOpen(false);
      setWallet(true);
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
    setOpen(false);
    setAddress(RESET);
  }

  if (isDesktop) {
    return (
      <div className="flex flex-row gap-2 items-center">
        {!wallet && !account.isConnected && !address ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="rounded-xl font-bold text-md hover:scale-105 transition-transform w-full"
              >
                Create Wallet
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Wallet</DialogTitle>
                <DialogDescription>
                  Instantly get a wallet with{" "}
                  <a
                    href="https://www.yubico.com/resources/glossary/what-is-a-passkey/"
                    className="inline-flex items-center gap-1 font-bold underline underline-offset-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Passkey
                    <ExternalLink className="h-4 w-4" />
                  </a>
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
                      <h3 className="text-sm font-bold">
                        A Home for your Digital Assets
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Wallets are used to send, receive, store, and display
                        digital assets like Polkadot and NFTs.
                      </p>
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
                      <p className="text-sm text-muted-foreground">
                        Instead of creating new accounts and passwords on every
                        website, just connect your wallet.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <div className="flex flex-row gap-2 mt-4 justify-between w-full items-center">
                  <a
                    href="https://learn.rainbow.me/understanding-web3?utm_source=rainbowkit&utm_campaign=learnmore"
                    className="text-md font-bold"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn more
                  </a>
                  {webAuthnSupport ? (
                    <Button
                      className="rounded-xl font-bold text-md hover:scale-105 transition-transform"
                      onClick={createWallet} // add a name to the wallet, can be your dapp name or user input
                    >
                      <KeyRound />
                      Create
                    </Button>
                  ) : (
                    <Button
                      disabled
                      className="rounded-xl font-bold text-md hover:scale-105 transition-transform"
                    >
                      <Ban />
                      Unsupported Browser
                    </Button>
                  )}
                </div>
              </DialogFooter>
              <div className="text-sm text-muted-foreground">
                Powered by{" "}
                <a
                  href="https://sigpasskit.com"
                  className="inline-flex items-center gap-1 font-bold underline underline-offset-4"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Sigpass
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </DialogContent>
          </Dialog>
        ) : wallet && !account.isConnected && address === undefined ? (
          <Button
            variant="outline"
            className="rounded-xl font-bold text-md hover:scale-105 transition-transform w-full"
            onClick={getWallet}
          >
            Get Wallet
          </Button>
        ) : wallet && !account.isConnected && address ? (
          <Dialog open={open} onOpenChange={setOpen}>
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
                {truncateAddress(address, 4)}
              </DialogDescription>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={copyAddress}
                  className="rounded-xl font-bold text-md hover:scale-105 transition-transform"
                >
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
                <Button
                  onClick={disconnect}
                  variant="outline"
                  className="rounded-xl font-bold text-md hover:scale-105 transition-transform"
                >
                  <LogOut />
                  Disconnect
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-2 items-center">
      {!wallet && !account.isConnected && !address ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button className="rounded-xl font-bold text-md hover:scale-105 transition-transform w-full">
              Create Wallet
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Create Wallet</DrawerTitle>
              <DrawerDescription>
                Instantly get a wallet with{" "}
                <a
                  href="https://www.yubico.com/resources/glossary/what-is-a-passkey/"
                  className="inline-flex items-center gap-1 font-bold underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Passkey
                  <ExternalLink className="h-4 w-4" />
                </a>
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
                    <h3 className="text-sm font-bold">
                      A Home for your Digital Assets
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Wallets are used to send, receive, store, and display
                      digital assets like Polkadot and NFTs.
                    </p>
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
                    <p className="text-sm text-muted-foreground">
                      Instead of creating new accounts and passwords on every
                      website, just connect your wallet.
                    </p>
                  </div>
                </div>
                <a
                  href="https://learn.rainbow.me/understanding-web3?utm_source=rainbowkit&utm_campaign=learnmore"
                  className="text-md font-bold text-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more
                </a>
              </div>
            </div>
            <DrawerFooter>
              {webAuthnSupport ? (
                <Button
                  className="rounded-xl font-bold text-md hover:scale-105 transition-transform"
                  onClick={createWallet}
                >
                  <KeyRound />
                  Create
                </Button>
              ) : (
                <Button
                  disabled
                  className="rounded-xl font-bold text-md hover:scale-105 transition-transform"
                >
                  <Ban />
                  Unsupported Browser
                </Button>
              )}
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
              <div className="text-sm text-muted-foreground">
                Powered by{" "}
                <a
                  href="https://sigpasskit.com"
                  className="inline-flex items-center gap-1 font-bold underline underline-offset-4"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Sigpass
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : wallet && !account.isConnected && address === undefined ? (
        <Button
          variant="outline"
          className="rounded-xl font-bold text-md hover:scale-105 transition-transform w-full"
          onClick={getWallet}
        >
          Get Wallet
        </Button>
      ) : wallet && !account.isConnected && address ? (
        <Drawer open={open} onOpenChange={setOpen}>
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
                {truncateAddress(address, 4)}
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col items-center gap-2">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={copyAddress}
                  className="rounded-xl font-bold text-md hover:scale-105 transition-transform"
                >
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
                <Button
                  onClick={disconnect}
                  variant="outline"
                  className="rounded-xl font-bold text-md hover:scale-105 transition-transform"
                >
                  <LogOut />
                  Disconnect
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      ) : null}
    </div>
  );

}


function CreateComponent() {
  const [wallet, setWallet] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [webAuthnSupport, setWebAuthnSupport] = useState<boolean>(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const account = useAccount();
  const [address, setAddress] = useAtom(addressAtom);
  const [isCopied, setIsCopied] = useState(false);

  // check if the wallet is already created
  useEffect(() => {
    async function fetchWalletStatus() {
      const status = await checkSigpassWallet();
      setWallet(status);
    }
    fetchWalletStatus();
  }, []);

  // check if the browser supports WebAuthn
  useEffect(() => {
    const support = checkBrowserWebAuthnSupport();
    setWebAuthnSupport(support);
  }, []);

  // get the wallet
  async function getWallet() {
    const account = await getSigpassWallet();
    if (account) {
      setAddress(account.address);
    } else {
      console.error("Issue getting wallet");
    }
  }

  // create a wallet
  async function createWallet() {
    const account = await createSigpassWallet("dapp");
    if (account) {
      setOpen(false);
      setWallet(true);
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
    setOpen(false);
    setAddress(RESET);
  }

  if (isDesktop) {
    return (
      <div className="flex flex-row gap-2 items-center">
        {!wallet && !account.isConnected && !address ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="rounded-xl font-bold text-md hover:scale-105 transition-transform w-full"
              >
                Create Wallet
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Wallet</DialogTitle>
                <DialogDescription>
                  Instantly get a wallet with{" "}
                  <a
                    href="https://www.yubico.com/resources/glossary/what-is-a-passkey/"
                    className="inline-flex items-center gap-1 font-bold underline underline-offset-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Passkey
                    <ExternalLink className="h-4 w-4" />
                  </a>
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
                      <h3 className="text-sm font-bold">
                        A Home for your Digital Assets
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Wallets are used to send, receive, store, and display
                        digital assets like Polkadot and NFTs.
                      </p>
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
                      <p className="text-sm text-muted-foreground">
                        Instead of creating new accounts and passwords on every
                        website, just connect your wallet.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <div className="flex flex-row gap-2 mt-4 justify-between w-full items-center">
                  <a
                    href="https://learn.rainbow.me/understanding-web3?utm_source=rainbowkit&utm_campaign=learnmore"
                    className="text-md font-bold"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn more
                  </a>
                  {webAuthnSupport ? (
                    <Button
                      className="rounded-xl font-bold text-md hover:scale-105 transition-transform"
                      onClick={createWallet} // add a name to the wallet, can be your dapp name or user input
                    >
                      <KeyRound />
                      Create
                    </Button>
                  ) : (
                    <Button
                      disabled
                      className="rounded-xl font-bold text-md hover:scale-105 transition-transform"
                    >
                      <Ban />
                      Unsupported Browser
                    </Button>
                  )}
                </div>
              </DialogFooter>
              <div className="text-sm text-muted-foreground">
                Powered by{" "}
                <a
                  href="https://sigpasskit.com"
                  className="inline-flex items-center gap-1 font-bold underline underline-offset-4"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Sigpass
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </DialogContent>
          </Dialog>
        ) : wallet && !account.isConnected && address === undefined ? (
          <Button
            variant="outline"
            className="rounded-xl font-bold text-md hover:scale-105 transition-transform w-full"
            onClick={getWallet}
          >
            Get Wallet
          </Button>
        ) : wallet && !account.isConnected && address ? (
          <Dialog open={open} onOpenChange={setOpen}>
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
                {truncateAddress(address, 4)}
              </DialogDescription>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={copyAddress}
                  className="rounded-xl font-bold text-md hover:scale-105 transition-transform"
                >
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
                <Button
                  onClick={disconnect}
                  variant="outline"
                  className="rounded-xl font-bold text-md hover:scale-105 transition-transform"
                >
                  <LogOut />
                  Disconnect
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-2 items-center">
      {!wallet && !account.isConnected && !address ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button className="rounded-xl font-bold text-md hover:scale-105 transition-transform w-full">
              Create Wallet
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Create Wallet</DrawerTitle>
              <DrawerDescription>
                Instantly get a wallet with{" "}
                <a
                  href="https://www.yubico.com/resources/glossary/what-is-a-passkey/"
                  className="inline-flex items-center gap-1 font-bold underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Passkey
                  <ExternalLink className="h-4 w-4" />
                </a>
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
                    <h3 className="text-sm font-bold">
                      A Home for your Digital Assets
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Wallets are used to send, receive, store, and display
                      digital assets like Polkadot and NFTs.
                    </p>
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
                    <p className="text-sm text-muted-foreground">
                      Instead of creating new accounts and passwords on every
                      website, just connect your wallet.
                    </p>
                  </div>
                </div>
                <a
                  href="https://learn.rainbow.me/understanding-web3?utm_source=rainbowkit&utm_campaign=learnmore"
                  className="text-md font-bold text-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more
                </a>
              </div>
            </div>
            <DrawerFooter>
              {webAuthnSupport ? (
                <Button
                  className="rounded-xl font-bold text-md hover:scale-105 transition-transform"
                  onClick={createWallet}
                >
                  <KeyRound />
                  Create
                </Button>
              ) : (
                <Button
                  disabled
                  className="rounded-xl font-bold text-md hover:scale-105 transition-transform"
                >
                  <Ban />
                  Unsupported Browser
                </Button>
              )}
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
              <div className="text-sm text-muted-foreground">
                Powered by{" "}
                <a
                  href="https://sigpasskit.com"
                  className="inline-flex items-center gap-1 font-bold underline underline-offset-4"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Sigpass
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : wallet && !account.isConnected && address === undefined ? (
        <Button
          variant="outline"
          className="rounded-xl font-bold text-md hover:scale-105 transition-transform w-full"
          onClick={getWallet}
        >
          Get Wallet
        </Button>
      ) : wallet && !account.isConnected && address ? (
        <Drawer open={open} onOpenChange={setOpen}>
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
                {truncateAddress(address, 4)}
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col items-center gap-2">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={copyAddress}
                  className="rounded-xl font-bold text-md hover:scale-105 transition-transform"
                >
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
                <Button
                  onClick={disconnect}
                  variant="outline"
                  className="rounded-xl font-bold text-md hover:scale-105 transition-transform"
                >
                  <LogOut />
                  Disconnect
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      ) : null}
    </div>
  );
}

// CONNECT WALLET COMPONENT

// WalletOption component
function WalletOption({
  connector,
  onClick,
}: {
  connector: Connector;
  onClick: () => void;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const provider = await connector.getProvider();
      setReady(!!provider);
    })();
  }, [connector]);

  return (
    <button disabled={!ready} onClick={onClick} className="flex flex-row gap-2 items-center">
      {connector.icon ? (
        <Image src={connector.icon} alt={connector.name} width={24} height={24} />
      ): (
        <WalletMinimal />
      )}
      {connector.name}
    </button>
  );
}

function WalletOptions() {
  const { connectors, connect } = useConnect();
  const injectedConnector = connectors.find((connector) => connector.name === "Injected");
  const popularConnectors = connectors.filter((connector) => connector.name === "MetaMask" || connector.name === "Coinbase Wallet" || connector.name === "WalletConnect" || connector.name === "Rainbow");
  const otherConnectors = connectors.filter((connector) => !popularConnectors.includes(connector) && connector.name !== "Injected");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        {injectedConnector && (
          <WalletOption
            key={injectedConnector.uid}
            connector={injectedConnector}
            onClick={() => connect({ connector: injectedConnector })}
          />
        )}
      </div>
      <div className="flex flex-col gap-4">
        <h2>Popular</h2>
        {popularConnectors.map((connector) => (
          <WalletOption
            key={connector.uid}
            connector={connector}
            onClick={() => connect({ connector })}
          />
        ))}
      </div>
      <div className="flex flex-col gap-4">
        <h2>Other</h2>
        {otherConnectors.map((connector) => (
          <WalletOption
            key={connector.uid}
            connector={connector}
            onClick={() => connect({ connector })}
          />
        ))}
      </div>
    </div>
  )
}

function Account() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          {truncateAddress(address, 4)}
        </DialogDescription>
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={copyAddress}
            className="rounded-xl font-bold text-md hover:scale-105 transition-transform"
          >
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
          <Button
            onClick={() => disconnect()}
            variant="outline"
            className="rounded-xl font-bold text-md hover:scale-105 transition-transform"
          >
            <LogOut />
            Disconnect
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ConnectComponent() {
  const { isConnected } = useAccount();
  const [open, setOpen] = useState(false);

  if (isConnected) return <Account />;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl font-bold text-md hover:scale-105 transition-transform">
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[780px]">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Select a wallet to connect to the app
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-row gap-8">
          <div className="flex flex-col gap-4 w-1/3">
            <WalletOptions />
          </div>
          <div className="flex flex-col gap-8 border-l-2 pl-8">
            <div className="flex flex-col gap-8">
              <h2 className="font-bold">What is a Wallet?</h2>
              <div className="flex flex-row gap-4 items-center">
                <Image
                  src="/rainbowkit-1.svg"
                  alt="icon-1"
                  width={50}
                  height={50}
                />
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-bold">
                    A Home for your Digital Assets
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Wallets are used to send, receive, store, and display digital
                    assets like Polkadot and NFTs.
                  </p>
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
                  <p className="text-sm text-muted-foreground">
                    Instead of creating new accounts and passwords on every
                    website, just connect your wallet.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-4">
              <Button variant="secondary" asChild>
                <a href="https://intern.xyz" target="_blank" rel="noopener noreferrer">Find a Wallet App <ExternalLink className="h-4 w-4" /></a>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://buildui.org" target="_blank" rel="noopener noreferrer">Learn more <ExternalLink className="h-4 w-4" /></a>
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <div className="text-sm text-muted-foreground">
          Powered by{" "}
          <a
            href="https://buildui.org"
            className="inline-flex items-center gap-1 font-bold underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            BuildUI
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// UTILS 

export function truncateHash(hash: string, startLength: number = 6, endLength: number = 4) {
  return `${hash.slice(0, startLength)}...${hash.slice(-endLength)}`;
}

export function truncateAddress(address: Address | undefined, startLength: number = 6, endLength: number = 4) {
  if (!address) return "";
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

export function roundBalanceString(balanceString: string): string {
  const balance = parseFloat(balanceString);
  return balance.toFixed(4);
}



export function getEmojiFromAddress(address: string): string {
  const EMOJI_LIST = ["🦊", "🐱", "🐶", "🦁", "🐯", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐮", "🐷", "🐸", "🐙", "🦄", "🦋", "🐢", "🐳"];
  // Convert the first 2 bytes of the address to a number (0-255)
  const num = parseInt(address.slice(2, 6), 16);
  // Use modulo to get an index within the emoji list range
  return EMOJI_LIST[num % EMOJI_LIST.length];
}