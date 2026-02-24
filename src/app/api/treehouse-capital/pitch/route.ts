import { NextRequest, NextResponse } from "next/server";

type PitchPayload = {
  founderName: string;
  email: string;
  companyName: string;
  stage: string;
  fundingAmount: string;
  pitchDetails: string;
  whySolana: string;
  websiteDemo: string;
  twitterSocial: string;
  additionalInformation: string;
};

const maxLengthByField: Record<keyof PitchPayload, number> = {
  founderName: 80,
  email: 140,
  companyName: 100,
  stage: 80,
  fundingAmount: 80,
  pitchDetails: 1600,
  whySolana: 1200,
  websiteDemo: 220,
  twitterSocial: 220,
  additionalInformation: 1200,
};

function sanitizeSingleLine(value: string, maxLength: number): string {
  return value
    .replace(/[<>{}`]/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function sanitizeMultiLine(value: string, maxLength: number): string {
  return value
    .replace(/[<>{}`]/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
}

function sanitizeEmail(value: string, maxLength: number): string {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase()
    .slice(0, maxLength);
}

function normalizeUrl(value: string): string {
  const clean = sanitizeSingleLine(value, 220);
  if (!clean) return "";
  if (/^https?:\/\//i.test(clean)) return clean;
  return `https://${clean}`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function sanitizePayload(raw: unknown): PitchPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const input = raw as Partial<PitchPayload>;

  return {
    founderName: sanitizeSingleLine(
      String(input.founderName ?? ""),
      maxLengthByField.founderName,
    ),
    email: sanitizeEmail(String(input.email ?? ""), maxLengthByField.email),
    companyName: sanitizeSingleLine(
      String(input.companyName ?? ""),
      maxLengthByField.companyName,
    ),
    stage: sanitizeSingleLine(
      String(input.stage ?? ""),
      maxLengthByField.stage,
    ),
    fundingAmount: sanitizeSingleLine(
      String(input.fundingAmount ?? ""),
      maxLengthByField.fundingAmount,
    ),
    pitchDetails: sanitizeMultiLine(
      String(input.pitchDetails ?? ""),
      maxLengthByField.pitchDetails,
    ),
    whySolana: sanitizeMultiLine(
      String(input.whySolana ?? ""),
      maxLengthByField.whySolana,
    ),
    websiteDemo: normalizeUrl(String(input.websiteDemo ?? "")),
    twitterSocial: normalizeUrl(String(input.twitterSocial ?? "")),
    additionalInformation: sanitizeMultiLine(
      String(input.additionalInformation ?? ""),
      maxLengthByField.additionalInformation,
    ),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const payload = sanitizePayload(body);

    if (!payload) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    if (!payload.founderName || !payload.email || !payload.companyName) {
      return NextResponse.json(
        { error: "Founder name, email, and company name are required." },
        { status: 400 },
      );
    }

    if (!isValidEmail(payload.email)) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    if (payload.websiteDemo && !isValidUrl(payload.websiteDemo)) {
      return NextResponse.json(
        { error: "Website/Demo URL is invalid." },
        { status: 400 },
      );
    }

    if (payload.twitterSocial && !isValidUrl(payload.twitterSocial)) {
      return NextResponse.json(
        { error: "Twitter/Social URL is invalid." },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 },
    );
  }
}
