"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Visitor tracking (Apollo) only loads after the visitor accepts. The choice is
// kept in localStorage; the footer's "Cookie settings" reopens the banner.
const STORAGE_KEY = "valda-cookie-consent";
const OPEN_EVENT = "valda:cookie-settings";
const APOLLO_APP_ID = "6ac79895397fec0010404852";

type Choice = "accepted" | "declined";

function readChoice(): Choice | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "accepted" || v === "declined" ? v : null;
  } catch {
    return null;
  }
}

function saveChoice(choice: Choice) {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    /* storage blocked: the choice applies to this page view only */
  }
}

/** Apollo's website tracker, identical to the snippet from Apollo's settings. */
function loadApollo() {
  if (document.getElementById("apollo-tracker")) return;
  const n = Math.random().toString(36).substring(7);
  const s = document.createElement("script");
  s.id = "apollo-tracker";
  s.src = `https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache=${n}`;
  s.async = true;
  s.defer = true;
  s.onload = () => {
    (window as unknown as { trackingFunctions?: { onLoad: (o: { appId: string }) => void } }).trackingFunctions?.onLoad({
      appId: APOLLO_APP_ID,
    });
  };
  document.head.appendChild(s);
}

/** Footer link that reopens the banner. */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
      Cookie settings
    </button>
  );
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const choice = readChoice();
    if (choice === "accepted") loadApollo();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after mount
    else if (choice === null) setOpen(true);

    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  const decide = (choice: Choice) => {
    const before = readChoice();
    saveChoice(choice);
    setOpen(false);
    if (choice === "accepted") loadApollo();
    // Withdrawing consent: reload so the tracker already on the page is dropped.
    else if (before === "accepted") window.location.reload();
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie preferences"
      className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-[560px] rounded-lg bg-char p-5 text-white shadow-2xl md:inset-x-auto md:right-6 md:bottom-6 md:p-6"
    >
      <p className="text-[16px] font-medium leading-6">We value your privacy</p>
      <p className="mt-2 text-[14px] leading-[22px] text-white/70">
        With your consent we use analytics cookies to understand which companies visit our site, so we can follow up
        on relevant projects. See our{" "}
        <Link href="/privacy" className="text-white underline underline-offset-4 hover:text-white/80">
          privacy policy
        </Link>
        .
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => decide("accepted")}
          className="inline-flex h-11 items-center rounded-lg bg-white px-5 text-[14px] text-char transition-colors hover:bg-white/85"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => decide("declined")}
          className="inline-flex h-11 items-center rounded-lg border border-white/30 px-5 text-[14px] text-white transition-colors hover:border-white"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
