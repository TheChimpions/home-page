"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";

type PitchFormValues = {
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

type FieldConfig = {
  key: keyof PitchFormValues;
  placeholder: string;
  maxLength: number;
  sanitize: "singleLine" | "multiLine" | "email";
  isUrl?: true;
  inputType?: "text" | "email";
  autoComplete?: string;
  inputMode?: "url";
  rows?: number;
  minHeight?: string;
};

const FIELD_ROWS: FieldConfig[][] = [
  [
    {
      key: "founderName",
      placeholder: "Founder Name",
      maxLength: 80,
      sanitize: "singleLine",
      inputType: "text",
      autoComplete: "name",
    },
    {
      key: "email",
      placeholder: "Email",
      maxLength: 140,
      sanitize: "email",
      inputType: "email",
      autoComplete: "email",
    },
  ],
  [
    {
      key: "companyName",
      placeholder: "Company Name",
      maxLength: 100,
      sanitize: "singleLine",
      inputType: "text",
      autoComplete: "organization",
    },
    {
      key: "stage",
      placeholder: "Stage",
      maxLength: 80,
      sanitize: "singleLine",
      inputType: "text",
    },
  ],
  [
    {
      key: "fundingAmount",
      placeholder: "Funding Amount Sought",
      maxLength: 80,
      sanitize: "singleLine",
      inputType: "text",
    },
  ],
  [
    {
      key: "pitchDetails",
      placeholder: "Pitch Details",
      maxLength: 1600,
      sanitize: "multiLine",
      rows: 5,
      minHeight: "min-h-46",
    },
  ],
  [
    {
      key: "whySolana",
      placeholder: "Why Solana?",
      maxLength: 1200,
      sanitize: "multiLine",
      rows: 5,
      minHeight: "min-h-45",
    },
  ],
  [
    {
      key: "websiteDemo",
      placeholder: "Website/Demo",
      maxLength: 220,
      sanitize: "singleLine",
      isUrl: true,
      inputType: "text",
      inputMode: "url",
      autoComplete: "url",
    },
    {
      key: "twitterSocial",
      placeholder: "Twitter/Social",
      maxLength: 220,
      sanitize: "singleLine",
      isUrl: true,
      inputType: "text",
      inputMode: "url",
      autoComplete: "url",
    },
  ],
  [
    {
      key: "additionalInformation",
      placeholder: "Additional Information",
      maxLength: 1200,
      sanitize: "multiLine",
      rows: 6,
      minHeight: "min-h-56",
    },
  ],
];

const ALL_FIELDS = FIELD_ROWS.flat();
const FIELD_MAP = new Map(ALL_FIELDS.map((f) => [f.key, f]));
const initialValues = Object.fromEntries(
  ALL_FIELDS.map((f) => [f.key, ""]),
) as PitchFormValues;

function sanitizeSingleLine(value: string, maxLength: number): string {
  return value
    .replace(/[<>{}`]/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trimStart()
    .slice(0, maxLength);
}

function sanitizeMultiLine(value: string, maxLength: number): string {
  return value
    .replace(/[<>{}`]/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimStart()
    .slice(0, maxLength);
}

function sanitizeEmail(value: string, maxLength: number): string {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase()
    .slice(0, maxLength);
}

function sanitizeByMode(
  value: string,
  mode: FieldConfig["sanitize"],
  maxLength: number,
): string {
  if (mode === "email") return sanitizeEmail(value, maxLength);
  if (mode === "multiLine") return sanitizeMultiLine(value, maxLength);
  return sanitizeSingleLine(value, maxLength);
}

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
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

const INPUT_CLASS =
  "block h-13 w-full rounded-[2px] border border-[#1d2942] bg-[#121926] px-4 text-xl text-gray-modern-200 placeholder:text-gray-modern-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-aqua-marine-500/70";

const TEXTAREA_BASE_CLASS =
  "block w-full resize-y rounded-[2px] border border-[#1d2942] bg-[#121926] px-4 py-3 text-xl text-gray-modern-200 placeholder:text-gray-modern-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-aqua-marine-500/70";

export default function TreehouseCapitalPitchForm() {
  const [values, setValues] = useState<PitchFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (key: keyof PitchFormValues, rawValue: string) => {
    const { sanitize, maxLength } = FIELD_MAP.get(key)!;
    setValues((current) => ({
      ...current,
      [key]: sanitizeByMode(rawValue, sanitize, maxLength),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const payload = Object.fromEntries(
      ALL_FIELDS.map((f) => [
        f.key,
        f.isUrl ? normalizeUrl(values[f.key]) : values[f.key].trim(),
      ]),
    ) as PitchFormValues;

    if (!payload.founderName || !payload.email || !payload.companyName) {
      toast.error("Please fill founder name, email, and company name.");
      return;
    }
    if (!isValidEmail(payload.email)) {
      toast.error("Please enter a valid email.");
      return;
    }
    if (payload.websiteDemo && !isValidUrl(payload.websiteDemo)) {
      toast.error("Website/Demo must be a valid URL.");
      return;
    }
    if (payload.twitterSocial && !isValidUrl(payload.twitterSocial)) {
      toast.error("Twitter/Social must be a valid URL.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/treehouse-capital/pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error || "Failed to submit pitch.");
      }

      toast.success("Pitch submitted successfully.");
      setValues(initialValues);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Submit failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full">
      <article className="relative overflow-hidden rounded-md bg-[#212F49] py-8 lg:py-12">
        <div className="relative z-10">
          <div className="mx-auto flex max-w-4xl flex-col gap-4 text-center">
            <h2 className="text-[2.25rem] leading-10 text-white">
              Pitch Your{" "}
              <span
                className="animate-gradient-flow font-bold"
                style={
                  {
                    background:
                      "linear-gradient(90deg, #11EEB4 0%, #b9feeb 25%, #11EEB4 50%, #b9feeb 75%, #11EEB4 100%)",
                    backgroundSize: "200% 100%",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    WebkitTextFillColor: "transparent",
                  } as React.CSSProperties
                }
              >
                Forward-Thinking
              </span>{" "}
              Idea
            </h2>
            <p className="text-xl leading-5 text-gray-modern-400">
              Have a game-changing idea? We want to hear it. Use our submission
              form to share deal details.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex w-full flex-col gap-6"
            noValidate
          >
            {FIELD_ROWS.map((row, i) => (
              <div
                key={i}
                className={
                  row.length > 1
                    ? "grid grid-cols-1 gap-4 lg:grid-cols-2"
                    : undefined
                }
              >
                {row.map((f) =>
                  f.rows !== undefined ? (
                    <textarea
                      key={f.key}
                      value={values[f.key]}
                      onChange={(e) => setField(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      rows={f.rows}
                      className={`${f.minHeight} ${TEXTAREA_BASE_CLASS}`}
                    />
                  ) : (
                    <input
                      key={f.key}
                      type={f.inputType ?? "text"}
                      value={values[f.key]}
                      onChange={(e) => setField(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      autoComplete={f.autoComplete}
                      inputMode={f.inputMode}
                      className={INPUT_CLASS}
                    />
                  ),
                )}
              </div>
            ))}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-2 min-w-40 rounded-sm bg-aqua-marine-500 px-20 text-xl font-bold leading-none text-gray-modern-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </div>
      </article>
    </section>
  );
}
