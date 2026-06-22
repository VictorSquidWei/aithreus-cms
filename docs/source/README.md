# Source documents

The Aithreus Unified CMS build is governed by three documents. **Precedence on conflict: Report → Handoff → CMS-2.** Spec citations use `Report §`, `Handoff §`, `CMS-2 §`.

| # | Document | Role | Status in repo |
|---|---|---|---|
| 1 | **Aithreus_Unified_CMS_Build_Report.md** (the **Report**) | The authoritative build instruction. Reconciles the other two, resolves every open question, defines data model / APIs / runtime / design system / acceptance criteria / build order. | Canonical copy held by the product owner. |
| 2 | **Aithreus_Product_Website_Handoff.md** (the **Handoff**) | Product portfolio, per-product specs, content model, component inventory. | Canonical copy held by the product owner. |
| 3 | **CMS-2.pdf** (**CMS-2**) | TT/VNX Terminal Link CMS framework: operators, sites, inheritance/override model, embed snippets, widget gallery, performance. | Canonical copy held by the product owner. |

> The full requirements from all three are encoded — with section-level citations — into [`/specs`](../../specs/INDEX.md), so the spec tree is the working source of truth for implementation. To make citations resolvable directly in-repo, drop the raw `.md`/`.pdf` files into this folder; nothing in the build depends on their presence here because every requirement is restated and traced in the specs.
