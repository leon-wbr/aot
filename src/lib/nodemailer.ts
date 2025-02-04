import { createTransport, Transporter } from "nodemailer";
// import SMTPTransport from "nodemailer/lib/smtp-transport";

interface Theme {
  brandColor?: string;
  buttonText?: string;
}

interface SendVerificationRequestParams {
  identifier: string;
  url: string;
  provider: any;
  // provider: {
  //   server?: SMTPTransport | SMTPTransport.Options | string;
  //   from?: string;
  // };
  theme: Theme;
}

export async function sendVerificationRequest(
  params: SendVerificationRequestParams
): Promise<void> {
  const { identifier, url, provider, theme } = params;
  const { host } = new URL(url);

  try {
    // NOTE: You are not required to use `nodemailer`, use whatever you want.
    const transport: Transporter = createTransport(provider.server);

    const result = await transport.sendMail({
      to: identifier,
      from: provider.from,
      subject: `Sign in to ${host}`,
      text: text({ url, host }),
      html: html({ url, host, theme }),
    });
    const failed = result.rejected.concat(result.pending).filter(Boolean);

    if (failed.length) {
      throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
    }
  } catch (e) {
    console.error("ERROR_PLjlgJnq email send error:", e);
  }
}

function html(params: { url: string; host: string; theme: Theme }): string {
  const { url, host, theme } = params;

  const escapedHost = host.replace(/\./g, "&#8203;.");

  const brandColor = theme.brandColor || "#346df1";
  const color = {
    background: "#f9f9f9",
    text: "#444",
    mainBackground: "#fff",
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText: theme.buttonText || "#fff",
  };

  return `
<body style="background: ${color.background};">
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Sign in to <strong>${escapedHost}</strong>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                target="_blank"
                style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign
                in</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
  </table>
</body>
`;
}

// Email Text body (fallback for email clients that don't render HTML, e.g. feature phones)
function text(params: { url: string; host: string }): string {
  const { url, host } = params;
  return `Sign in to ${host}\n${url}\n\n`;
}
