// server/services/mailer.ts
import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  CONTACT_TO,
  CONTACT_FROM,
} = process.env;

// Transport reutilizable
export const mailer = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT ?? 587),
  secure: String(SMTP_SECURE).toLowerCase() === "true", // true -> 465
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

// Verificación opcional al arrancar (útil en dev)
export async function verifyMailer() {
  try {
    await mailer.verify();
    console.log("📮 SMTP listo para enviar correos");
  } catch (err) {
    console.warn("⚠️  No se pudo verificar SMTP:", err);
  }
}

type ContactPayload = { name: string; email: string; message: string };

/**
 * Envía el email del formulario de contacto
 */
export async function sendContactEmail({ name, email, message }: ContactPayload) {
  const to = CONTACT_TO || "Fannyaleman0312@gmail.com";
  const from = CONTACT_FROM || SMTP_USER || "no-reply@example.com";

  const subject = `Nuevo mensaje de contacto: ${name}`;
  const text = `Nombre: ${name}
Email: ${email}

${message}`;

  const html = `
    <h2>Nuevo mensaje de contacto</h2>
    <p><b>Nombre:</b> ${escapeHtml(name)}</p>
    <p><b>Email:</b> ${escapeHtml(email)}</p>
    <p><b>Mensaje:</b></p>
    <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
  `;

  await mailer.sendMail({
    from,
    to,
    replyTo: `${name} <${email}>`,
    subject,
    text,
    html,
  });
}

// Utilidad simple para evitar HTML injection
function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
