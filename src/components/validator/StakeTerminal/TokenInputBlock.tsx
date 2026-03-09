"use client";

import { Token } from "@/utils/supportedTokens";
import { AmountInput } from "./AmountInput";
import TokenSelect from "./TokenSelect";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface TokenInputBlockProps {
  label: string;
  value: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
  balance?: string;
  isBalanceLoading?: boolean;
  token?: Token;
  onSelectToken?: (token: Token) => void;
  isChimpSol?: boolean;
  tokens?: Token[];
}

const MAX_AMOUNT = 99_999_999;

export function TokenInputBlock({
  label,
  value,
  onChange,
  readOnly,
  balance,
  isBalanceLoading,
  token,
  onSelectToken,
  isChimpSol,
  tokens,
}: TokenInputBlockProps) {
  const sanitize = (raw: string) => {
    let s = (raw || "").replace(/[^\d.]/g, "");
    const firstDot = s.indexOf(".");
    if (firstDot !== -1) {
      s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, "");
    }
    return s;
  };

  const handleChange = (v: string) => {
    const s = sanitize(v);
    if (s === "") {
      onChange?.("");
      return;
    }

    const hasDot = s.includes(".");
    const [intStrRaw, decStr = ""] = s.split(".");
    const intStr = intStrRaw.replace(/^0+(?=\d)/, "");

    if (hasDot) {
      onChange?.(`${intStr || "0"}.${decStr}`);
      return;
    }

    const intNum = intStr === "" ? 0 : Number(intStr);
    if (Number.isFinite(intNum) && intNum > MAX_AMOUNT) return;

    onChange?.(intStr || "0");
  };

  const handleClickBalance = () => {
    const numeric = (balance?.split(" ")[0] || "0").replace(/,/g, "");
    const s = sanitize(numeric);
    const [intStrRaw, decStr] = s.split(".");
    const intStr = intStrRaw || "0";
    const intNum = Number(intStr);
    const capped = intNum > MAX_AMOUNT ? String(MAX_AMOUNT) : String(intNum);
    onChange?.(decStr !== undefined ? `${capped}.${decStr}` : capped);
  };

  return (
    <div className="p-4 rounded-md flex flex-col gap-1 border border-gray-modern-700 bg-gray-modern-800">
      <div className="flex justify-between items-center">
        <label className="text-base font-normal text-gray-modern-400">
          {label}
        </label>
        {isBalanceLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-modern-500">
            <Loader2 className="w-3 h-3 animate-spin" />
            Loading...
          </div>
        ) : balance ? (
          <button
            onClick={handleClickBalance}
            className="hidden xs:block text-base text-gray-modern-300 hover:text-gray-modern-100 transition-colors"
          >
            {balance}
          </button>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <AmountInput
            label=""
            value={value}
            onChange={handleChange}
            readOnly={readOnly}
          />
        </div>

        {isChimpSol ? (
          <div>
            <Image
              src="/logo/logo_bordered_fff.png"
              alt="ChimpSol Logo"
              width={29}
              height={29}
              quality={100}
              priority
            />
          </div>
        ) : token && onSelectToken ? (
          <div className="shrink-0 h-10 flex items-center">
            <TokenSelect
              token={token}
              onSelect={onSelectToken}
              tokens={tokens || []}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
