import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Perch Privacy Policy",
  description:
    "Privacy policy for Perch, The Chimpions' read-only Solana validator monitoring app.",
  openGraph: {
    title: "Perch Privacy Policy | The Chimpions",
    description:
      "Privacy policy for Perch, The Chimpions' read-only Solana validator monitoring app.",
  },
};

const LAST_UPDATED = "July 20, 2026";

const linkClass =
  "text-gray-modern-50 hover:text-gold-500 transition-colors underline underline-offset-2 decoration-gray-modern-400 hover:decoration-gold-500";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-gray-modern-25 font-sans text-2xl font-bold">
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-gray-modern-300 font-sans text-xl leading-6">
        {children}
      </div>
    </section>
  );
}

export default function PerchPrivacyPage() {
  return (
    <section className="relative overflow-hidden bg-gray-modern-950">
      <div className="relative z-10 mx-auto max-w-3xl px-4 pb-24 pt-16 lg:pb-28 lg:pt-24">
        <h1 className="text-white font-title text-[40px] leading-11 xs:text-[50px] sm:leading-12">
          Perch <span className="text-gold-500">Privacy Policy</span>
        </h1>
        <p className="mt-4 text-gray-modern-400 font-sans text-lg">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="mt-10 flex flex-col gap-8">
          <p className="text-gray-modern-300 font-sans text-xl leading-6">
            Perch is a read-only Solana validator monitoring app. It displays
            publicly available on-chain and network information about validators
            you choose to track. This policy explains what data the app handles.
          </p>

          <Section title="Data we collect">
            <p>
              <span className="text-gray-modern-25 font-bold">None.</span> Perch
              has no user accounts, no login, and no analytics or tracking. We do
              not collect, store, or transmit any personal information to our own
              servers — Perch has no backend server.
            </p>
          </Section>

          <Section title="Data stored on your device">
            <p>
              The validator public keys and labels you choose to track, and any
              custom RPC endpoints you configure, are stored locally on your
              device only. This information never leaves your device except as
              part of the public API requests described below, and is removed
              when you delete the app.
            </p>
          </Section>

          <Section title="Third-party services">
            <p>
              To show live data, Perch makes requests directly from your device
              to public, third-party services. These requests include the
              validator public keys you are tracking (public blockchain
              identifiers, not personal data) and, as with any internet request,
              your device&apos;s IP address. Perch does not add any identifying
              information to these requests. The services are:
            </p>
            <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-gold-500">
              <li>
                Public Solana RPC endpoints (default or any endpoint you
                configure)
              </li>
              <li>Stakewiz API (api.stakewiz.com)</li>
              <li>Solana Foundation Delegation Program (SFDP) API</li>
            </ul>
            <p>
              These services are operated by third parties and have their own
              privacy practices, which we do not control.
            </p>
          </Section>

          <Section title="Data sharing and sale">
            <p>We do not sell, rent, or share any data. We have no data to share.</p>
          </Section>

          <Section title="Children's privacy">
            <p>
              Perch is not directed to children and does not knowingly collect
              data from anyone.
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              If this policy changes, we will update this page and revise the
              date above.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about this policy? Reach us on{" "}
              <a
                href="https://x.com/TheChimpions"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Twitter
              </a>{" "}
              or{" "}
              <a
                href="https://discord.com/invite/thechimpions"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Discord
              </a>
              .
            </p>
          </Section>
        </div>

        <div className="mt-14">
          <Link href="/validator" className={linkClass}>
            ← Back to Validator
          </Link>
        </div>
      </div>
    </section>
  );
}
