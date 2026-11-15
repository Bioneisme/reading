import { AppHeader, ChildChip } from "@/components/kit";
import { GRADE_LABEL } from "@/lib/client/progress";
import type { AppState } from "@/lib/client/store";

export function ChildHeader({ state }: { state: AppState | null }) {
  const child = state?.child;
  return (
    <AppHeader right={child ? <ChildChip name={child.name} grade={GRADE_LABEL[child.grade]} demo={state.demo} /> : undefined} />
  );
}
