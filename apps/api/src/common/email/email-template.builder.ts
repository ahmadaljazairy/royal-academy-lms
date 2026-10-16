/**
 * @file Email Template Builder
 * @module @royal-academy/api/common/email/email-template.builder
 * @description Renders responsive HTML email templates with inline styling for reliable client rendering.
 */

export interface EmailTemplateOutput {
    readonly subject: string;
    readonly html: string;
}

export class EmailTemplateBuilder {
    /**
     * Renders the Account Verification email template.
     */
    static buildVerificationTemplate(
        webAppUrl: string,
        token: string,
    ): EmailTemplateOutput {
        const link = `${webAppUrl}/verify-email?token=${token}`;

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0F172A;">
  <table role="presentation" style="width: 100%; max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04); border-collapse: collapse;">
    <tr>
      <td style="height: 6px; background-color: #6B0110; padding: 0; line-height: 6px; font-size: 6px;">&nbsp;</td>
    </tr>
    <tr>
      <td style="padding: 40px 36px;">
        <table role="presentation" style="width: 100%; margin: 0 auto 24px auto; border-collapse: collapse;">
          <tr>
            <td style="text-align: center;">
              <div style="display: inline-block; width: 52px; height: 52px; background-color: #FAE8EA; border-radius: 50%; text-align: center; line-height: 52px; margin-bottom: 12px;">
                <span style="font-size: 24px; line-height: 52px; color: #6B0110;">✉</span>
              </div>
              <br/>
              <div style="display: inline-block; background-color: #FAE8EA; border: 1px solid #F3C6CB; border-radius: 9999px; padding: 4px 14px; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: #6B0110; text-transform: uppercase;">
                SECURITY VERIFICATION
              </div>
            </td>
          </tr>
        </table>
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="text-align: center; padding-bottom: 8px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #0F172A; letter-spacing: -0.02em;">
                Verify Your Email Address
              </h1>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding-bottom: 28px;">
              <p style="margin: 0 auto; font-size: 13px; line-height: 1.6; color: #64748B; max-width: 420px;">
                Welcome to the <strong>Royal Academy LMS</strong>. Confirm your email address to activate your account, access enrolled courses, and verify academic certifications.
              </p>
            </td>
          </tr>
        </table>
        <table role="presentation" style="margin: 0 auto 28px auto; border-collapse: collapse;">
          <tr>
            <td style="border-radius: 9999px; background-color: #6B0110; text-align: center; box-shadow: 0 4px 14px rgba(107, 1, 16, 0.25);">
              <a href="${link}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 36px; font-size: 13px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 9999px;">
                Verify Account &rarr;
              </a>
            </td>
          </tr>
        </table>
        <table role="presentation" style="width: 100%; background-color: #F0F4FD; border: 1px solid #E2EAF9; border-radius: 14px; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 16px;">
              <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 600; color: #334155;">
                Button not working? Paste this link into your browser:
              </p>
              <p style="margin: 0; font-size: 11px; line-height: 1.4; word-break: break-all;">
                <a href="${link}" target="_blank" rel="noopener noreferrer" style="color: #6B0110; text-decoration: underline;">${link}</a>
              </p>
            </td>
          </tr>
        </table>
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="border-top: 1px solid #F1F5F9; padding-top: 20px; font-size: 11px; line-height: 1.5; color: #94A3B8; text-align: center;">
              This verification link expires in <strong>24 hours</strong>. If you did not create an account on Royal Academy, you can safely disregard this email.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <table role="presentation" style="width: 100%; max-width: 560px; margin: 24px auto 0 auto; text-align: center; border-collapse: collapse;">
    <tr>
      <td style="font-size: 11px; color: #94A3B8; line-height: 1.6; text-align: center;">
        256-bit Institutional Encryption Standard &bull; ISO 27001 Certified Governance<br/>
        &copy; 2026 Royal Academy International Training Center. All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>
    `;

        return {
            subject: 'Verify your Royal Academy account',
            html,
        };
    }

    /**
     * Renders the Password Reset email template.
     */
    static buildPasswordResetTemplate(
        webAppUrl: string,
        token: string,
    ): EmailTemplateOutput {
        const link = `${webAppUrl}/reset-password?token=${token}`;

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0F172A;">
  <table role="presentation" style="width: 100%; max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04); border-collapse: collapse;">
    <tr>
      <td style="height: 6px; background-color: #6B0110; padding: 0; line-height: 6px; font-size: 6px;">&nbsp;</td>
    </tr>
    <tr>
      <td style="padding: 40px 36px;">
        <table role="presentation" style="width: 100%; margin: 0 auto 24px auto; border-collapse: collapse;">
          <tr>
            <td style="text-align: center;">
              <div style="display: inline-block; width: 52px; height: 52px; background-color: #FAE8EA; border-radius: 50%; text-align: center; line-height: 52px; margin-bottom: 12px;">
                <span style="font-size: 22px; line-height: 52px; color: #6B0110;">🔒</span>
              </div>
              <br/>
              <div style="display: inline-block; background-color: #FAE8EA; border: 1px solid #F3C6CB; border-radius: 9999px; padding: 4px 14px; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: #6B0110; text-transform: uppercase;">
                ACCOUNT SECURITY RECOVERY
              </div>
            </td>
          </tr>
        </table>
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="text-align: center; padding-bottom: 8px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #0F172A; letter-spacing: -0.02em;">
                Reset Your Password
              </h1>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding-bottom: 28px;">
              <p style="margin: 0 auto; font-size: 13px; line-height: 1.6; color: #64748B; max-width: 420px;">
                We received a request to reset credentials for your <strong>Royal Academy</strong> account. Select the button below to establish a new password.
              </p>
            </td>
          </tr>
        </table>
        <table role="presentation" style="margin: 0 auto 28px auto; border-collapse: collapse;">
          <tr>
            <td style="border-radius: 9999px; background-color: #6B0110; text-align: center; box-shadow: 0 4px 14px rgba(107, 1, 16, 0.25);">
              <a href="${link}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 36px; font-size: 13px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 9999px;">
                Reset Password &rarr;
              </a>
            </td>
          </tr>
        </table>
        <table role="presentation" style="width: 100%; background-color: #F0F4FD; border: 1px solid #E2EAF9; border-radius: 14px; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 16px;">
              <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 600; color: #334155;">
                Button not working? Paste this link into your browser:
              </p>
              <p style="margin: 0; font-size: 11px; line-height: 1.4; word-break: break-all;">
                <a href="${link}" target="_blank" rel="noopener noreferrer" style="color: #6B0110; text-decoration: underline;">${link}</a>
              </p>
            </td>
          </tr>
        </table>
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="border-top: 1px solid #F1F5F9; padding-top: 20px; font-size: 11px; line-height: 1.5; color: #94A3B8; text-align: center;">
              This link is single-use and expires in <strong>1 hour</strong>. If you did not initiate this request, your account remains secure and no changes were applied.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <table role="presentation" style="width: 100%; max-width: 560px; margin: 24px auto 0 auto; text-align: center; border-collapse: collapse;">
    <tr>
      <td style="font-size: 11px; color: #94A3B8; line-height: 1.6; text-align: center;">
        256-bit Institutional Encryption Standard &bull; ISO 27001 Certified Governance<br/>
        &copy; 2026 Royal Academy International Training Center. All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>
    `;

        return {
            subject: 'Reset your Royal Academy password',
            html,
        };
    }
}