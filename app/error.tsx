"use client";

import Link from "next/link";
import { Icon } from "@/components/kit";
import { STATUS_BUTTON, StatusPage } from "@/components/landing/StatusPage";
import { cta } from "@/components/landing/styles";
import { useStore } from "@/lib/client/store";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const snap = useStore();
  const name = snap?.state.child?.name;

  return (
    <StatusPage
      art="bulb"
      title="Something went wrong on our side."
      body={`${name ? `${name}'s` : "Your"} progress is safe. Let's try that again.`}
      actions={
        <>
          <button type="button" onClick={reset} className={cta("primary", STATUS_BUTTON)}>
            <Icon name="retry" size={18} strokeWidth={2.4} />
            Try again
          </button>
          {name ? (
            <Link href="/journal" className={cta("secondary", STATUS_BUTTON)}>
              Go to {name}&apos;s journal
            </Link>
          ) : (
            <Link href="/" className={cta("secondary", STATUS_BUTTON)}>
              Back to the home page
            </Link>
          )}
        </>
      }
    />
  );
}
