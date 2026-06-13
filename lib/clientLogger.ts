type LogEventPayload = {
  event: "account_created" | "startup_analyzed" | "balance_topped_up";
  account?: {
    id?: string;
    name?: string;
    email?: string;
  };
  details?: Record<string, unknown>;
};

export function logUserAction(payload: LogEventPayload) {
  if (typeof window === "undefined") {
    return;
  }

  window
    .fetch("/api/log-event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      keepalive: true
    })
    .catch(() => {
      // Logging must never block the MVP flow.
    });
}
