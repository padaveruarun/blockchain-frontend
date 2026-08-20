import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  QrCode,
  Scale,
  Database,
  Lock,
  BadgeCheck,
  Building2,
  GraduationCap,
  ScanLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const benefits = [
  { icon: ShieldCheck, title: "Tamper-proof", text: "SHA-256 hashes are anchored on the blockchain. Any alteration is instantly detected." },
  { icon: QrCode, title: "Instant verification", text: "Scan a QR code or enter a certificate ID — no account required." },
  { icon: Database, title: "Decentralized proof", text: "Certificate validity is independently confirmed on-chain, not just in one database." },
];

const roles = [
  { icon: Building2, title: "For Institutions", text: "Issue tamper-proof certificates and revoke them when needed." },
  { icon: GraduationCap, title: "For Students", text: "Share verifiable credentials that employers trust." },
  { icon: Scale, title: "For Verifiers", text: "Confirm authenticity in seconds, without paperwork." },
];

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 text-center md:py-32">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 -z-10 h-96 w-96 rounded-full bg-violet-400/5 blur-3xl animate-pulse-glow" />
        
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/50 backdrop-blur-xs px-3.5 py-1.5 text-xs font-semibold text-indigo-700">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Blockchain Secured Verification
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-navy-900 sm:text-5xl md:text-6xl leading-[1.1]">
          Verify. Trust. <span className="bg-gradient-to-r from-navy-500 to-indigo-600 bg-clip-text text-transparent">Secure.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base md:text-lg text-slate-500 leading-relaxed">
          Cryptographic certificate verification powered by immutable ledgers. 
          Institutions anchor credentials, students share, and verifiers validate authenticity instantly.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button asChild variant="primary" size="lg" className="bg-navy-500 hover:bg-navy-700 shadow-md shadow-navy-500/10 hover:scale-[1.02] transition-transform">
            <Link to="/verify" className="gap-2">
              Verify Certificate <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="hover:bg-slate-50 hover:border-slate-300">
            <Link to="/how-it-works">How It Works</Link>
          </Button>
        </div>
      </section>

      {/* How verification works */}
      <section className="py-16 border-t border-slate-100" aria-labelledby="how-it-works">
        <div className="text-center">
          <h2 id="how-it-works" className="text-2xl font-bold tracking-tight text-navy-900 md:text-3xl">
            How verification works
          </h2>
          <p className="mt-3 text-sm text-slate-500">A decentralized three-step verification process to ensure zero tampering.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { step: "01", title: "Certificate Hashing", text: "A unique SHA-256 fingerprint is generated directly from the certificate data." },
            { step: "02", title: "On-Chain Anchoring", text: "The cryptographic fingerprint is written to the blockchain ledger forever." },
            { step: "03", title: "Instant Integrity Check", text: "The live certificate is hashed and matched against the on-chain registry." },
          ].map((item) => (
            <Card key={item.step} className="p-6 card-hover relative group overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 bg-navy-50 group-hover:bg-navy-100 transition-colors rounded-full -z-10" />
              <span className="text-xs font-bold uppercase tracking-wider text-navy-500">Step {item.step}</span>
              <h3 className="mt-3 text-lg font-bold text-navy-900 group-hover:text-navy-500 transition-colors">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Blockchain security */}
      <section className="py-16 border-t border-slate-100" aria-labelledby="security">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="space-y-6">
            <h2 id="security" className="text-2xl font-bold tracking-tight text-navy-900 md:text-3xl">
              Why use the blockchain?
            </h2>
            <p className="text-sm leading-relaxed text-slate-500">
              Traditional databases are centralized, making them vulnerable to single-point modification or unauthorized changes. CertiChain writes a certificate's fingerprint to an immutable ledger where it cannot be forged, altered, or deleted.
            </p>
            <ul className="space-y-4">
              {benefits.map((b) => (
                <li key={b.title} className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-800">
                    <b.icon className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-navy-900">{b.title}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{b.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <Card className="p-6 md:p-8 border-slate-100 bg-gradient-to-tr from-slate-50 to-white shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 text-verified">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-verified">
                <BadgeCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="font-semibold text-sm">Automated Integrity Engine</span>
            </div>
            
            {/* Visual Matching Diagram instead of text ASCII */}
            <div className="mt-6 space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-white">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-slate-400" />
                  <span className="font-medium text-slate-600">Certificate PDF File</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">8.2 MB</span>
              </div>

              <div className="flex justify-center my-1">
                <div className="h-6 w-0.5 bg-gradient-to-b from-indigo-500 to-indigo-300" />
              </div>

              <div className="p-3 rounded-lg border border-indigo-50 bg-indigo-50/20 flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px] text-indigo-600 font-semibold uppercase tracking-wider">
                  <span>SHA-256 Fingerprint</span>
                  <span>Calculated</span>
                </div>
                <div className="font-mono text-slate-600 truncate text-[11px]">8f72c3d5a91c94b7e1272b...91ac</div>
              </div>

              <div className="flex items-center justify-between px-2">
                <div className="h-0.5 flex-1 bg-slate-100" />
                <span className="mx-3 text-[10px] font-bold text-navy-500 uppercase tracking-widest">Matched vs Ledger</span>
                <div className="h-0.5 flex-1 bg-slate-100" />
              </div>

              <div className="p-3 rounded-lg border border-emerald-100 bg-emerald-50/20 flex flex-col gap-1.5 shadow-sm">
                <div className="flex justify-between items-center text-[10px] text-verified font-semibold uppercase tracking-wider">
                  <span>Blockchain Record</span>
                  <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> VERIFIED</span>
                </div>
                <div className="font-mono text-slate-600 truncate text-[11px]">8f72c3d5a91c94b7e1272b...91ac</div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 border-t border-slate-100" aria-labelledby="benefits">
        <div className="text-center">
          <h2 id="benefits" className="text-2xl font-bold tracking-tight text-navy-900 md:text-3xl">
            Built for everyone
          </h2>
          <p className="mt-3 text-sm text-slate-500">A shared trust framework connecting academic ecosystems, graduates, and organizations.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {roles.map((r) => (
            <Card key={r.title} className="p-6 card-hover flex flex-col justify-between">
              <div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-800 shadow-xs">
                  <r.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-bold text-navy-900">{r.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{r.text}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-t border-slate-100" aria-labelledby="faq">
        <h2 id="faq" className="text-center text-2xl font-bold tracking-tight text-navy-900 md:text-3xl">
          Frequently asked questions
        </h2>
        <div className="mx-auto mt-10 max-w-3xl space-y-3.5">
          {[
            { q: "Do I need an account to verify?", a: "No. Public verification is completely open and free. Anyone can drag and drop a certificate file, scan a QR code, or paste a certificate ID." },
            { q: "What happens if a certificate is modified?", a: "The recalculated hash will differ from the on-chain registry. The system will immediately alert the verifier that the certificate has been modified." },
            { q: "How are certificates revoked?", a: "Authorized institutions can flag certificates as revoked in their portal. This invokes a smart-contract write, which changes the status dynamically on-chain." },
            { q: "Are certificate PDFs stored on the public blockchain?", a: "No. Only the SHA-256 hash and metadata are recorded on the public ledger. The actual PDF files are stored in secure storage buckets with access controls." },
          ].map((item, i) => (
            <details key={i} className="group rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 open:border-slate-300">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-navy-900 outline-none list-none">
                <span className="text-sm">{item.q}</span>
                <span className="ml-4 shrink-0 transition-transform duration-200 group-open:rotate-45 text-slate-400">
                  <PlusIcon className="h-4 w-4" />
                </span>
              </summary>
              <p className="mt-3 text-xs leading-relaxed text-slate-500 border-t border-slate-100 pt-3">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <Card className="mx-auto max-w-3xl bg-gradient-to-br from-slate-900 to-indigo-950 p-10 md:p-14 text-white relative overflow-hidden border-0 shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.12),transparent)] -z-10" />
          <ScanLine className="mx-auto h-10 w-10 text-indigo-400 animate-pulse" aria-hidden="true" />
          <h2 className="mt-6 text-2xl font-bold md:text-3xl tracking-tight">Verify your first certificate</h2>
          <p className="mx-auto mt-3 max-w-md text-xs md:text-sm text-indigo-200/80 leading-relaxed">
            Scan the certificate's QR code with your camera or enter the cryptographic serial ID to verify its integrity.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="primary" size="lg" className="bg-white text-navy-950 hover:bg-slate-100 hover:scale-[1.02] shadow-md transition-all font-semibold">
              <Link to="/verify" className="gap-2">
                <FileCheck2 className="h-4.5 w-4.5 text-navy-900" aria-hidden="true" /> Start Verifying
              </Link>
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}