import Link from "next/link";
import { ChildChip } from "@/components/kit";
import { ReadlyLogo, ReadlyMark } from "@/components/ReadlyLogo";
import { GRADE_LABEL } from "@/lib/client/progress";
import type { AppState } from "@/lib/client/store";

export function ChildHeader({ state }: { state: AppState | null }) {
  const child = state?.child;
  return (
    <header className="no-print border-b-2 border-line-soft">
      <div className="mx-auto flex max-w-[1120px] items-center gap-3 px-6 py-3 max-[399px]:px-4">
        <Link href="/" aria-label="Readly home" className="flex h-10 flex-none items-center">
          <span className={child ? "max-[419px]:hidden" : ""}>
            <ReadlyLogo size={36} />
          </span>
          {child && (
            <span className="min-[420px]:hidden">
              <ReadlyMark size={36} />
            </span>
          )}
        </Link>
        <div className="flex-1" />
        {child && <ChildChip name={child.name} grade={GRADE_LABEL[child.grade]} demo={state.demo} />}
      </div>
    </header>
  );
}
