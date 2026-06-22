"use client";

import * as React from "react";
import Link from "next/link";
import { Code2, Globe, Link2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { deleteSiteAction } from "@/server/actions/sites";
import type { Site } from "@/lib/types";
import type { SiteCounts } from "@/server/store";
import { SiteForm } from "./site-form";

export function SitesManager({ sites }: { sites: { site: Site; counts: SiteCounts }[] }) {
  const { toast } = useToast();
  const [pending, start] = React.useTransition();

  function del(site: Site) {
    if (!window.confirm(`Delete ${site.domain}? This removes its widgets and overrides.`)) return;
    start(async () => {
      const r = await deleteSiteAction(site.id);
      toast(r.ok ? `Deleted ${site.domain}` : r.error, r.ok ? "default" : "error");
    });
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <SiteForm
          trigger={
            <Button data-testid="site-new">
              <Plus size={16} /> New site
            </Button>
          }
        />
      </div>

      {sites.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-14 text-center">
          <Globe size={22} className="text-fg-faint" />
          <div>
            <p className="text-sm text-fg">No sites yet</p>
            <p className="text-xs text-fg-muted">Add the first domain you&apos;ll embed widgets on.</p>
          </div>
          <SiteForm
            trigger={
              <Button size="sm" data-testid="site-new-empty">
                <Plus size={15} /> Add site
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2" data-testid="sites-list">
          {sites.map(({ site, counts }) => (
            <div key={site.id} data-testid={`site-card-${site.id}`} className="rounded-lg border border-border bg-surface-1 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Globe size={15} className="text-fg-muted" />
                    <span className="truncate font-medium text-fg">{site.domain}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant={site.status === "live" ? "positive" : "muted"}>{site.status}</Badge>
                    <span className="font-mono text-[11px] text-fg-faint" data-testid={`site-configid-${site.id}`}>
                      {site.configId}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <SiteForm
                    site={site}
                    trigger={
                      <Button size="icon" variant="ghost" aria-label={`Edit ${site.domain}`}>
                        <Pencil size={15} />
                      </Button>
                    }
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete ${site.domain}`}
                    onClick={() => del(site)}
                    disabled={pending}
                    data-testid={`site-delete-${site.id}`}
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Pages", value: counts.pages },
                  { label: "Links", value: counts.links },
                  { label: "Overrides", value: counts.overrides },
                ].map((c) => (
                  <div key={c.label} className="rounded border border-border bg-surface-2 py-2">
                    <div className="nums text-lg font-semibold text-fg">{c.value}</div>
                    <div className="text-[10px] uppercase tracking-wide text-fg-faint">{c.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <Button asChild size="sm" variant="subtle">
                  <Link href={`/admin/links?site=${site.id}`}>
                    <Link2 size={14} /> Edit links
                  </Link>
                </Button>
                <Button asChild size="sm" variant="subtle">
                  <Link href={`/admin/embed?site=${site.id}`}>
                    <Code2 size={14} /> Embed
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
