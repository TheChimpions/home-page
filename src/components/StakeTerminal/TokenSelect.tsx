"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Token } from "@/utils/supportedTokens";

interface Props {
  token: Token;
  onSelect: (token: Token) => void;
  tokens: Token[];
}

export default function TokenSelect({ token, onSelect, tokens = [] }: Props) {
  if (!token) return null;

  return (
    <Select
      value={token.address}
      onValueChange={(value) => {
        const selected = tokens.find((t) => t.address === value);
        if (selected) onSelect(selected);
      }}
    >
      <SelectTrigger className="font-poppins font-normal w-auto h-auto p-0 border-0 bg-transparent !cursor-pointer shadow-none focus:ring-0 focus:outline-none">
        <SelectValue aria-label={token.symbol} className="!cursor-pointer">
          {token.logoURI && (
            <img
              src={token.logoURI}
              alt={token.symbol}
              width={24}
              height={24}
              className="rounded-full !cursor-pointer"
            />
          )}
        </SelectValue>
      </SelectTrigger>

      <SelectContent className="font-poppins font-normal w-40 max-h-50 p-1 bg-gray-modern-900 border border-gray-modern-700 text-gray-modern-100">
        {tokens.map((t) => (
          <SelectItem key={t.address} value={t.address} className="px-2 py-1.5 focus:bg-gray-modern-800 focus:text-white">
            <div className="flex items-center gap-2 min-w-0">
              {t.logoURI && (
                <img
                  src={t.logoURI}
                  alt={t.symbol}
                  width={20}
                  height={20}
                  className="rounded-full flex-shrink-0"
                />
              )}
              <span className="text-base truncate">{t.symbol}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
