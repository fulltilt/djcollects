"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { SUBSCRIBED_KEY, SubscribeForm } from "@/components/SubscribeForm";

const DISMISSED_KEY = "newsletter:dismissedAt";
const SHOW_AFTER_MS = 1500;
const DISMISS_DAYS = 30;
// TESTING ONLY: re-shows after dismissal (subscribers never see it again). Set to false before launch.
const ALWAYS_SHOW = true;

export function EmailPopup() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (localStorage.getItem(SUBSCRIBED_KEY)) return;
    if (!ALWAYS_SHOW) {
      const dismissedAt = Number(localStorage.getItem(DISMISSED_KEY) ?? 0);
      if (Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    }

    const timer = setTimeout(
      () => dialogRef.current?.showModal(),
      SHOW_AFTER_MS,
    );
    return () => clearTimeout(timer);
  }, []);

  function close() {
    dialogRef.current?.close();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="email-popup-title"
      onClose={() => {
        if (!localStorage.getItem(SUBSCRIBED_KEY)) {
          localStorage.setItem(DISMISSED_KEY, String(Date.now()));
        }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl p-0 shadow-2xl backdrop:bg-stone-900/50 backdrop:backdrop-blur-sm"
    >
      <div className="relative p-8">
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
        >
          ✕
        </button>
        {/* <p className="text-sm font-medium uppercase tracking-widest text-stone-500">
          Japanese sets sell out fast
        </p> */}
        <h2
          id="email-popup-title"
          className="mt-2 text-2xl font-semibold tracking-tight"
        >
          Storm Emeralda is here, and more is coming!
        </h2>
        <p className="mt-3 text-stone-600">
          Enter your email to join the interest list for Storm Emeralda and the
          upcoming Aura Seeker and Gem Pack Vol. 7 releases!
        </p>
        <div className="mt-6">
          <SubscribeForm
            source="popup"
            onSuccess={() => setTimeout(close, 1500)}
          />
        </div>
        <p className="mt-4 text-xs text-stone-500">
          By joining you agree to our{" "}
          <Link href="/privacy" className="underline" onClick={close}>
            privacy policy
          </Link>
          . Unsubscribe anytime.
        </p>
      </div>
    </dialog>
  );
}
