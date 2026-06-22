"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmbedSnippetBox({ wid, label, snippet }: { wid: string; label: string; snippet: string }) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
    } catch {
      /* clipboard may be unavailable; ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-lg border border-border" data-testid={`embed-snippet-${wid}`}>
      <div className="flex items-center justify-between border-b border-border bg-surface-2 px-3 py-2">
        <span className="text-sm font-medium text-fg">{label}</span>
        <Button size="sm" variant="subtle" onClick={copy} data-testid={`embed-copy-${wid}`}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed text-fg-muted">
        <code>{snippet}</code>
      </pre>
    </div>
  );
}
