"use client";
import { useState } from "react";

export default function PrizeModal({ open, winner, onClose }) {
  if (!open) return null;

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
              <h2 className="text-xl font-bold">Good job! 🎉 You WON! I will be sending you an email within 24 hours...</h2>
              <p className="text-sm text-neutral-600 mt-1">
              </p>
            </div> 
            <div className="p-5 border-b border-neutral-200">

                  <p>Within <strong>24 hours ⏳</strong>, you’ll get a <strong>personal email</strong> from me the founder of Overcut Pizza with exactly how to claim your gift. ✉️👋</p>
                  <br></br>
                  <p>🚫📦 Zero shipping.<br></br>
                  🚫💳 Zero credit card.<br></br>
                  🆓✅ 100% FREE.</p>
                  <br></br>
                  <p>Each keychain is <strong>hand made by me</strong> 🛠️, cut from <strong>real recycled comic pages</strong> ♻️📚. Every piece is a <strong>one-of-one</strong> you will not find it anywhere else.</p>
                  <br></br>
                  <p>Keep an eye on your inbox 📬.</p>

                  <h3>Watch for this subject line 📨</h3>
                  <p><code>“Winner OVERCUTPIZZA”</code></p>
                  <br></br>
                  <p>Give me up to 24 hours to write your email. Thanks for being part of the Overcut Pizza community! 🍕🔥</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
