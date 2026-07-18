import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  country: string;      // "lebanon" | "ksa"
  projectType: string;  // "commercial" | "private" | "organizational"
  services: string[];   // ["design", "pm", "supervision", "execution"]
}

// ─── Label maps ───────────────────────────────────────────────────────────────

const COUNTRY_LABELS: Record<string, string> = {
  lebanon: "Lebanon",
  ksa: "Saudi Arabia",
};

const PROJECT_TYPE_LABELS: Record<string, string> = {
  commercial: "Commercial Project",
  private: "Private Project",
  organizational: "Organizational Project",
};

const SERVICE_LABELS: Record<string, string> = {
  design: "Design",
  pm: "Project Management & Consultancy",
  supervision: "Supervision",
  execution: "Execution & Contracting",
};

const KNOWN_SERVICES = new Set(Object.keys(SERVICE_LABELS));

// ─── Phone normalization ──────────────────────────────────────────────────────

function normalizePhone(raw: string, country: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("961") || digits.startsWith("966")) return digits;
  if (digits.startsWith("0")) return "961" + digits.slice(1);
  return (country === "ksa" ? "966" : "961") + digits;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(body: Partial<ContactPayload>): string | null {
  if (!body.name || body.name.trim().length < 2) return "Name is required.";
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))
    return "A valid email address is required.";
  if (!body.phone || body.phone.replace(/\D/g, "").length < 5)
    return "A valid phone number is required.";
  if (!body.country || !COUNTRY_LABELS[body.country])
    return "Please select a country.";
  if (!body.projectType || !PROJECT_TYPE_LABELS[body.projectType])
    return "Please select a project type.";
  if (!body.services || body.services.length === 0)
    return "Please select at least one service.";
  return null;
}

// ─── Email template ───────────────────────────────────────────────────────────

