"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import toast from "react-hot-toast";
import { connection } from "@/lib/connection";
import { swapChimpSolFromJupiter } from "@/lib/transactions/staking";
import { showSwapToast } from "./ShowSwapToast";
import { XCircle, Loader2, Coins, Wallet, Fingerprint } from "lucide-react";
import { Token } from "@/utils/supportedTokens";

interface ConnectWalletButtonProps {
  amount: number;
  selectedToken?: Token | null;
  targetToken?: Token | null;
  blocked?: boolean;
  onStakeComplete?: () => void;
}

export function ConnectWalletButton({
  amount,
  selectedToken,
  targetToken,
  blocked = false,
  onStakeComplete,
}: ConnectWalletButtonProps) {
  const { publicKey, connected, connecting, sendTransaction } = useWallet();
  const { setVisible } = useWalletModal();
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ready = useMemo(() => {
    const hasWallet = !!publicKey && !!connected;
    const hasTokens = !!selectedToken?.address && !!targetToken?.address;
    const positiveAmount = amount > 0 && Number.isFinite(amount);
    return hasWallet && hasTokens && positiveAmount && !blocked;
  }, [publicKey, connected, selectedToken, targetToken, amount, blocked]);

  const handleStake = async () => {
    if (!publicKey || !sendTransaction) {
      showErrorToast("Please connect your wallet.");
      return;
    }
    if (!(selectedToken?.address && targetToken?.address)) {
      showErrorToast("Select both tokens before swapping.");
      return;
    }
    if (!(amount > 0 && Number.isFinite(amount))) {
      showErrorToast("Enter a valid amount.");
      return;
    }
    if (blocked) {
      showErrorToast("Amount too small for swap.");
      return;
    }

    try {
      setIsProcessing(true);

      const inputMint = selectedToken.address;
      const outputMint = targetToken.address;
      const scale = 10 ** selectedToken.decimals;
      const lamports = Math.round(amount * scale);

      const quoteRes = await fetch(
        `/api/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${lamports}`
      );
      if (!quoteRes.ok) throw new Error("Failed to get quote");

      const quoteResponse = await quoteRes.json();

      const sig = await swapChimpSolFromJupiter(
        connection,
        quoteResponse,
        publicKey,
        (tx) => sendTransaction(tx, connection)
      );

      showSwapToast(sig);
      onStakeComplete?.();
    } catch (err) {
      console.error(err);
      showErrorToast("Swap failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const showErrorToast = (message: string) => {
    toast.custom(
      <div className="flex items-center gap-2 bg-gray-modern-900 border border-gray-modern-700 rounded-md px-3 py-2 shadow">
        <XCircle className="w-4 h-4 text-red-400" />
        <span className="text-sm text-gray-modern-100">{message}</span>
      </div>,
      { duration: 2000 }
    );
  };

  if (!mounted) {
    return (
      <button
        disabled
        className="w-full py-3 px-4 bg-aqua-marine-500/50 text-gray-modern-950 rounded-md cursor-not-allowed opacity-50 flex items-center justify-center gap-3 transition-all duration-200"
      >
        Connect Wallet
      </button>
    );
  }

  if (!connected || !publicKey) {
    return (
      <button
        onClick={() => setVisible(true)}
        disabled={connecting}
        className="w-full py-3 px-4 bg-aqua-marine-500 hover:bg-aqua-marine-400 text-gray-modern-950 font-medium rounded-md cursor-pointer flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Connect Wallet
        <Fingerprint className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <button
        onClick={handleStake}
        disabled={isProcessing || !ready}
        className={`
          group w-full py-3 px-4 rounded-md flex items-center justify-center gap-2
          transition-colors duration-200 font-medium
          ${
            isProcessing
              ? "bg-aqua-marine-500/70 cursor-not-allowed opacity-70 text-gray-modern-950"
              : !ready
              ? "bg-gray-modern-700 cursor-not-allowed text-gray-modern-500"
              : "bg-aqua-marine-500 hover:bg-aqua-marine-400 cursor-pointer text-gray-modern-950"
          }
        `}
      >
        {isProcessing ? (
          <>
            Processing...
            <Loader2 className="w-4 h-4 animate-spin" />
          </>
        ) : !ready ? (
          <>
            Select Amount
            <Coins className="w-4 h-4 opacity-80" />
          </>
        ) : (
          <>
            Stake
            <Wallet className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px" />
          </>
        )}
      </button>
    </div>
  );
}

export default ConnectWalletButton;
