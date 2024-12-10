"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from 'lucide-react';
import { Address } from "viem/accounts";
import { createSigpassWallet, getSigpassWallet, checkSigpassWallet } from "@/lib/sigpass";
import { kairos } from 'wagmi/chains'

// this part is demo so feel free to remove
import { useSendTransaction, useBalance } from 'wagmi'
import { parseEther, formatEther } from 'viem'

export default function SigpassKit() {
  const [wallet, setWallet] = useState<boolean>(false);
  const [address, setAddress] = useState<Address | undefined>(undefined);
  const { data: hash, sendTransaction } = useSendTransaction();
  const balance = useBalance({
    chainId: kairos.id,
    address: address,
  })


  useEffect(() => {
    async function fetchWalletStatus() {
      const status = await checkSigpassWallet();
      setWallet(status);
    }
    fetchWalletStatus();
  }, []);

  async function getWallet() {
    const account = await getSigpassWallet();
    if (account) {
      setAddress(account.address);
    }
  }

  function truncateAddress(address: Address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  function truncateHash(hash: string) {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  }

  async function send() {
    const account = await getSigpassWallet();
    sendTransaction({ 
      account: account,     
      to: '0xe3d25540BA6CED36a0ED5ce899b99B5963f43d3F',
      value: parseEther('0.001'),
      chainId: kairos.id,
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {
        address ? (
          <WalletCopyButton
            copyText={address}
            buttonTitle={truncateAddress(address)}
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
      <p>
        {balance?.data?.value ? `Balance: ${formatEther(balance.data.value)}` : "Balance: 0"}
      </p>
      <Button
        onClick={send}
      >{hash ? <a href={`https://kairos.kaiascan.io/tx/${hash}`}>{truncateHash(hash)}</a> : "Send"}</Button>
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

