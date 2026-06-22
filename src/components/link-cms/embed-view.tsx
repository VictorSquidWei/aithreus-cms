"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { Select } from "@/components/ui/select";
import { EmbedSnippetBox } from "./embed-snippet-box";

interface WidgetSnippet {
  instanceId: string;
  typeName: string;
  snippet: string;
}

export function EmbedView({
  sites,
  selectedSiteId,
  widgets,
}: {
  sites: { id: string; domain: string }[];
  selectedSiteId: string | null;
  widgets: WidgetSnippet[];
}) {
  const router = useRouter();

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-fg-muted">Site</span>
        <Select
          data-testid="embed-site-picker"
          value={selectedSiteId ?? ""}
          onChange={(e) => router.push(`/admin/embed?site=${e.target.value}`)}
        >
          <option value="" disabled>
            Choose a site…
          </option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.domain}
            </option>
          ))}
        </Select>
      </div>

      <div className="mb-4 flex items-start gap-2 rounded-lg border border-border bg-surface-2 p-3 text-xs text-fg-muted">
        <Info size={15} className="mt-0.5 shrink-0 text-accent" />
        <span>
          Paste once per widget instance. After that, every link change in the CMS pushes live after{" "}
          <strong className="text-fg">Publish</strong> — no redeploy.{" "}
          <Link href="/admin/gallery" className="text-accent hover:underline">
            Test in the Widget Gallery →
          </Link>
        </span>
      </div>

      {widgets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-fg-muted">
          {selectedSiteId ? "This site has no widgets yet — add one from the Gallery." : "Pick a site to get its embed snippets."}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {widgets.map((w) => (
            <EmbedSnippetBox key={w.instanceId} wid={w.instanceId} label={w.typeName} snippet={w.snippet} />
          ))}
        </div>
      )}
    </div>
  );
}
