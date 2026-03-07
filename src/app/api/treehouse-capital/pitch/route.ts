import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

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

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: "Treehouse Capital <onboarding@resend.dev>",
      to: process.env.PITCH_TO_EMAIL!,
      replyTo: payload.email,
      subject: `New Pitch: ${payload.companyName} — ${payload.founderName}`,
      html: buildPitchEmail(payload),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 },
    );
  }
}

function buildPitchEmail(p: PitchPayload): string {
  const row = (label: string, value: string) =>
    value
      ? `<tr><td style="padding:8px 12px;color:#9ca3af;width:160px;vertical-align:top;white-space:nowrap">${label}</td><td style="padding:8px 12px;color:#f3f4f6">${value.replace(/\n/g, "<br>")}</td></tr>`
      : "";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0d121c;margin:0;padding:32px;font-family:sans-serif">
  <div style="max-width:600px;margin:0 auto;background:#161d2b;border:1px solid #1e2a3a;border-radius:8px;overflow:hidden">
    <div style="background:#0e7a5f;padding:24px 32px">
      <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700">New Pitch Submission</h1>
      <p style="margin:4px 0 0;color:#a7f3d0;font-size:14px">Treehouse Capital</p>
    </div>
    <div style="padding:24px 32px">
      <table style="width:100%;border-collapse:collapse">
        ${row("Founder", p.founderName)}
        ${row("Email", `<a href="mailto:${p.email}" style="color:#34d399">${p.email}</a>`)}
        ${row("Company", p.companyName)}
        ${row("Stage", p.stage)}
        ${row("Funding Ask", p.fundingAmount)}
        ${row("Website", p.websiteDemo ? `<a href="${p.websiteDemo}" style="color:#34d399">${p.websiteDemo}</a>` : "")}
        ${row("Twitter/Social", p.twitterSocial ? `<a href="${p.twitterSocial}" style="color:#34d399">${p.twitterSocial}</a>` : "")}
      </table>
      ${p.pitchDetails ? `<div style="margin-top:24px"><p style="color:#9ca3af;margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:.05em">Pitch Details</p><p style="color:#f3f4f6;margin:0;white-space:pre-wrap">${p.pitchDetails}</p></div>` : ""}
      ${p.whySolana ? `<div style="margin-top:24px"><p style="color:#9ca3af;margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:.05em">Why Solana?</p><p style="color:#f3f4f6;margin:0;white-space:pre-wrap">${p.whySolana}</p></div>` : ""}
      ${p.additionalInformation ? `<div style="margin-top:24px"><p style="color:#9ca3af;margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:.05em">Additional Information</p><p style="color:#f3f4f6;margin:0;white-space:pre-wrap">${p.additionalInformation}</p></div>` : ""}
    </div>
  </div>
</body>
</html>`;
}
