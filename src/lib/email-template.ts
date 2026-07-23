/** Branded magic-link email (inline styles for email-client compatibility). */
export function magicLinkEmail(url: string): string {
  return `
  <div style="background:#151515;padding:40px 24px;font-family:'Poppins',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;">
      <tr><td>
        <p style="color:#14b8b8;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0 0 16px;font-weight:600;">
          The Art of Money
        </p>
        <h1 style="color:#c9c9c9;font-size:28px;line-height:1.2;margin:0 0 16px;font-weight:800;">
          Your way in.
        </h1>
        <p style="color:#9a9a9a;font-size:15px;line-height:1.6;margin:0 0 28px;">
          Tap the button to sign in and pick up where you left off. This link
          works once and expires in 24 hours.
        </p>
        <a href="${url}"
           style="display:inline-block;background:#149490;color:#ffffff;text-decoration:none;
                  padding:14px 28px;border-radius:999px;font-size:15px;font-weight:600;">
          Sign in &rarr;
        </a>
        <p style="color:#5c5c5c;font-size:12px;line-height:1.6;margin:28px 0 0;">
          If you didn't request this, you can ignore it — nobody can access your
          account without this link.
        </p>
      </td></tr>
    </table>
  </div>`;
}
