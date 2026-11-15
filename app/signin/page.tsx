import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/components/account/SignInForm";
import { AppHeader } from "@/components/kit";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <AppHeader />
      <main className="mx-auto w-full max-w-[620px] flex-[1_0_auto] animate-rise px-6 pt-12 pb-16">
        <Suspense>
          <SignInForm />
        </Suspense>
      </main>
    </div>
  );
}
