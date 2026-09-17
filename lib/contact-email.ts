export const contactRecipient = "ozan@ozzyazzura.ca";

export type ContactEmailConfig = {
  RESEND_API_KEY?: string;
  CONTACT_EMAIL_FROM?: string;
};

export type ContactMessage = { id: string; name: string; email: string; message: string };
export type NotificationStatus = "accepted" | "unavailable";

// Provider acceptance is not proof of inbox delivery. Never expose provider errors or keys.
export async function sendContactNotification(
  config: ContactEmailConfig,
  contact: ContactMessage,
  send: typeof fetch = fetch,
): Promise<NotificationStatus> {
  if (!config.RESEND_API_KEY?.trim() || !config.CONTACT_EMAIL_FROM?.trim()) return "unavailable";
  try {
    const response = await send("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${config.RESEND_API_KEY}`,
        "content-type": "application/json",
        "idempotency-key": `contact/${contact.id}`,
      },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        from: config.CONTACT_EMAIL_FROM,
        to: [contactRecipient],
        reply_to: contact.email,
        subject: "New OzzyAzzura website enquiry",
        text: `Name: ${contact.name}\nEmail: ${contact.email}\nReference: ${contact.id}\n\n${contact.message}`,
      }),
    });
    if (!response.ok) return "unavailable";
    const result = await response.json() as { id?: unknown };
    return typeof result.id === "string" && result.id ? "accepted" : "unavailable";
  } catch {
    return "unavailable";
  }
}
