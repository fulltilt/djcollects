import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST) return null;
  if (!transporter) {
    const port = Number(SMTP_PORT ?? 587);
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

type Mail = { to: string; subject: string; text: string; replyTo?: string };

export async function sendMail({ to, subject, text, replyTo }: Mail) {
  const t = getTransporter();
  const from = process.env.MAIL_FROM;
  if (!t || !from) {
    console.warn(`SMTP not configured; skipped email "${subject}"`);
    return;
  }
  await t.sendMail({ from, to, subject, text, replyTo });
}

export async function notifyNewSubscriber(email: string, source: string) {
  const to = process.env.NOTIFY_EMAIL;
  if (!to) return;
  await sendMail({
    to,
    replyTo: email,
    subject: `New signup: ${email}`,
    text: [
      "Someone joined the interest list.",
      "",
      `Email:  ${email}`,
      `Source: ${source}`,
      `Time:   ${new Date().toISOString()}`,
    ].join("\n"),
  });
}
