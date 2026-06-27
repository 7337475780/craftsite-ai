import { logger } from "../lib/logger.js";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail(options: EmailOptions) {
  // We log the email instead of sending it since we don't have Resend setup right now.
  // The system allows email-less invites through generated safe URLs.
  logger.info({
    msg: "Would send email if provider was configured",
    to: options.to,
    subject: options.subject,
    textPreview: options.text.substring(0, 50),
  });
}
