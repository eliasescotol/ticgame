"use client";
import { useState } from "react";

export default function PrizeModal({ open, winner, onClose }) {
  if (!open) return null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [status, setStatus] = useState(null); // null | "ok" | "error"

  async function onSubmit(e) {
    e.preventDefault();
    try {
      setStatus(null);
      await fetch("/api/claim-prize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, phone, country, address, city, state, zip, winner,
          when: new Date().toISOString(),
        }),
      }).catch(() => {});
      setStatus("ok");
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
              <h2 className="text-xl font-bold">Good job! 🎉 You won a FREE Comic Book Keychain</h2>
              <p className="text-sm text-neutral-600 mt-1">
                {winner ? `${winner} just won — ` : ""}Enter your shipping info to claim your prize.
              </p>
            </div>

            {/* Body (scrolling area) */}
            <form className="flex-1 overflow-y-auto" onSubmit={onSubmit}>
              <div className="p-5 space-y-3">
                {/* Name */}
                <label className="grid gap-1">
                  <span className="text-sm font-medium">Full Name</span>
                  <input
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </label>

                {/* Email */}
                <label className="grid gap-1">
                  <span className="text-sm font-medium">Email</span>
                  <input
                    type="email"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </label>

                {/* Phone */}
                <label className="grid gap-1">
                  <span className="text-sm font-medium">Phone Number</span>
                  <input
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 555-5555"
                    required
                  />
                </label>

                {/* Country */}
                <label className="grid gap-1">
                  <span className="text-sm font-medium">Country</span>
                  <input
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United States"
                    required
                  />
                </label>

                {/* Address */}
                <label className="grid gap-1">
                  <span className="text-sm font-medium">Address</span>
                  <input
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street address"
                    required
                  />
                </label>

                {/* City | State | Zip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="grid gap-1">
                    <span className="text-sm font-medium">City</span>
                    <input
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      required
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm font-medium">State</span>
                    <input
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="CA"
                      required
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm font-medium">Zip</span>
                    <input
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="90210"
                      required
                    />
                  </label>
                </div>

                {status === "ok" ? (
                  <p className="text-emerald-600 text-sm mt-1">Claim received! We’ll reach out soon.</p>
                ) : null}
                {status === "error" ? (
                  <p className="text-red-600 text-sm mt-1">Couldn't submit right now. Try again.</p>
                ) : null}
              </div>

              {/* Sticky footer (inside the scroll container) */}
              <div
                className="sticky bottom-0 bg-white border-t border-neutral-200 p-5 flex items-center justify-end gap-2"
                style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)" }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50"
                >
                  Not now
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800"
                >
                  Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
