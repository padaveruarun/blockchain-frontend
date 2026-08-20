import { Link } from "react-router-dom";
import { ShieldCheck, GraduationCap, Landmark, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-navy-900 md:text-4xl">About CertiChain</h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">
          CertiChain is an academic project demonstrating how blockchain technology
          can make certificate fraud a thing of the past.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <Landmark className="h-6 w-6 text-navy-800" aria-hidden="true" />
          <h2 className="mt-3 font-semibold text-navy-900">The problem</h2>
          <p className="mt-2 text-sm text-gray-600">
            Fake degrees and forged certificates cost organizations billions and undermine
            trust in education. Traditional paper or central-database verification is easy to
            exploit and hard to audit.
          </p>
        </Card>
        <Card className="p-6">
          <ShieldCheck className="h-6 w-6 text-verified" aria-hidden="true" />
          <h2 className="mt-3 font-semibold text-navy-900">The solution</h2>
          <p className="mt-2 text-sm text-gray-600">
            CertiChain anchors each certificate&apos;s cryptographic fingerprint to a public,
            tamper-proof blockchain ledger. Verification is instant, open and independent.
          </p>
        </Card>
        <Card className="p-6">
          <GraduationCap className="h-6 w-6 text-blue-600" aria-hidden="true" />
          <h2 className="mt-3 font-semibold text-navy-900">Who it serves</h2>
          <p className="mt-2 text-sm text-gray-600">
            Universities and colleges issue credentials; students share them; employers and
            recruiters verify them — all through one trustworthy platform.
          </p>
        </Card>
        <Card className="p-6">
          <Users className="h-6 w-6 text-pending" aria-hidden="true" />
          <h2 className="mt-3 font-semibold text-navy-900">The team</h2>
          <p className="mt-2 text-sm text-gray-600">
            Built as a final-year academic project using React, FastAPI, Supabase PostgreSQL
            and Solidity smart contracts.
          </p>
        </Card>
      </div>

      <div className="mt-10 text-center">
        <Button asChild variant="primary" size="lg">
          <Link to="/how-it-works">Learn how it works</Link>
        </Button>
      </div>
    </div>
  );
}