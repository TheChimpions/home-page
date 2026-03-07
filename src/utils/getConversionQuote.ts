export async function getConversionQuote(
  inputMint: string,
  outputMint: string,
  amount: string
) {
  const url = `https://lite-api.jup.ag/swap/v1/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50&restrictIntermediateTokens=true`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;

  return res.json();
}
