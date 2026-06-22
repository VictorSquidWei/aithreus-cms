import type { Changelog } from "@/lib/types";

export function ChangelogTimeline({ entries }: { entries: Changelog[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-fg-faint">No releases yet.</p>;
  }
  return (
    <ol className="relative flex flex-col gap-4 border-l border-border pl-5" data-testid="changelog">
      {entries.map((e) => (
        <li key={e.id} className="relative">
          <span className="absolute -left-[23px] top-1 h-2 w-2 rounded-full bg-accent" />
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-accent">{e.version}</span>
            <span className="text-xs text-fg-faint">{e.date}</span>
          </div>
          <p className="mt-0.5 text-sm text-fg-muted">{e.notes}</p>
        </li>
      ))}
    </ol>
  );
}
