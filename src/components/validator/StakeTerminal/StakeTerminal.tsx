"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { InfoPanel, InfoPanelProps } from "./InfoPanel";
import { ConnectWalletButton } from "./ConnectWalletButton";
import { TokenInputBlock } from "./TokenInputBlock";
import { connection } from "@/lib/connection";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { TriangleAlert } from "lucide-react";
import { getSanctumTokens } from "@/utils/getSanctumTokens";
import { supportedTokens, Token } from "@/utils/supportedTokens";
import HeaderMetrics from "./HeaderMetrics";

const CHIMPSOL_MINT = "sctmZbtfE4dBNBEqBriQQVZLBrTaTjiTfKNRzKUcSLa";

const MAX_DECIMALS = 9;

export default function StakeTerminal() {
  const { publicKey } = useWallet();
  const [tokenList, setTokenList] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState("");
  const [conversionAmount, setConversionAmount] = useState("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [chimpSolBalance, setChimpSolBalance] = useState<number | null>(null);
  const [walletSymbol, setWalletSymbol] = useState<string>("SOL");
  const [isReversed, setIsReversed] = useState(false);
  const [isRefreshingBalances, setIsRefreshingBalances] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [tooSmall, setTooSmall] = useState(false);
  const [quoteInfo, setQuoteInfo] = useState<InfoPanelProps>({
    rate: null,
    priceImpactPct: null,
    routerLabel: null,
    feeAmount: null,
  });

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const quoteSeq = useRef(0);
  const latestInput = useRef<string>("");
  const lastRateRef = useRef<number | null>(null);

  const formatBalance = (balance: number): string => {
    if (balance === 0) return "0";
    if (balance < 0.001) return balance.toFixed(6);
    if (balance < 0.01) return balance.toFixed(4);
    if (balance < 1) return balance.toFixed(3);
    return balance.toFixed(2);
  };

  const refreshBalances = useCallback(async () => {
    if (!publicKey) {
      setWalletBalance(null);
      setChimpSolBalance(null);
      setIsRefreshingBalances(false);
      return;
    }

    setIsRefreshingBalances(true);

    try {
      const token = isReversed
        ? { address: CHIMPSOL_MINT, symbol: "ChimpSol" }
        : selectedToken;

      if (token) {
        setWalletSymbol(token.symbol);
        if (token.address === "So11111111111111111111111111111111111111112") {
          const lamports = await connection.getBalance(publicKey);
          setWalletBalance(lamports / 1e9);
        } else {
          const ata = await getAssociatedTokenAddress(
            new PublicKey(token.address),
            publicKey,
            false,
            TOKEN_PROGRAM_ID
          );
          const { value } = await connection.getParsedAccountInfo(ata);
          const data = value?.data;
          if (
            data &&
            typeof data !== "string" &&
            "parsed" in data &&
            data.program === "spl-token"
          ) {
            const rawAmount = data.parsed.info.tokenAmount.uiAmountString;
            setWalletBalance(parseFloat(rawAmount));
          } else {
            setWalletBalance(0);
          }
        }
      }

      const chimpSolAta = await getAssociatedTokenAddress(
        new PublicKey(CHIMPSOL_MINT),
        publicKey,
        false,
        TOKEN_PROGRAM_ID
      );
      const { value: chimpSolValue } = await connection.getParsedAccountInfo(
        chimpSolAta
      );
      const chimpSolData = chimpSolValue?.data;
      if (
        chimpSolData &&
        typeof chimpSolData !== "string" &&
        "parsed" in chimpSolData &&
        chimpSolData.program === "spl-token"
      ) {
        const rawAmount = chimpSolData.parsed.info.tokenAmount.uiAmountString;
        setChimpSolBalance(parseFloat(rawAmount));
      } else {
        setChimpSolBalance(0);
      }
    } catch (error) {
      console.error("Error refreshing balances:", error);
    } finally {
      setIsRefreshingBalances(false);
    }
  }, [publicKey, selectedToken, isReversed]);

  const handleStakeComplete = useCallback(async () => {
    setAmount("");
    setConversionAmount("");
    setTimeout(() => {
      refreshBalances();
    }, 500);
  }, [refreshBalances]);

  const limitDecimals = (value: string, limit: number) => {
    if (!value) return "";
    if (!value.includes(".")) return value;
    const [i, d] = value.split(".");
    return `${i}.${d.slice(0, limit)}`;
  };

  const inDecimals = useMemo(() => {
    if (!selectedToken) return 9;
    return isReversed ? 9 : Math.min(selectedToken.decimals, MAX_DECIMALS);
  }, [selectedToken, isReversed]);

  const outDecimals = useMemo(() => {
    if (!selectedToken) return 9;
    return isReversed ? Math.min(selectedToken.decimals, MAX_DECIMALS) : 9;
  }, [selectedToken, isReversed]);

  const minHumanUnit = useMemo(
    () => 1 / Math.pow(10, inDecimals),
    [inDecimals]
  );

  const handleAmountChange = (v: string) => {
    const val = limitDecimals(v.replace(",", "."), MAX_DECIMALS);
    setAmount(val);
    const num = parseFloat(val);
    if (!val || isNaN(num)) {
      quoteSeq.current++;
      setConversionAmount("");
      setTooSmall(false);
      return;
    }
    if (num > 0 && num < minHumanUnit) {
      quoteSeq.current++;
      setTooSmall(true);
      setConversionAmount("0");
      return;
    }
    setTooSmall(false);
  };

  const handleConversionChange = (v: string) => {
    const val = limitDecimals(v.replace(",", "."), MAX_DECIMALS);
    setConversionAmount(val);
    const num = parseFloat(val);
    if (!val || isNaN(num)) {
      quoteSeq.current++;
      setAmount("");
      setTooSmall(false);
      return;
    }
    const minOutHuman = 1 / Math.pow(10, outDecimals);
    if (num > 0 && num < minOutHuman) {
      quoteSeq.current++;
      setTooSmall(true);
      setAmount("0");
      return;
    }
    setTooSmall(false);
  };

  const isAbortError = (e: unknown): boolean =>
    e instanceof Error && e.name === "AbortError";

  const fetchQuote = useCallback(
    async (inputAmount: number, isInitialQuote = false) => {
      if (!selectedToken) return;
      if (isInitialQuote) setIsInitialLoading(true);
      const mySeq = ++quoteSeq.current;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      try {
        const baseAmount = BigInt(
          Math.floor(inputAmount * Math.pow(10, inDecimals))
        );
        const inputMint = isReversed ? CHIMPSOL_MINT : selectedToken.address;
        const outputMint = isReversed ? selectedToken.address : CHIMPSOL_MINT;

        const res = await fetch(
          `/api/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${baseAmount}`,
          { signal: controller.signal, cache: "no-store" }
        );

        if (!res.ok) return;

        const data = await res.json();
        if (mySeq !== quoteSeq.current) return;

        if (data?.outAmount != null) {
          const outUnits = BigInt(data.outAmount);

          if (outUnits === BigInt(0)) {
            setTooSmall(true);
            if (!isInitialQuote) {
              if (isReversed) setAmount("0");
              else setConversionAmount("0");
            }
            setQuoteInfo((q) => ({
              ...q,
              rate: lastRateRef.current ?? q.rate,
              priceImpactPct:
                data.priceImpactPct?.toString() ?? q.priceImpactPct,
              routerLabel:
                data.routePlan?.[0]?.swapInfo?.label ?? q.routerLabel,
              feeAmount:
                data.routePlan?.[0]?.swapInfo?.feeAmount?.toString() ??
                q.feeAmount,
            }));
            return;
          }

          setTooSmall(false);

          const outAdjusted =
            Number(data.outAmount) / Math.pow(10, outDecimals);
          const rateVal = outAdjusted / inputAmount;
          lastRateRef.current = rateVal;

          const newValue = outAdjusted.toFixed(Math.min(outDecimals, 9));
          if (!isInitialQuote) {
            if (isReversed) setAmount(newValue);
            else setConversionAmount(newValue);
          }

          setQuoteInfo({
            rate: rateVal,
            priceImpactPct: data.priceImpactPct?.toString() ?? "0",
            routerLabel: data.routePlan?.[0]?.swapInfo?.label ?? "none",
            feeAmount:
              data.routePlan?.[0]?.swapInfo?.feeAmount?.toString() ?? "0",
          });
        }
      } catch (err: unknown) {
        if (isAbortError(err)) return;
        console.error(err);
      } finally {
        clearTimeout(timeout);
        if (isInitialQuote) setIsInitialLoading(false);
      }
    },
    [selectedToken, isReversed, inDecimals, outDecimals]
  );

  useEffect(() => {
    latestInput.current = isReversed ? conversionAmount : amount;
  }, [amount, conversionAmount, isReversed]);

  useEffect(() => {
    const input = isReversed ? conversionAmount : amount;
    if (selectedToken && (!input || input === "0")) {
      fetchQuote(1, true);
    }
  }, [selectedToken, isReversed, amount, conversionAmount, fetchQuote]);

  useEffect(() => {
    if (isReversed) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const num = parseFloat(amount);
      if (!amount || isNaN(num) || num === 0 || tooSmall) {
        setConversionAmount("0");
        return;
      }
      fetchQuote(num);
    }, 500);
  }, [amount, isReversed, tooSmall, fetchQuote]);

  useEffect(() => {
    if (!isReversed) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const num = parseFloat(conversionAmount);
      if (!conversionAmount || isNaN(num) || num === 0 || tooSmall) {
        setAmount("0");
        return;
      }
      fetchQuote(num);
    }, 500);
  }, [conversionAmount, isReversed, tooSmall, fetchQuote]);

  useEffect(() => {
    if (!selectedToken) return;
    const id = setInterval(() => {
      const s = latestInput.current;
      const n = parseFloat(s as string);

      if (!s || Number.isNaN(n) || n === 0 || tooSmall) {
        if (isReversed) setAmount("0");
        else setConversionAmount("0");
        setQuoteInfo((q) => ({
          ...q,
          rate: lastRateRef.current ?? q.rate,
        }));
        return;
      }

      fetchQuote(n);
    }, 10000);
    return () => clearInterval(id);
  }, [selectedToken, isReversed, tooSmall, fetchQuote]);

  useEffect(() => {
    async function fetchTokens() {
      if (!publicKey) {
        setTokenList(supportedTokens);
        setSelectedToken(supportedTokens[0] ?? null);
        return;
      }
      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          {
            programId: new PublicKey(
              "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
            ),
          }
        );

        const uniqueMints = tokenAccounts.value
          .map((acc) => acc.account.data.parsed.info.mint)
          .filter(
            (mint, idx, arr) =>
              arr.indexOf(mint) === idx &&
              !supportedTokens.some((t) => t.address === mint)
          );

        const sanctumTokens = await getSanctumTokens(uniqueMints);
        const filteredSanctumTokens = sanctumTokens.filter(
          (token) => token.address !== CHIMPSOL_MINT
        );
        const allTokens = [...supportedTokens, ...filteredSanctumTokens];
        setTokenList(allTokens);
        setSelectedToken(allTokens[0] ?? null);
      } catch {
        setTokenList(supportedTokens);
        setSelectedToken(supportedTokens[0] ?? null);
      }
    }
    fetchTokens();
  }, [publicKey]);

  useEffect(() => {
    if (publicKey) {
      refreshBalances();
    } else {
      setIsRefreshingBalances(false);
    }
  }, [publicKey, selectedToken, isReversed, refreshBalances]);

  const inputSymbol = isReversed ? "ChimpSol" : selectedToken?.symbol ?? null;
  const outputSymbol = isReversed ? selectedToken?.symbol ?? null : "ChimpSol";

  const chimpSolToken = useMemo<Token>(() => {
    const found = tokenList.find((t) => t.address === CHIMPSOL_MINT);
    return (
      found ?? {
        address: CHIMPSOL_MINT,
        symbol: "ChimpSol",
        decimals: 9,
        chainId: 101,
        name: "ChimpSol",
        logoURI: "/logo/graphic.png",
      }
    );
  }, [tokenList]);

  const inputToken = useMemo<Token | null>(() => {
    return isReversed ? chimpSolToken : selectedToken ?? null;
  }, [isReversed, chimpSolToken, selectedToken]);

  const outputToken = useMemo<Token | null>(() => {
    return isReversed ? selectedToken ?? null : chimpSolToken;
  }, [isReversed, chimpSolToken, selectedToken]);

  const tokensReady = !!inputToken?.address && !!outputToken?.address;

  const canStake =
    tokensReady &&
    parseFloat(amount || "0") > 0 &&
    parseFloat(conversionAmount || "0") > 0 &&
    !tooSmall;

  const selectableTokens = useMemo(
    () => tokenList.filter((t) => t.address !== CHIMPSOL_MINT),
    [tokenList]
  );

  useEffect(() => {
    if (selectedToken?.address === CHIMPSOL_MINT) {
      const first = tokenList.find((t) => t.address !== CHIMPSOL_MINT) ?? null;
      setSelectedToken(first);
    }
  }, [tokenList, selectedToken]);

  useEffect(() => {
    setAmount("");
    setConversionAmount("");
  }, [selectedToken]);

  return (
    <div className="xl:p-6 p-4 w-full mx-auto flex flex-col gap-6 rounded-md border border-gray-modern-800 bg-gray-modern-900 shadow-[0_0_18px_rgba(0,0,0,0.25)]">
      <HeaderMetrics
        outputAmount={isReversed ? amount : conversionAmount}
        isCalculatingRewards={
          isInitialLoading || !conversionAmount || conversionAmount === "0"
        }
      />
      <div className="relative flex flex-col gap-2">
        <TokenInputBlock
          label="You're staking"
          value={isReversed ? conversionAmount : amount}
          onChange={isReversed ? handleConversionChange : handleAmountChange}
          readOnly={false}
          isChimpSol={isReversed}
          token={isReversed ? undefined : selectedToken ?? undefined}
          onSelectToken={!isReversed ? setSelectedToken : undefined}
          balance={
            walletBalance !== null
              ? `${formatBalance(walletBalance)} ${walletSymbol}`
              : undefined
          }
          isBalanceLoading={isRefreshingBalances}
          tokens={!isReversed ? selectableTokens : undefined}
        />

        <TokenInputBlock
          label="To receive"
          value={isReversed ? amount : conversionAmount}
          onChange={undefined}
          readOnly
          isChimpSol={!isReversed}
          token={!isReversed ? undefined : selectedToken ?? undefined}
          onSelectToken={isReversed ? setSelectedToken : undefined}
          balance={
            chimpSolBalance !== null
              ? `${formatBalance(chimpSolBalance)} ChimpSol`
              : undefined
          }
          isBalanceLoading={isRefreshingBalances}
          tokens={isReversed ? selectableTokens : undefined}
        />
      </div>

      <div className="flex flex-col gap-3">
        <InfoPanel
          {...quoteInfo}
          inputSymbol={inputSymbol}
          outputSymbol={outputSymbol}
          isLoading={isInitialLoading}
        />
        {tooSmall && (
          <p className="text-xs text-gray-modern-400 flex items-center gap-1.5 px-1">
            <TriangleAlert className="size-3" />
            Amount is below the minimum swap size for this route.
          </p>
        )}
      </div>

      <ConnectWalletButton
        amount={parseFloat(amount)}
        selectedToken={tokensReady ? inputToken : null}
        targetToken={tokensReady ? outputToken : null}
        blocked={!canStake}
        onStakeComplete={handleStakeComplete}
      />
    </div>
  );
}
