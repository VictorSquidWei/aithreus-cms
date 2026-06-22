import { Badge } from "@/components/ui/badge";

// The defining product invariant (Handoff §2): terminals never execute; bots do.
export function ExecutionPostureBadge({ executes }: { executes: boolean }) {
  return executes ? (
    <Badge variant="warning" data-testid="execution-posture">
      Executes autonomously
    </Badge>
  ) : (
    <Badge variant="positive" data-testid="execution-posture">
      Read-only · no funds/keys
    </Badge>
  );
}
