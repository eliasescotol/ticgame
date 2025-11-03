export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, email, session, hostLink, guestLink } = await req.json();

    const token  = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID");
      return NextResponse.json({ ok:false, error:"missing_env" }, { status:500 });
    }

    const safeHost  = hostLink.replace(/^https?:\/\//,"");
    const safeGuest = guestLink.replace(/^https?:\/\//,"");

    const text =
`🕹️ NEW GUEST JOINED
Name: ${name || "Guest"}
Email: ${email || "N/A"}
Session: ${session}

HOST link:
${safeHost}

Guest link:
${safeGuest}`;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        chat_id:chatId,
        text,
        disable_web_page_preview:true
      })
    });

    return NextResponse.json({ ok:true });

  } catch(e) {
    console.error(e);
    return NextResponse.json({ ok:false, error:"server_error" }, {status:500});
  }
}
