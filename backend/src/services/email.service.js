import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let etherealTransporter = null;

/**
 * Dynamically get or create Nodemailer transporter from env
 */
const getTransporter = () => {
  if (
    env.smtp.host &&
    env.smtp.user &&
    env.smtp.user !== 'dev_user' &&
    env.smtp.user !== 'your_smtp_username'
  ) {
    return nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    });
  }
  return null;
};

/**
 * Fallback to an instant Ethereal SMTP test account for seamless dev email testing
 */
const getEtherealTransporter = async () => {
  if (!etherealTransporter) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      etherealTransporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(
        `\x1b[36m[Email Service] Created temporary Ethereal test inbox (${testAccount.user})\x1b[0m`
      );
    } catch (err) {
      console.error(`\x1b[31m[Email Service] Failed to create Ethereal test account:\x1b[0m ${err.message}`);
    }
  }
  return etherealTransporter;
};

/**
 * Send email using configured SMTP transporter with automatic Ethereal fallback in development
 * @param {Object} options - { to, subject, html }
 */
export const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: env.smtp.from || 'Angadix Store <noreply@angadix.com>',
    to,
    subject,
    html,
  };

  const configuredTransporter = getTransporter();

  if (configuredTransporter) {
    try {
      const info = await configuredTransporter.sendMail(mailOptions);
      console.log(`\x1b[32m[Email Service] Real email sent to ${to}: ${info.messageId}\x1b[0m`);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`\x1b[36m[Email Service] Email Preview URL:\x1b[0m ${previewUrl}`);
      }
      return info;
    } catch (error) {
      console.error(`\x1b[31m[Email Service] Configured SMTP Error (${env.smtp.host}):\x1b[0m ${error.message}`);

      if (error.message.includes('535') || error.message.includes('Authentication failed')) {
        console.warn(
          `\x1b[33m[Email Service Warning] Brevo/SMTP Authentication Failed. Check SMTP_USER and SMTP_PASS in backend/.env.\x1b[0m`
        );
      }

      if (env.isDev) {
        console.log(`\x1b[33m[Email Service Dev Fallback] Attempting delivery via Ethereal Email test inbox...\x1b[0m`);
        try {
          const fallbackTransporter = await getEtherealTransporter();
          if (fallbackTransporter) {
            const fallbackInfo = await fallbackTransporter.sendMail(mailOptions);
            const previewUrl = nodemailer.getTestMessageUrl(fallbackInfo);
            console.log(
              `\x1b[32m[Email Service Dev Fallback] Email delivered to test inbox!\x1b[0m`
            );
            console.log(
              `\x1b[36m👉 [CLICK HERE TO OPEN YOUR EMAIL]:\x1b[0m \x1b[4m${previewUrl}\x1b[0m`
            );
            return fallbackInfo;
          }
        } catch (fallbackErr) {
          console.error(`\x1b[31m[Email Service Fallback Error]:\x1b[0m ${fallbackErr.message}`);
        }
      } else {
        throw error;
      }
    }
  } else if (env.isDev) {
    // Development fallback when no SMTP configured
    console.log(`\x1b[33m[Email Service Dev Fallback] Sending via Ethereal Email test inbox...\x1b[0m`);
    try {
      const fallbackTransporter = await getEtherealTransporter();
      if (fallbackTransporter) {
        const fallbackInfo = await fallbackTransporter.sendMail(mailOptions);
        const previewUrl = nodemailer.getTestMessageUrl(fallbackInfo);
        console.log(`\x1b[32m[Email Service Dev Fallback] Email delivered to test inbox!\x1b[0m`);
        console.log(
          `\x1b[36m👉 [CLICK HERE TO OPEN YOUR EMAIL]:\x1b[0m \x1b[4m${previewUrl}\x1b[0m`
        );
        return fallbackInfo;
      }
    } catch (fallbackErr) {
      console.error(`\x1b[31m[Email Service Fallback Error]:\x1b[0m ${fallbackErr.message}`);
    }
  }
};

/**
 * Send Email Verification link
 */
export const sendVerificationEmail = async (email, name, rawToken) => {
  const verificationUrl = `${env.clientUrl}/verify-email?token=${rawToken}`;
  const html = renderEmailTemplate({
    title: 'Verify Your Email Address',
    bodyHtml: `<p>Hello <strong>${name}</strong>,</p><p>Welcome to Angadix! Please click the button below to verify your email address and activate your account.</p>`,
    actionUrl: verificationUrl,
    actionText: 'Verify Email Address',
  });

  await sendEmail({
    to: email,
    subject: 'Angadix - Verify Your Email Address',
    html,
  });
};

/**
 * Send Password Reset Link
 */
export const sendPasswordResetEmail = async (email, name, rawToken) => {
  const resetUrl = `${env.clientUrl}/reset-password?token=${rawToken}`;
  const html = renderEmailTemplate({
    title: 'Password Reset Request',
    bodyHtml: `<p>Hello <strong>${name}</strong>,</p><p>We received a request to reset your password for your Angadix account. Click the button below to set a new password. This link will expire in 15 minutes.</p>`,
    actionUrl: resetUrl,
    actionText: 'Reset Password',
  });

  await sendEmail({
    to: email,
    subject: 'Angadix - Password Reset Request',
    html,
  });
};

/**
 * Branded HTML Template Wrapper for Angadix Emails
 */
const renderEmailTemplate = ({ title, bodyHtml, actionUrl, actionText }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #E1F5FE;
      margin: 0;
      padding: 40px 20px;
      color: #1E293B;
    }
    .email-card {
      max-width: 580px;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(2, 102, 200, 0.08);
      border: 1px solid #BAE6FD;
    }
    .header {
      background: #0266C8;
      padding: 32px 40px;
      text-align: center;
    }
    .header h1 {
      color: #FFFFFF;
      margin: 0;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .content {
      padding: 40px;
    }
    .content h2 {
      color: #0266C8;
      font-size: 22px;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .content p {
      font-size: 15px;
      line-height: 1.6;
      color: #334155;
      margin-bottom: 24px;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      background-color: #0266C8;
      color: #FFFFFF !important;
      padding: 14px 32px;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(2, 102, 200, 0.3);
    }
    .footer {
      background: #F8FAFC;
      padding: 24px 40px;
      text-align: center;
      border-top: 1px solid #E2E8F0;
      font-size: 12px;
      color: #64748B;
    }
    .token-box {
      background: #F1F5F9;
      padding: 12px;
      border-radius: 6px;
      font-family: monospace;
      word-break: break-all;
      font-size: 13px;
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="email-card">
    <div class="header">
      <h1>ANGADIX</h1>
    </div>
    <div class="content">
      <h2>${title}</h2>
      ${bodyHtml}
      ${
        actionUrl && actionText
          ? `
        <div class="btn-container">
          <a href="${actionUrl}" target="_blank" class="btn">${actionText}</a>
        </div>
        <p style="font-size: 12px; color: #64748B;">If the button above does not work, copy and paste this link into your browser:</p>
        <div class="token-box">${actionUrl}</div>
      `
          : ''
      }
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Angadix Premium E-Commerce. All rights reserved.</p>
      <p>If you did not initiate this request, please ignore this email or contact support.</p>
    </div>
  </div>
</body>
</html>
  `;
};
