"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, ButtonLink, Glim, Icon } from "@/components/kit";
import { requestSignIn, signOut, startSync, useAccount } from "@/lib/client/account";
import { safeNext } from "@/lib/safe-next";

const FIELD =
  "mt-1.5 block min-h-14 w-full rounded-button border-2 border-line-strong bg-card px-4 text-lg font-bold text-ink placeholder:text-ink-3";

export function SignInForm() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const expired = params.get("error") === "expired";
  const justSigned = params.get("signed") === "1";
  const router = useRouter();
  const account = useAccount();
  const [restoring, setRestoring] = useState(justSigned);

  useEffect(() => {
    if (!justSigned) return;
    let alive = true;
    void startSync().then(() => {
      if (alive) router.replace(next);
    });
    const t = window.setTimeout(() => alive && setRestoring(false), 8000);
    return () => {
      alive = false;
      window.clearTimeout(t);
    };
  }, [justSigned, next, router]);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<{ email: string; devLink?: string } | null>(null);

  if (restoring) {
    return (
      <div className="text-center" role="status">
        <Glim pose="reading" size={140} className="mx-auto" />
        <h1 className="mt-4 text-[clamp(28px,3vw,36px)] font-black leading-[1.1] tracking-[-0.02em]">Bringing back your progress...</h1>
      </div>
    );
  }

  if (account.status === "signed") {
    return (
      <div className="text-center">
        <Glim pose="cheer" size={140} className="mx-auto" />
        <h1 className="mt-4 text-[clamp(30px,3.4vw,40px)] font-black leading-[1.1] tracking-[-0.02em]">You&apos;re signed in</h1>
        <p className="mx-auto mt-3 max-w-[440px] text-lg font-semibold leading-[1.6] text-ink-2">
          As <b className="text-ink">{account.email}</b>. Progress and your plan follow you to any device.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ButtonLink href={next}>
            Continue
            <Icon name="next" size={18} strokeWidth={2.4} />
          </ButtonLink>
          <Button variant="secondary" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="text-center" role="status">
        <Glim pose="reading" size={140} className="mx-auto" />
        <h1 className="mt-4 text-[clamp(30px,3.4vw,40px)] font-black leading-[1.1] tracking-[-0.02em]">Check your email</h1>
        <p className="mx-auto mt-3 max-w-[460px] text-lg font-semibold leading-[1.6] text-ink-2">
          We sent a sign-in link to <b className="text-ink">{sent.email}</b>. Open it on this device. It works once and expires in 20 minutes.
        </p>
        {sent.devLink && (
          <p className="mx-auto mt-5 max-w-[460px] rounded-2xl border-2 border-dashed border-lamp-line bg-lamp-tint px-4 py-3 text-sm font-bold text-lamp-ink">
            Dev mode, no email service configured:{" "}
            <a href={sent.devLink} className="text-link font-black underline">
              open the sign-in link
            </a>
          </p>
        )}
        <button
          type="button"
          onClick={() => setSent(null)}
          className="text-link inline-flex min-h-11 cursor-pointer items-center gap-1.5 font-extrabold text-indigo mt-5 text-base"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-center">
        <Glim pose="hello" size={130} />
      </div>
      <h1 className="mt-4 text-center text-[clamp(30px,3.4vw,40px)] font-black leading-[1.1] tracking-[-0.02em]">
        Sign in to Readly
      </h1>
      <p className="mx-auto mt-3 max-w-[460px] text-center text-lg font-semibold leading-[1.6] text-ink-2">
        Keep your child&apos;s progress and plan on every device. No password. We email you a link.
      </p>
      {expired && (
        <p role="alert" className="mx-auto mt-5 max-w-[460px] rounded-2xl bg-needs-tint px-4 py-3 text-center text-[15px] font-extrabold text-needs-ink">
          That link has expired or was already used. Ask for a new one below.
        </p>
      )}
      <form
        className="mx-auto mt-7 max-w-[440px]"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            const res = await requestSignIn(email, next);
            setSent({ email: email.trim(), devLink: res.devLink });
          } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="block text-[15px] font-extrabold text-ink-2">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={FIELD}
          />
        </label>
        {error && (
          <p role="alert" className="mt-2.5 text-[15px] font-extrabold text-needs-ink">
            {error}
          </p>
        )}
        <Button type="submit" block disabled={busy} className="mt-4 disabled:opacity-60">
          {busy ? "Sending..." : "Email me a sign-in link"}
          {!busy && <Icon name="next" size={18} strokeWidth={2.4} />}
        </Button>
        <p className="mt-4 text-center text-sm font-bold leading-normal text-ink-3">
          Paid already? Use the email from your Stripe receipt and your plan comes back.
        </p>
      </form>
    </div>
  );
}
