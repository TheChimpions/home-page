"use client";

import { CheckCircle2, Copy, ExternalLink, X } from "lucide-react";
import toast from "react-hot-toast";

interface SwapToastProps {
  sig: string;
}

export function SwapToast({ sig }: SwapToastProps) {
  return (
    <div className="rounded-md shadow-lg bg-gray-modern-900 border border-gray-modern-700 w-full max-w-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-modern-700">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-aqua-marine-500" />
          <div className="flex flex-col">
            <span className="font-semibold text-gray-modern-100">Swapped!</span>
            <span className="text-xs text-gray-modern-400">
              Transaction completed successfully
            </span>
          </div>
        </div>
        <button
          onClick={() => toast.dismiss()}
          className="text-gray-modern-500 hover:text-gray-modern-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-3">
        <span className="text-xs text-gray-modern-400 block mb-1">
          Transaction Hash
        </span>
        <div className="flex items-center justify-between bg-gray-modern-800 rounded py-2 px-2">
          <span className="text-xs font-mono truncate max-w-50 text-gray-modern-200">
            {sig.slice(0, 10)}...{sig.slice(-10)}
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(sig);
              toast.custom(
                <div className="flex items-center gap-2 bg-gray-modern-900 border border-gray-modern-700 rounded-md px-3 py-2 shadow">
                  <CheckCircle2 className="w-4 h-4 text-aqua-marine-500" />
                  <span className="text-sm text-gray-modern-100">
                    Signature copied!
                  </span>
                </div>,
                { duration: 1500 }
              );
            }}
            className="p-1 hover:bg-gray-modern-700 rounded transition-colors"
          >
            <Copy className="w-4 h-4 text-gray-modern-400" />
          </button>
        </div>
      </div>

      <div className="flex border-t border-gray-modern-700 divide-x divide-gray-modern-700">
        <button
          onClick={() => {
            navigator.clipboard.writeText(sig);
            toast.custom(
              <div className="flex items-center gap-2 bg-gray-modern-900 border border-gray-modern-700 rounded-md px-3 py-2 shadow">
                <CheckCircle2 className="w-4 h-4 text-aqua-marine-500" />
                <span className="text-sm text-gray-modern-100">Signature copied!</span>
              </div>,
              { duration: 1500 }
            );
          }}
          className="flex text-[14px] justify-center items-center gap-2 flex-1 px-3 py-2 hover:bg-gray-modern-800 text-xs text-gray-modern-300 transition-colors"
        >
          <Copy className="w-4 h-4" />
          <span className="mt-1">Copy Signature</span>
        </button>
        <a
          href={`https://solscan.io/tx/${sig}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[14px] justify-center flex-1 px-3 py-2 hover:bg-gray-modern-800 text-xs text-gray-modern-300 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="mt-1">SolScan Link</span>
        </a>
      </div>
    </div>
  );
}

export function showSwapToast(sig: string) {
  toast.custom(<SwapToast sig={sig} />, { duration: Infinity });
}