function buildEmailHtml(data: ContactPayload): string {
  const country = COUNTRY_LABELS[data.country];
  const projectType = PROJECT_TYPE_LABELS[data.projectType];
  const servicesHtml = data.services
    .filter((s) => KNOWN_SERVICES.has(s))
    .map((s) => `<li style="margin-bottom:6px;font-size:13px;color:#2c2c2c;">${SERVICE_LABELS[s]}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f0efeb;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0efeb;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:4px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#143531;padding:36px 40px;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#f7f9f9;letter-spacing:0.08em;text-transform:uppercase;">
                Eterna Builds
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#85BB9C;letter-spacing:0.25em;text-transform:uppercase;">
                Spaces that Understand you
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 20px;font-size:16px;color:#2c2c2c;line-height:1.6;">
                Dear ${data.name},
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#4a4a4a;line-height:1.75;">
                Thank you for contacting Eterna Builds. We have received your project enquiry
                and a member of our team will reach out to you within 1–2 business days to
                discuss your requirements in detail.
              </p>

              <!-- Summary box -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#f7f9f9;border-left:3px solid #143531;border-radius:2px;margin:0 0 28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 16px;font-size:10px;color:#85BB9C;letter-spacing:0.3em;text-transform:uppercase;font-weight:600;">
                      Enquiry Summary
                    </p>
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding:5px 0;font-size:13px;color:#6b6b6b;width:130px;vertical-align:top;">Country</td>
                        <td style="padding:5px 0;font-size:13px;color:#2c2c2c;font-weight:600;">${country}</td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;font-size:13px;color:#6b6b6b;vertical-align:top;">Project Type</td>
                        <td style="padding:5px 0;font-size:13px;color:#2c2c2c;font-weight:600;">${projectType}</td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;font-size:13px;color:#6b6b6b;vertical-align:top;">Services</td>
                        <td style="padding:5px 0;">
                          <ul style="margin:0;padding:0 0 0 16px;">${servicesHtml}</ul>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 20px;font-size:15px;color:#4a4a4a;line-height:1.75;">
                We look forward to understanding your vision and delivering a space that
                exceeds your expectations — on time, on budget, and built to last.
              </p>
              <p style="margin:0;font-size:15px;color:#4a4a4a;line-height:1.75;">
                Warm regards,<br />
                <strong style="color:#143531;">The Eterna Builds Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f0efeb;padding:22px 40px;border-top:1px solid #e4e3df;">
              <p style="margin:0 0 6px;font-size:12px;color:#8a8a8a;">
                Lebanon: +961 3 665 002 &nbsp;·&nbsp; Saudi Arabia: +966 507 515 273
              </p>
              <p style="margin:0;font-size:12px;color:#8a8a8a;">
                <a href="mailto:info@eterna-builds.com"
                  style="color:#143531;text-decoration:none;">info@eterna-builds.com</a>
                &nbsp;·&nbsp;
                <a href="https://www.instagram.com/eterna.builds/"
                  style="color:#143531;text-decoration:none;">@eterna.builds</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Owner notification email ─────────────────────────────────────────────────

function buildOwnerEmailHtml(data: ContactPayload): string {
  const country = COUNTRY_LABELS[data.country];
  const projectType = PROJECT_TYPE_LABELS[data.projectType];
  const servicesHtml = data.services
    .filter((s) => KNOWN_SERVICES.has(s))
    .map((s) => `<li style="margin-bottom:6px;font-size:14px;color:#2c2c2c;">${SERVICE_LABELS[s]}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f0efeb;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0efeb;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:4px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#143531;padding:28px 40px;">
              <p style="margin:0;font-size:18px;font-weight:700;color:#f7f9f9;letter-spacing:0.08em;text-transform:uppercase;">
                New Enquiry Received
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#85BB9C;letter-spacing:0.2em;text-transform:uppercase;">
                Eterna Builds Website
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px 28px;">
              <p style="margin:0 0 20px;font-size:15px;color:#4a4a4a;line-height:1.7;">
                A new project enquiry has been submitted through the website.
              </p>

              <!-- Contact details -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#f7f9f9;border-left:3px solid #85BB9C;border-radius:2px;margin:0 0 24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 14px;font-size:10px;color:#85BB9C;letter-spacing:0.3em;text-transform:uppercase;font-weight:600;">
                      Contact Details
                    </p>
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding:5px 0;font-size:13px;color:#6b6b6b;width:100px;vertical-align:top;">Name</td>
                        <td style="padding:5px 0;font-size:14px;color:#2c2c2c;font-weight:600;">${data.name}</td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;font-size:13px;color:#6b6b6b;vertical-align:top;">Email</td>
                        <td style="padding:5px 0;font-size:14px;color:#2c2c2c;">
                          <a href="mailto:${data.email}" style="color:#143531;text-decoration:none;">${data.email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;font-size:13px;color:#6b6b6b;vertical-align:top;">Phone</td>
                        <td style="padding:5px 0;font-size:14px;color:#2c2c2c;">
                          <a href="tel:${data.phone.replace(/\s/g, "")}" style="color:#143531;text-decoration:none;">${data.phone}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Project details -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#f7f9f9;border-left:3px solid #143531;border-radius:2px;margin:0 0 24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 14px;font-size:10px;color:#85BB9C;letter-spacing:0.3em;text-transform:uppercase;font-weight:600;">
                      Project Details
                    </p>
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding:5px 0;font-size:13px;color:#6b6b6b;width:100px;vertical-align:top;">Country</td>
                        <td style="padding:5px 0;font-size:14px;color:#2c2c2c;font-weight:600;">${country}</td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;font-size:13px;color:#6b6b6b;vertical-align:top;">Project Type</td>
                        <td style="padding:5px 0;font-size:14px;color:#2c2c2c;font-weight:600;">${projectType}</td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;font-size:13px;color:#6b6b6b;vertical-align:top;">Services</td>
                        <td style="padding:5px 0;">
                          <ul style="margin:0;padding:0 0 0 16px;">${servicesHtml}</ul>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── WhatsApp template ────────────────────────────────────────────────────────

function buildWhatsAppMessage(data: ContactPayload): string {
  const country = COUNTRY_LABELS[data.country];
  const projectType = PROJECT_TYPE_LABELS[data.projectType];
  const servicesList = data.services
    .filter((s) => KNOWN_SERVICES.has(s))
    .map((s) => SERVICE_LABELS[s])
    .join(", ");

  return (
    `Hello ${data.name}! 👋\n\n` +
    `Thank you for reaching out to *Eterna Builds*. We've received your enquiry and our team will be in touch with you very shortly.\n\n` +
    `Here's a summary of what you submitted:\n` +
    `• *Country:* ${country}\n` +
    `• *Project Type:* ${projectType}\n` +
    `• *Services Requested:* ${servicesList}\n\n` +
    `We look forward to discussing your project and bringing your vision to life — on time, on budget, and beyond expectation.\n\n` +
    `— The Eterna Builds Team\n` +
    `📞 +961 3 665 002`
  );
}

// ─── Route handler ────────────────────────────────────────────────────────────

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

export async function POST(req: NextRequest) {
  let body: Partial<ContactPayload>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validationError = validate(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 422 });
  }

  const data = body as ContactPayload;

  const resend = getResend();

  // Build the list of sends — WhatsApp only runs if env vars are set
  const sends: Promise<unknown>[] = [
    // Confirmation email to the customer
    resend.emails.send({
      from: "Eterna Builds <info@eterna-builds.com>",
      to: data.email,
      subject: "We've received your enquiry — Eterna Builds",
      html: buildEmailHtml(data),
    }),
    // Notification email to the business owner
    resend.emails.send({
      from: "Eterna Builds <info@eterna-builds.com>",
      replyTo: data.email,
      to: "Mhmd_dandashli@hotmail.com",
      subject: `New Enquiry from ${data.name} — ${COUNTRY_LABELS[data.country]}`,
      html: buildOwnerEmailHtml(data),
    }),
  ];

  if (process.env.ULTRAMSG_INSTANCE_ID && process.env.ULTRAMSG_TOKEN) {
    const normalizedPhone = normalizePhone(data.phone, data.country);
    sends.push(
      fetch(
        `https://api.ultramsg.com/${process.env.ULTRAMSG_INSTANCE_ID}/messages/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: process.env.ULTRAMSG_TOKEN,
            to: normalizedPhone,
            body: buildWhatsAppMessage(data),
          }),
        }
      )
    );
  }

  const results = await Promise.allSettled(sends);

  const emailResult = results[0];
  const emailOk =
    emailResult.status === "fulfilled" &&
    !(emailResult.value as { error?: unknown }).error;

  if (!emailOk) {
    console.error("Email send failed:", emailResult);
    return NextResponse.json(
      { error: "Failed to send confirmation email. Please try again or contact us directly." },
      { status: 500 }
    );
  }

  if (results[1] && results[1].status === "rejected") {
    console.warn("WhatsApp send failed:", results[1]);
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
