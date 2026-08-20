import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";

export function QRCodeDialog({
  open,
  onOpenChange,
  title = "Scan to verify",
  url,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  url: string | null;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Anyone can scan this code to verify the certificate without an account.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          {url ? (
            <>
              <div className="rounded-lg border border-gray-200 p-3">
                <QRCodeSVG value={url} size={200} fgColor="#143C8C" level="M" />
              </div>
              <p className="max-w-full break-all text-center text-xs text-gray-500">{url}</p>
              <Button variant="secondary" size="sm" onClick={copy}>
                {copied ? "Copied!" : "Copy verification link"}
              </Button>
            </>
          ) : (
            <p className="text-sm text-gray-500">No verification link available.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}