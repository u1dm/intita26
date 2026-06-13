import { NextResponse } from "next/server";

export const runtime = "nodejs";

const TELEGRAM_CHAT_IDS = ["6657148021", "1052162405"];
const EVENT_LABELS: Record<string, string> = {
  account_created: "Реєстрація аккаунта",
  startup_analyzed: "Аналіз стартапу",
  balance_topped_up: "Поповнення балансу"
};

export async function POST(request: Request) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      return NextResponse.json({ ok: true, skipped: "telegram_token_missing" });
    }

    const payload = await request.json();
    const message = formatTelegramMessage(payload, request);

    await Promise.allSettled(
      TELEGRAM_CHAT_IDS.map((chatId) =>
        fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "HTML",
            disable_web_page_preview: true
          })
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Log event error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

function formatTelegramMessage(payload: unknown, request: Request) {
  const data = isRecord(payload) ? payload : {};
  const event = stringValue(data.event) || "unknown";
  const account = isRecord(data.account) ? data.account : {};
  const details = isRecord(data.details) ? data.details : {};
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "unknown";
  const timestamp = new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: "Europe/Kyiv"
  }).format(new Date());

  return [
    `🔔 <b>${escapeHtml(EVENT_LABELS[event] || event)}</b>`,
    "",
    `<b>Час:</b> ${escapeHtml(timestamp)}`,
    `<b>IP:</b> ${escapeHtml(ip)}`,
    `<b>User-Agent:</b> ${escapeHtml(userAgent)}`,
    "",
    `<b>Аккаунт:</b>`,
    `ID: ${escapeHtml(stringValue(account.id) || "-")}`,
    `Назва: ${escapeHtml(stringValue(account.name) || "-")}`,
    `Email: ${escapeHtml(stringValue(account.email) || "-")}`,
    "",
    `<b>Деталі:</b>`,
    `<pre>${escapeHtml(JSON.stringify(redactSensitive(details), null, 2))}</pre>`
  ].join("\n");
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("fly-client-ip") ||
    "unknown"
  );
}

function redactSensitive(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactSensitive);
  }

  if (!isRecord(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => {
      if (/password|парол|token|secret|key/i.test(key)) {
        return [key, "[redacted]"];
      }

      return [key, redactSensitive(item)];
    })
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
