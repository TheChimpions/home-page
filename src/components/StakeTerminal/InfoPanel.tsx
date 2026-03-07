export interface InfoPanelProps {
  rate: number | null;
  priceImpactPct: string | null;
  routerLabel: string | null;
  feeAmount: string | null;
  inputSymbol?: string | null;
  outputSymbol?: string | null;
  isLoading?: boolean;
}

export function InfoPanel({
  rate,
  priceImpactPct,
  routerLabel,
  feeAmount,
  inputSymbol,
  outputSymbol,
}: InfoPanelProps) {
  return (
    <div className="text-base flex flex-col gap-3 xs:gap-1 px-4 py-3 text-gray-modern-200 border border-gray-modern-700 rounded-md bg-gray-modern-800">
      <p className="flex flex-col xs:flex-row w-full justify-between items-start">
        Rate{" "}
        <span className="text-gray-modern-400">
          {rate && inputSymbol && outputSymbol
            ? `1 ${inputSymbol} ≈ ${rate.toFixed(6)} ${outputSymbol}`
            : "—"}
        </span>
      </p>
      <p className="flex flex-col xs:flex-row w-full justify-between items-start">
        Price Impact{" "}
        <span className="text-gray-modern-400">
          {priceImpactPct !== null
            ? `${(parseFloat(priceImpactPct) * 100).toFixed(2)}%`
            : "—"}
        </span>
      </p>
      <p className="flex flex-col xs:flex-row w-full justify-between items-start">
        Router{" "}
        <span className="text-gray-modern-400">{routerLabel || "none"}</span>
      </p>
      <p className="flex flex-col xs:flex-row w-full justify-between items-start">
        Fee{" "}
        <span className="text-gray-modern-400">
          {feeAmount
            ? (parseFloat(feeAmount) / 1e9).toLocaleString(undefined, {
                minimumFractionDigits: 6,
                maximumFractionDigits: 9,
              })
            : "0"}
        </span>
      </p>
    </div>
  );
}
