const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface AnalyticsEventInput {
  event: string;
  metadata?: Record<string, unknown>;
}

export function trackClientEvent(event: string, metadata?: Record<string, unknown>) {
  // Fire and forget
  if (typeof window !== "undefined") {
    try {
      fetch(`${API_URL}/api/analytics/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important to capture user if logged in
        body: JSON.stringify({
          event,
          metadata,
          path: window.location.pathname,
        }),
      }).catch(() => {
        // Silently swallow network errors so UI doesn't break
      });
    } catch (error) {
      // Catch synchronous errors just in case
    }
  }
}
