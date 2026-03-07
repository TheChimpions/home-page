"use client";

import { useEffect, useState } from "react";

interface HeaderMetricsProps {
  className?: string;
  outputAmount?: string;
  isCalculatingRewards?: boolean;
}

interface MetricsData {
  apy: number;
  estRewardsPerYear: number;
  tvl?: number;
}

export function HeaderMetrics({
  className = "",
  outputAmount,
  isCalculatingRewards = false,
}: HeaderMetricsProps) {
  const [metrics, setMetrics] = useState<MetricsData>({
    apy: 6.84,
    estRewardsPerYear: 0,
    tvl: undefined,
  });
  const [isLoading, setIsLoading] = useState(true);

  const formatRewards = (value: number): string => {
    if (value === 0) return "0";
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
    if (value >= 1) return value.toFixed(2);
    return value.toFixed(6);
  };

  useEffect(() => {
    if (metrics.apy && outputAmount && parseFloat(outputAmount) > 0) {
      const output = parseFloat(outputAmount);
      const annualRewards = (metrics.apy / 100) * output;
      setMetrics((prev) => ({ ...prev, estRewardsPerYear: annualRewards }));
    } else {
      setMetrics((prev) => ({ ...prev, estRewardsPerYear: 0 }));
    }
  }, [metrics.apy, outputAmount]);

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/validator-rewards", {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to fetch validator rewards");
        const data = await response.json();
        setMetrics((prev) => ({ ...prev, apy: data.apy || 6.84 }));
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
        setMetrics((prev) => ({ ...prev, apy: 6.84 }));
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div
      className={`gap-4 xs:gap-0 flex xs:flex-row flex-col items-center xs:justify-between ${className}`}
    >
      <div className="flex flex-col xs:w-1/2 w-full items-start sm:border-r xs:border-gray-modern-700 xs:px-4">
        <div className="text-xl text-gray-modern-400 font-normal mb-1">
          ChimpSol APY
        </div>
        <div className="text-xl font-medium text-white">
          {isLoading ? (
            <div className="animate-pulse bg-gray-modern-700 h-7 w-16 rounded" />
          ) : (
            `${metrics.apy.toFixed(2)}%`
          )}
        </div>
      </div>

      <div className="flex flex-col items-start xs:items-end sm:items-start xs:w-1/2 w-full pr-4 sm:pr-0 sm:pl-8">
        <div className="text-xl text-gray-modern-400 font-normal mb-1">
          Est. rewards per year
        </div>
        <div className="text-xl font-medium text-white">
          {isLoading ? (
            <div className="animate-pulse bg-gray-modern-700 h-7 w-20 rounded" />
          ) : isCalculatingRewards &&
            outputAmount &&
            parseFloat(outputAmount) > 0 ? (
            <div className="animate-pulse  bg-gray-modern-700 h-7 w-20 rounded" />
          ) : (
            `${formatRewards(metrics.estRewardsPerYear)} ChimpSol`
          )}
        </div>
      </div>
    </div>
  );
}

export default HeaderMetrics;
