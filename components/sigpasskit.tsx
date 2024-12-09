"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from 'lucide-react';
import { Account, Address } from "viem/accounts";
import { createSigpassWallet, getSigpassWallet, checkSigpassWallet } from "@/lib/sigpass";

export default function SigpassKit() {
  const [wallet, setWallet] = useState<boolean>(false);
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    async function fetchWalletStatus() {
      const status = await checkSigpassWallet();
      setWallet(status);
    }
    fetchWalletStatus();
  }, []);

  async function getWallet() {
    const account = await getSigpassWallet();
    setAccount(account);
  }

  function truncateAddress(address: Address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  return (
    <div>

      {
        account ? (
          <WalletCopyButton
            copyText={account.address}
            buttonTitle={truncateAddress(account.address)}
          />
        ) : (
          <Button
            className="rounded-xl font-bold text-md"
            onClick={async () => {
              if (wallet) {
                await getWallet();
              } else {
                await createSigpassWallet("dapp");
              }
              setWallet(!wallet);
            }}
          >
            {
              wallet ? "Get Wallet" : "Create Wallet"
            }
          </Button>
        )
      }
    </div>
  )
}


 
export function WalletCopyButton({
  copyText,
  buttonTitle,
}: {
  copyText: Address | string | null;
  buttonTitle: string;
}) {
  const [isCopied, setIsCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(copyText ? copyText : "");
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  return (
    <Button disabled={isCopied} onClick={copy} className="p-4 rounded-xl font-mono">
      {isCopied ? (
        <div className="flex flex-row gap-2 items-center">
          {buttonTitle}
          <Check className="h-4 w-4" />
        </div>
      ) : (
        <div className="flex flex-row gap-2 items-center">
          {buttonTitle}
          <Copy className="h-4 w-4" />
        </div>
      )}
    </Button>
  );
}

