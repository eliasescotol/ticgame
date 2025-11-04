import { Suspense } from "react";
import TicTacToe from "./component/TicTacToe";

// Make this page fully dynamic so prerender doesn't choke on query-dependent UI
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
      <TicTacToe />
    </Suspense>
  );
}
