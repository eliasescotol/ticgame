"use client";
import { useState } from "react";

export default function PrizeModal({ open, winner, onClose }) {
  if (!open) return null;

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState(null); // null | "ok" | "error" | "loading"

  async function onSubmit(e) {
    e.preventDefault();
    if (!email) return;

    try {
      setStatus("loading");
      await fetch("/api/claim-prize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          winner,                  // 🍕 or 🥤 or "Draw"
          when: new Date().toISOString(),
        }),
      });
      setStatus("ok");
      // auto-close after a moment
      setTimeout(() => onClose?.(), 1200);
    } catch {
      setStatus("error");
    }
  }

  return (
    // Make the overlay scrollable
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
      {/* Centering wrapper that can grow taller than screen on mobile */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Card with its own column layout and clipped corners */}
        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-neutral-200 overflow-hidden">
          {/* Use flex column so header/body/footer are well-behaved */}
          <div className="flex flex-col max-h-screen">
            {/* Header (non-scrolling) */}
            <div className="p-5 border-b border-neutral-200">
              <h2 className="text-xl font-bold">
                Good job! 🎉 You WON A Really SPECIAL GIFT! 
              </h2>
            </div>

            {/* Message */}
            <div className="p-5 border-b border-neutral-200 space-y-3 text-sm text-neutral-800">
              <p>
                Within <strong>24 hours ⏳</strong>, you’ll get a <strong>personal email</strong> from me, the founder of Overcut Pizza, with exactly how to claim your gift. ✉️👋
              </p>
              <p>
                🚫📦 Zero shipping.<br />
                🚫💳 Zero credit card.<br />
                🆓✅ 100% FREE.
              </p>
              <p>
                Each keychain is <strong>hand made by me</strong> 🛠️, cut from <strong>real recycled comic pages</strong> ♻️📚. Every piece is a <strong>one-of-one</strong>.
              </p>
              <div>
                <h3 className="font-semibold">Watch for this subject line 📨</h3>
                <p><code>“Winner OVERCUTPIZZA”</code></p>
              </div>
            </div>

            {/* Simple form */}
            <form onSubmit={onSubmit} className="p-5 space-y-3">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Name (optional)</label>
                <input
                  className="px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Email (required)</label>
                <input
                  type="email"
                  required
                  className="px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Phone (optional)</label>
                <input
                  className="px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              {/* Status line */}
              {status === "ok" && (
                <div className="text-green-700 text-sm">
                  ✅ Got it! I’ll email you soon.
                </div>
              )}
              {status === "error" && (
                <div className="text-red-700 text-sm">
                  ❌ Something went wrong. Please try again.
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => onClose?.()}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-60"
                >
                  {status === "loading" ? "Sending..." : "Submit"}
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
