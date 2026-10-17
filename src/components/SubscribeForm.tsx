"use client";

import { useState } from "react";

export const SUBSCRIBED_KEY = "newsletter:subscribed";

type Props = {
  source: string;
  onSuccess?: () => void;
  dark?: boolean;
};

export function SubscribeForm({ source, onSuccess, dark }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function submit(form: FormData) {
    setState("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          company: form.get("company"),
          source,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      localStorage.setItem(SUBSCRIBED_KEY, "1");
      setState("success");
      onSuccess?.();
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (state === "success") {
    return <p className="font-medium">You&apos;re on the list. Thanks!</p>;
  }

  return (
    <form action={submit} className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={`email-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`email-${source}`}
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          placeholder="you@example.com"
          className={`min-w-0 flex-1 rounded-full border px-4 py-3 outline-none focus:ring-2 ${
            dark
              ? "border-stone-600 bg-stone-800 text-white placeholder:text-stone-400 focus:ring-stone-400"
              : "border-stone-300 bg-white focus:ring-stone-900"
          }`}
        />
        {/* Honeypot: hidden from humans, bots tend to fill it in. */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className={`rounded-full px-6 py-3 font-medium transition disabled:opacity-60 ${
            dark
              ? "bg-white text-stone-900 hover:bg-stone-200"
              : "bg-stone-900 text-white hover:bg-stone-700"
          }`}
        >
          {state === "loading" ? "Joining…" : "Join the list"}
        </button>
      </div>
      {state === "error" && (
        <p role="alert" className="mt-2 text-sm text-red-500">
          {message}
        </p>
      )}
    </form>
  );
}
