import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Address } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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