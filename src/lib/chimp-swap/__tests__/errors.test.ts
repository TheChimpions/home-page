import { describe, expect, it } from "vitest";
import { describeSwapError } from "../errors";

function withLogs(message: string, logs: string[]): Error {
  const err = new Error(message) as Error & { logs?: string[] };
  err.logs = logs;
  return err;
}

describe("describeSwapError", () => {
  it("recognises wallet rejections", () => {
    expect(describeSwapError(new Error("User rejected the request."))).toBe(
      "Transaction cancelled in wallet.",
    );
  });

  it("maps Anchor error names to friendly copy", () => {
    expect(
      describeSwapError(
        new Error("AnchorError occurred. Error Code: Paused. Error Number: 6004."),
      ),
    ).toMatch(/paused/i);
    expect(
      describeSwapError(new Error("Error Code: FeeAboveMax. Error Number: 6014.")),
    ).toMatch(/fee changed/i);
  });

  it("falls back to the IDL message for names without friendly copy", () => {
    expect(
      describeSwapError(new Error("Error Code: InvalidTreasury. Error Number: 6016.")),
    ).toBe("Treasury must be a funded account");
  });

  it("decodes custom program error codes from simulation logs", () => {
    // 0x1772 = 6002 = FeeTooHigh (third error in the IDL)
    expect(
      describeSwapError(
        withLogs("Simulation failed", [
          "Program log: Instruction: Swap",
          "Program failed: custom program error: 0x1772",
        ]),
      ),
    ).toBe("Swap fee exceeds the maximum allowed");
  });

  it("explains frozen SPL token errors", () => {
    expect(
      describeSwapError(new Error("failed: custom program error: 0x11")),
    ).toMatch(/frozen/i);
  });

  it("explains a vanished listing", () => {
    expect(
      describeSwapError(new Error("Error Code: AccountNotInitialized. Error Number: 3012.")),
    ).toMatch(/no longer available/i);
  });

  it("explains insufficient funds", () => {
    expect(
      describeSwapError(new Error("Transfer: insufficient lamports 10, need 2039280")),
    ).toMatch(/insufficient sol/i);
  });

  it("has a generic fallback", () => {
    expect(describeSwapError("???")).toBe("Transaction failed. Please try again.");
  });
});
