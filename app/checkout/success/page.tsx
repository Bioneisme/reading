"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { verifyCheckout } from "@/lib/client/api";
import { downloadReminderIcs } from "@/lib/client/ics";
import { store, useStore } from "@/lib/client/store";
import { Shell } from "@/components/Shell";
import { Button, Card, H1, LinkButton, Loading } from "@/components/ui";

export default function SuccessPage() {
  return (
    <Suspense fallback={<Shell><Loading /></Shell>}>
      <Success />
    </Suspense>
  );
}

type Status = "checking" | "paid" | "unpaid" | "error";

function Success() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const snap = useStore();
  const [status, setStatus] = useState<Status>(sessionId ? "checking" : "unpaid");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!sessionId) return;
    let alive = true;
    verifyCheckout(sessionId)
      .then(({ paid }) => {
        if (!alive) return;
        if (paid) store.setPro(true);
        setStatus(paid ? "paid" : "unpaid");
      })
      .catch(() => alive && setStatus("error"));
    return () => {
      alive = false;
    };
  }, [sessionId, attempt]);

  const name = snap?.state.child?.name ?? "your child";
  const time = snap?.state.reminderTime ?? "19:30";

  if (status === "checking") return <Shell><Loading label="Confirming your payment…" /></Shell>;

  if (status !== "paid") {
    return (
      <Shell width="max-w-xl">
        <Card>
          <H1>{status === "error" ? "Something went wrong" : "We couldn't confirm the payment"}</H1>
          <p className="mt-3 text-ink-soft">
            {status === "error"
              ? "We couldn't reach the payment service. Your card is safe; let's try again."
              : "If you just paid, give it a few seconds and try again. Otherwise you can pick a plan again."}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {sessionId && (
              <Button
                onClick={() => {
                  setStatus("checking");
                  setAttempt((a) => a + 1);
                }}
              >
                Try again
              </Button>
            )}
            <LinkButton href="/plans" variant="secondary">Back to plans</LinkButton>
          </div>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell width="max-w-xl">
      <Card className="text-center">
        <span aria-hidden className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-2xl text-brand">✓</span>
        <H1 className="mt-4">You&apos;re all set — {name}&apos;s plan is unlocked</H1>
        <p className="mt-3 text-lg text-ink-soft">
          Every evening: a 10-minute session built from the night before. Word pairs, a short word list, and a story
          where every word is checked. Your journal shows the progress.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <LinkButton href="/journal">See tonight&apos;s plan</LinkButton>
          <Button variant="secondary" onClick={() => downloadReminderIcs(time, snap?.state.child?.name ?? "")}>
            Add a nightly reading reminder to my calendar
          </Button>
          <p className="text-sm text-ink-soft">Daily at {time}. You can change the time in your journal settings.</p>
        </div>
      </Card>
    </Shell>
  );
}
