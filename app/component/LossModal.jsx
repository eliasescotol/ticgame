"use client";
export default function LossModal({ open, onTryAgain, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-neutral-200 overflow-hidden">
          <div className="p-5 border-b border-neutral-200">
            <h2 className="text-xl font-bold">I’m sorry — you lost 😢</h2>
            <p className="text-sm text-neutral-600 mt-1">
              Want to try again and beat 🍕 Overcut Pizza?
            </p>
          </div>

          <div className="p-5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onTryAgain}
              className="px-4 py-2 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
