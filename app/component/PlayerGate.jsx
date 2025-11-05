"use client";
import { useState, useEffect } from "react";

export default function PlayerGate({ open, onSubmit, remember = true, sessionId }) {
  if (!open) return null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Prefill from localStorage (optional)
  useEffect(() => {
    if (!remember) return;
    try {
      const p = JSON.parse(localStorage.getItem("player") || "null");
      if (p?.name) setName(p.name);
      if (p?.email) setEmail(p.email);
    } catch { }
  }, [remember]);

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { name, email };

    // Get an existing session from props or URL
    let sessionToUse = sessionId;
    if (!sessionToUse || sessionToUse === "default") {
      try {
        const url = new URL(window.location.href);
        const s = url.searchParams.get("session");
        if (s) sessionToUse = s;
      } catch { }
    }

    try {
      await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, session: sessionToUse }),
      }).catch(() => { });

      // Optional: broadcast name so host sees it immediately
      await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session: sessionToUse,
          type: "state",
          payload: { guestName: name },
        }),
      }).catch(() => { });

      localStorage.setItem("player", JSON.stringify(payload));
    } catch { }

    onSubmit?.(payload);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-neutral-200">
        <div className="p-5 border-b border-neutral-200">
          <h2 className="text-xl font-bold">Enter to Play Tic Tac Toe LIVE</h2>
          <p className="text-sm text-neutral-600 mt-1">
            Add your name and email to start the game.
          </p>
        </div>

        <form className="p-5 space-y-3" onSubmit={handleSubmit}>
          <label className="grid gap-1">
            <span className="text-sm font-medium">Name</span>
            <input
              className="px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              className="px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          <div>
            <h3>🕹️🕹️Play now Tic Tac Toe and unlock insider perks:
              🆓free items, special offers, and access to a great community being built brick-by-brick🧱🧱🧱.

              <br></br><br></br>
              📬Check your email within 24 hours.
              I’ll personally send you a gift. A Wonderful "Comic book original Keychain".
              <br></br> <br></br>
              👨🏽‍💻Hurry! before someone else jumps in and takes your spot.

            </h3>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 border-t border-neutral-200 pt-4">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800"
            >
              Play
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
