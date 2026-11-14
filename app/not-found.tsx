import type { Metadata } from "next";
import Link from "next/link";
import { DemoLink } from "@/components/landing/LandingLinks";
import { STATUS_BUTTON, StatusPage } from "@/components/landing/StatusPage";
import { cta } from "@/components/landing/styles";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <StatusPage
      art="book"
      title="We couldn't find that page."
      body="The link may be old or mistyped. Your child's progress is safe — it's saved in this browser."
      actions={
        <>
          <Link href="/" className={cta("primary", STATUS_BUTTON)}>
            Go to the home page
          </Link>
          <DemoLink className={cta("secondary", STATUS_BUTTON)}>Try the example</DemoLink>
        </>
      }
    />
  );
}
