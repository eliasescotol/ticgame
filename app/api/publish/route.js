// app/api/publish/route.js
export const runtime = "nodejs"; // ensure Node, not Edge

import { NextResponse } from "next/server";
import { pusher } from "../../../lib/pusher.js"; // <- relative path, no tsconfig aliases needed

export async function POST(req) {
  try {
    const { session, type, payload } = await req.json();
    if (!session || !type) {
      return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
    }

    const channel = "game-" + session;

    // For sanity while debugging
    console.log("[/api/publish] trigger", { channel, type, keys: Object.keys(payload || {}) });

    await pusher.trigger(channel, type, payload || {});
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("[/api/publish] error", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
