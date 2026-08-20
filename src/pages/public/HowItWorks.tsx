import { Link } from "react-router-dom";
import { FileText, Hash, Box, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const steps = [
  {
    icon: FileText,
    title: "1. Certificate is created",
    description:
      "An institution generates the certificate PDF and uploads it through their portal. The file is stored securely in Supabase object storage.",
  },
  {
    icon: Hash,
    title: "2. Hash is computed",
    description:
      "The backend computes a SHA-256 hash of the exact PDF bytes. This 64-character fingerprint uniquely identifies the file — any change produces a different hash.",
  },
  {
    icon: Box,
    title: "3. Hash is anchored on-chain",
    description:
      "The hash, issuer wallet and timestamp are written to a smart contract on an Ethereum-compatible blockchain. This record cannot be altered.",
  },
  {
    icon: BadgeCheck,
    title: "4. Anyone can verify",
    description:
      "Scanning the QR code or entering the certificate ID makes the system re-hash the current file and compare it with the immutable blockchain record.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-navy-900 md:text-4xl">How CertiChain works</h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">
          A simple flow that combines PDF documents, cryptographic hashing and blockchain technology
          to make certificate fraud impossible.
        </p>
      </div>

      <div className="mt-12 space-y-6">
        {steps.map((s, i) => (
          <Card key={i} className="flex items-start gap-4 p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-50">
              <s.icon className="h-6 w-6 text-navy-800" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-semibold text-navy-900">{s.title}</h2>
              <p className="mt-1 text-sm text-gray-600">{s.description}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-10 overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-3 font-semibold text-navy-900">
          The verification rules
        </div>
        <ul className="space-y-3 px-6 py-5 text-sm text-gray-700">
          <li>
            <span className="font-medium text-verified">AUTHENTIC</span> — certificate exists, is active, and its current hash matches the on-chain hash.
          </li>
          <li>
            <span className="font-medium text-danger">TAMPERED</span> — the current file hash no longer matches the hash recorded on the blockchain.
          </li>
          <li>
            <span className="font-medium text-danger">INVALID</span> — no certificate was issued with that ID, or there is no blockchain record.
          </li>
          <li>
            <span className="font-medium text-pending">REVOKED</span> — the issuing institution revoked the certificate on-chain.
          </li>
          <li>
            <span className="font-medium text-pending">EXPIRED</span> — the certificate has passed its expiry date.
          </li>
        </ul>
      </Card>

      <div className="mt-10 text-center">
        <Button asChild variant="primary" size="lg">
          <Link to="/verify">Try Verifying Now</Link>
        </Button>
      </div>
    </div>
  );
}