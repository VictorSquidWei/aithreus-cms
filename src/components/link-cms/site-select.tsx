"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/select";

export function SiteSelect({
  sites,
  selected,
  basePath,
}: {
  sites: { id: string; domain: string }[];
  selected: string | null;
  basePath: string;
}) {
  const router = useRouter();
  return (
    <Select
      data-testid="perf-site-filter"
      value={selected ?? "all"}
      onChange={(e) => router.push(e.target.value === "all" ? basePath : `${basePath}?site=${e.target.value}`)}
    >
      <option value="all">All sites</option>
      {sites.map((s) => (
        <option key={s.id} value={s.id}>
          {s.domain}
        </option>
      ))}
    </Select>
  );
}
