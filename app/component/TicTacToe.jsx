"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PrizeModal from "./PrizeModal";
import PlayerGate from "./PlayerGate";
import LossModal from "./LossModal";
import PusherClient from "pusher-js";

const SYMBOL_PIZZA = "🍕";   // Host
const SYMBOL_DRINK = "🥤";  // Guest

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return board.every(Boolean) ? "Draw" : null;
}

export default function TicTacToe({ sessionId = "default", isHost = false }) {
  const router = useRouter();
  const search = useSearchParams();

  // Role from URL or prop
  const hostParam = (search?.get("host") || "").toLowerCase();
  const isHostFromUrl = hostParam === "1" || hostParam === "true";
  const effectiveIsHost = isHost || isHostFromUrl;

  // Session (either role mints if missing/default)
  const sessionFromUrl = search?.get("session") || sessionId || "default";
  const [effectiveSessionId, setEffectiveSessionId] = useState(sessionFromUrl);

  useEffect(() => {
    const current = search?.get("session") || sessionId || "default";
    const needsNew = (!current || current === "default");
    if (needsNew) {
      const newId = (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
      const hostBit = effectiveIsHost ? "1" : "0";
      router.replace(`/?session=${newId}&host=${hostBit}`);
      setEffectiveSessionId(newId);
    } else {
      setEffectiveSessionId(current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveIsHost]);

  // Symbols per role
  const localSymbol = effectiveIsHost ? SYMBOL_PIZZA : SYMBOL_DRINK;

  // Core game state (guest starts)
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState(SYMBOL_DRINK);
  const [winner, setWinner] = useState(null);
  const [note, setNote] = useState("");

  // Selection mode (target then move)
  const [isSelecting, setIsSelecting] = useState(false);
  const [moveTarget, setMoveTarget] = useState(null);

  // Modals
  const [showPrize, setShowPrize] = useState(false);
  const [showLoss, setShowLoss] = useState(false);

  // Identity
  const [player, setPlayer] = useState(null);   // guest local {name,email}
  const [guestName, setGuestName] = useState(null); // host view of guest name

  // ✅ NEW: host presence flag (guest starts false, host forces true)
  const [hostOnline, setHostOnline] = useState(effectiveIsHost); // host = true, guest = false

  // Host identity auto-fill
  useEffect(() => {
    if (effectiveIsHost && !player) setPlayer({ name: "Overcut Pizza", email: "" });
  }, [effectiveIsHost, player]);

  // Client id (ignore own broadcasts)
  const clientIdRef = useRef(null);
  if (!clientIdRef.current) clientIdRef.current = Math.random().toString(36).slice(2);

  // ---------- SOUND ----------
  const placeSfxRef = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const hasHydratedRef = useRef(false);
  const prevBoardRef = useRef(board);
  useEffect(() => { prevBoardRef.current = board; }, [board]);
  useEffect(() => {
    try {
      const a = typeof window !== "undefined" ? new Audio("/sfx/place.mp3") : null;
      if (a) { a.preload = "auto"; a.volume = 0.6; placeSfxRef.current = a; }
    } catch { }
  }, []);
  function enableSound() { if (!soundEnabled) setSoundEnabled(true); }
  function playPlaceSfx() {
    if (!soundEnabled) return;
    const a = placeSfxRef.current; if (!a) return;
    try { a.currentTime = 0; a.play().catch(() => { }); } catch { }
  }
  function isRealMove(prev, next) {
    const pc = prev.filter(Boolean).length, nc = next.filter(Boolean).length;
    if (nc > pc) return true;
    if (nc < pc) return false;
    let diffs = 0; for (let i = 0; i < 9; i++) if (prev[i] !== next[i]) diffs++;
    return diffs === 2;
  }
  // ---------- END SOUND ----------

  const status = useMemo(() => {
    const p1Name = "Overcut Pizza";
    const p2Name = effectiveIsHost ? (guestName || "Player 2") : (player?.name || "Player 2");
    if (!winner) {
      return "Turn: " + (turn === SYMBOL_PIZZA ? `${SYMBOL_PIZZA} ${p1Name}` : `${SYMBOL_DRINK} ${p2Name}`);
    }
    if (winner === "Draw") return "It's a draw.";
    return (winner === SYMBOL_PIZZA ? `${SYMBOL_PIZZA} ${p1Name}` : `${SYMBOL_DRINK} ${p2Name}`) + " wins!";
  }, [turn, winner, player, guestName, effectiveIsHost]);

  function buildSnapshot(overrides = {}) {
    return {
      origin: clientIdRef.current,
      board, turn, winner, note,
      isSelecting, moveTarget,
      showPrize, showLoss,
      guestName: effectiveIsHost ? (guestName || null) : (player?.name || null),
      ts: Date.now(),
      ...overrides,
    };
  }
  async function broadcast(snap) {
    try {
      await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session: effectiveSessionId, type: "state", payload: snap }),
      });
    } catch { }
  }
  function commitAndBroadcast(next) {
    if ("board" in next) setBoard(next.board);
    if ("turn" in next) setTurn(next.turn);
    if ("winner" in next) setWinner(next.winner);
    if ("note" in next) setNote(next.note);
    if ("isSelecting" in next) setIsSelecting(next.isSelecting);
    if ("moveTarget" in next) setMoveTarget(next.moveTarget);
    if ("showPrize" in next) setShowPrize(next.showPrize);
    if ("showLoss" in next) setShowLoss(next.showLoss);
    setTimeout(() => broadcast(buildSnapshot(next)), 0);
  }

  function finalizeFromBoard(nextBoard, symbolJustPlayed) {
    const outcome = checkWinner(nextBoard);
    if (outcome && outcome !== "Draw") {
      commitAndBroadcast({
        board: nextBoard,
        winner: outcome,
        isSelecting: false,
        moveTarget: null,
        note: "",
        showPrize: outcome === SYMBOL_DRINK,
        showLoss: outcome === SYMBOL_PIZZA,
      });
    } else {
      const nextTurn = symbolJustPlayed === SYMBOL_PIZZA ? SYMBOL_DRINK : SYMBOL_PIZZA;
      commitAndBroadcast({
        board: nextBoard,
        turn: nextTurn,
        isSelecting: false,
        moveTarget: null,
        note: "",
      });
    }
  }

  function ownedIndices(b, symbol) {
    const res = [];
    for (let i = 0; i < b.length; i++) if (b[i] === symbol) res.push(i);
    return res;
  }

  // STRICT 3-PIECE RULE + sound (guest must NOT wait for host)
  function handleClick(i) {
    if (turn !== localSymbol) return;
    if (winner) return;

    enableSound(); // user gesture

    const symbol = turn;
    const b = board.slice();
    const mine = ownedIndices(b, symbol);

    if (isSelecting) {
      if (!b[i]) {
        commitAndBroadcast({
          moveTarget: i, isSelecting: true,
          note: "Target updated. Now click one of YOUR pieces to move here.",
        });
        return;
      }
      if (b[i] !== symbol) return;

      if (moveTarget != null) {
        b[i] = null;
        b[moveTarget] = symbol;
        playPlaceSfx();
        finalizeFromBoard(b, symbol);
      }
      return;
    }

    if (!b[i]) {
      if (mine.length < 3) {
        b[i] = symbol;
        playPlaceSfx();
        finalizeFromBoard(b, symbol);
        return;
      }
      commitAndBroadcast({
        moveTarget: i, isSelecting: true,
        note: "You have 3 pieces. Click one of YOUR pieces to move into the highlighted spot.",
      });
      return;
    }
  }

  function doInlineReset() {
    commitAndBroadcast({
      board: Array(9).fill(null),
      turn: SYMBOL_DRINK,
      winner: null,
      note: "",
      isSelecting: false,
      moveTarget: null,
      showPrize: false,
      showLoss: false,
    });
  }

  // Subscribe + handshake (doesn't block solo play)
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.PUSHER_KEY || "";
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || process.env.PUSHER_CLUSTER || "us3";
    if (!key) { console.warn("Pusher key missing"); return; }

    const channelName = "game-" + effectiveSessionId;
    const pusher = new PusherClient(key, { cluster });
    const channel = pusher.subscribe(channelName);

    channel.bind("pusher:subscription_succeeded", () => {
      hasHydratedRef.current = false;
    });

    channel.bind("state", (payload) => {
      if (!payload) return;
      const fromSelf = payload.origin === clientIdRef.current;

      if (!fromSelf) {
        const prev = prevBoardRef.current || [];
        const next = payload.board || [];
        if (soundEnabled && hasHydratedRef.current && isRealMove(prev, next)) {
          playPlaceSfx();
        }
        setBoard(next);
        setTurn(payload.turn || SYMBOL_DRINK);
        setWinner(typeof payload.winner === "string" ? payload.winner : null);
        setNote(payload.note || "");
        setIsSelecting(!!payload.isSelecting);
        setMoveTarget(payload.moveTarget ?? null);
        setShowPrize(!!payload.showPrize);
        setShowLoss(!!payload.showLoss);
        if (payload.guestName) setGuestName(payload.guestName);

        // ✅ any state from the host implies the host is online
        if (!effectiveIsHost) setHostOnline(true);

        hasHydratedRef.current = true;
      }
    });

    // ✅ NEW: host presence ping
    channel.bind("host_online", () => {
      if (!effectiveIsHost) setHostOnline(true);
    });

    // Late join sync
    channel.bind("sync_request", () => {
      if (effectiveIsHost) setTimeout(() => broadcast(buildSnapshot()), 0);
    });

    // Initial announce / request
    setTimeout(() => {
      if (effectiveIsHost) {
        // host marks itself online and announces state
        fetch("/api/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session: effectiveSessionId,
            type: "host_online",
            payload: { origin: clientIdRef.current },
          }),
        }).catch(() => { });
        setHostOnline(true); // host always online locally
        broadcast(buildSnapshot());
      } else {
        // guest asks for sync
        fetch("/api/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session: effectiveSessionId,
            type: "sync_request",
            payload: { origin: clientIdRef.current },
          }),
        }).catch(() => { });
        setHostOnline(false); // wait until we hear back
      }
    }, 60);

    return () => {
      try {
        channel.unbind_all();
        pusher.unsubscribe(channelName);
        pusher.disconnect();
      } catch { }
    };
  }, [effectiveSessionId, effectiveIsHost]); // <— no soundEnabled here

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6">
      {/* background watermark */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10 bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: "url('/pizza-logo.png')" }}
      />
      <div className="relative w-full max-w-md z-10">
        {/* Session/Role badge */}
        <div className="mb-2 text-xs text-neutral-600">
          <span className="inline-block px-2 py-1 rounded bg-neutral-100 border border-neutral-200">
            Session: <b>{effectiveSessionId}</b> • Role: <b>{effectiveIsHost ? "HOST (🍕)" : "GUEST (🥤)"}</b>
            {" "}• Sound: <b>{soundEnabled ? "On" : "Tap to enable"}</b>
          </span>
        </div>

        <header className="mb-3">
          <h1 className="text-2xl font-bold">Tic-Tac-Toe: 🍕 vs 🥤 (3-piece rule)</h1>

        </header>

        <div className="mb-3 text-lg font-medium flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          {status}
        </div>

        {note ? (
          <div className="mb-3 text-sm rounded-xl border border-amber-300 bg-amber-50 text-amber-800 px-3 py-2">
            {note}
          </div>
        ) : null}

        <div
          className={
            "relative grid grid-cols-3 gap-3 select-none transition " +
            (turn !== localSymbol ? "opacity-50 pointer-events-none cursor-not-allowed" : "")
          }
          role="grid"
          aria-label="Tic Tac Toe board"
        >
          {board.map((cell, idx) => (
            <button
              key={idx}
              role="gridcell"
              aria-label={`Cell ${idx + 1} ${cell ? cell : "empty"}`}
              onClick={() => handleClick(idx)}
              className={
                "h-28 sm:h-32 rounded-2xl border-2 border-neutral-800 bg-white flex items-center justify-center text-5xl sm:text-6xl font-bold shadow-sm transition active:scale-95" +
                (isSelecting && moveTarget === idx ? " ring-2 ring-yellow-400" : "") +
                (isSelecting && board[idx] === turn ? " ring-2 ring-green-400 animate-pulse" : "")
              }
            >
              {cell}
            </button>
          ))}

          {/* ✅ NEW: Guest-only overlay while waiting for host */}
          {(!effectiveIsHost && !!player && hostOnline === false) && (
  <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 rounded-2xl">
    <p className="text-lg font-semibold">Waiting for the host to join…</p>
  </div>
)}

        </div>

        {/* Gate for guests only (does NOT block solo play after submit) */}
        {!effectiveIsHost && (
          <PlayerGate
  open={!player}
  sessionId={effectiveSessionId}
  onSubmit={(p)=>{
    setPlayer(p);
    enableSound();

    // Guest just pressed Play; until we hear from host, show the overlay
    setHostOnline(false);

    // announce guest name to host state
    setTimeout(()=>broadcast(buildSnapshot({ guestName:p?.name || null })),0);

    // SEND TELEGRAM DM
    const origin = window.location.origin.replace(/^https?:\/\//,"");
    const hostLink  = `${origin}?session=${effectiveSessionId}&host=1`;
    const guestLink = `${origin}/?session=${effectiveSessionId}&host=0`;

    fetch("/api/join",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        session: effectiveSessionId,
        name:p?.name || "",
        email:p?.email || "",
        hostLink,
        guestLink
      })
    });
  }}
/>

        )}

        <PrizeModal open={showPrize} winner={winner} onClose={() => setShowPrize(false)} />
        <LossModal open={showLoss} onClose={() => setShowLoss(false)} onTryAgain={doInlineReset} />

        <footer className="mt-4 text-sm text-neutral-600">
          <p>
            Rule: each player can have at most <b>3</b> pieces. With 3 already, click an empty
            cell <span className="text-yellow-600 font-semibold">(yellow)</span>, then click one of your pieces
            <span className="text-green-600 font-semibold"> (pulsing green)</span> to move it there.
          </p>
        </footer>
      </div>
    </div>
  );
}
