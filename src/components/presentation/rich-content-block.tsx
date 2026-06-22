import * as React from "react";
import { cn } from "@/lib/utils";

function inline(s: string): React.ReactNode {
  return s.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold text-fg">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <React.Fragment key={i}>{p}</React.Fragment>
    ),
  );
}

// Minimal markdown-ish renderer (paragraphs, - bullets, **bold**). No external lib.
export function RichContentBlock({ text, className }: { text: string; className?: string }) {
  const blocks = (text || "").split(/\n\n+/).filter(Boolean);
  return (
    <div className={cn("flex flex-col gap-3 text-sm leading-relaxed text-fg-muted", className)}>
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (lines.every((l) => l.trim().startsWith("- "))) {
          return (
            <ul key={i} className="flex list-disc flex-col gap-1 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^-\s/, ""))}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{inline(b)}</p>;
      })}
    </div>
  );
}
