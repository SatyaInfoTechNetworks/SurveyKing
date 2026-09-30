const nodemailer = require('nodemailer');
require('dotenv').config();

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.zoho.in';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || 'team@satyainfotechnetworks.com';
const SMTP_PASS = process.env.SMTP_PASS || 'Satya@7886';
const SMTP_FROM = process.env.SMTP_FROM || '"StuEarn India" <team@satyainfotechnetworks.com>';

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
  }
  return transporter;
}

/**
 * Send an Amazon Pay Gift Card (or other voucher) code to the user via Zoho SMTP
 */
async function sendGiftCardEmail({
  to,
  userName = 'Valued User',
  amountInr = '10.00',
  coins = 1000,
  giftCardCode,
  method = 'Amazon Pay Gift Card',
  adminNote = ''
}) {
  if (!to || !to.includes('@')) {
    throw new Error(`Invalid recipient email address: '${to}'`);
  }

  if (!giftCardCode || !giftCardCode.trim()) {
    throw new Error('Gift Card voucher code is required to send redemption email');
  }

  const cleanCode = giftCardCode.trim();
  const transport = getTransporter();

  const isAmazon = method.toUpperCase().includes('AMAZON');
  const brandName = isAmazon ? 'Amazon Pay Gift Card' : (method || 'Gift Card Voucher');

  const subject = `🎁 Your ${brandName} (₹${amountInr}) is Here! - StuEarn India`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 0; color: #f1f5f9; }
    .container { max-width: 600px; margin: 24px auto; background: #131b2e; border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #f59e0b; }
    .brand { font-size: 24px; font-weight: 900; color: #f59e0b; letter-spacing: 0.5px; margin: 0; }
    .brand-sub { font-size: 13px; color: #94a3b8; margin-top: 4px; }
    .content { padding: 32px 24px; }
    .greeting { font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
    .desc { font-size: 14px; line-height: 1.6; color: #cbd5e1; margin-bottom: 24px; }
    .voucher-card { background: linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%); border: 2px dashed #f59e0b; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px; }
    .voucher-label { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #f59e0b; margin-bottom: 6px; }
    .voucher-amount { font-size: 30px; font-weight: 900; color: #10b981; margin-bottom: 14px; }
    .code-box { background: #0b0f19; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 14px 20px; font-family: 'Courier New', Courier, monospace; font-size: 22px; font-weight: 900; color: #fef08a; letter-spacing: 2px; display: inline-block; user-select: all; }
    .steps { background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid rgba(255, 255, 255, 0.08); }
    .steps-title { font-size: 14px; font-weight: 800; color: #fff; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
    .steps ol { margin: 0; padding-left: 20px; color: #94a3b8; font-size: 13px; line-height: 1.7; }
    .steps ol li { margin-bottom: 6px; }
    .steps ol strong { color: #f1f5f9; }
    .btn-cta { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000000; font-size: 14px; font-weight: 800; text-decoration: none; padding: 12px 28px; border-radius: 9999px; margin-top: 10px; }
    .footer { background: #0b0f19; padding: 20px 24px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 12px; color: #64748b; line-height: 1.6; }
    .footer a { color: #f59e0b; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="brand">👑 StuEarn India • Survey King</h1>
      <div class="brand-sub">Reward Payout & Gift Voucher Delivery</div>
    </div>
    <div class="content">
      <div class="greeting">Hello, ${userName}! 👋</div>
      <div class="desc">
        Great news! Your withdrawal request for <strong>₹${amountInr} INR</strong> (${Number(coins).toLocaleString()} Coins) has been approved and processed.
        Here is your official <strong>${brandName}</strong> voucher code:
      </div>

      <div class="voucher-card">
        <div class="voucher-label">Voucher Value</div>
        <div class="voucher-amount">₹${amountInr} INR</div>
        <div class="code-box">${cleanCode}</div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">Tap or click code above to copy</div>
      </div>

      ${adminNote ? `
      <div style="background: rgba(99,102,241,0.1); border-left: 4px solid #6366f1; padding: 10px 14px; border-radius: 4px; margin-bottom: 20px; font-size: 13px; color: #c7d2fe;">
        <strong>Admin Note:</strong> ${adminNote}
      </div>
      ` : ''}

      <div class="steps">
        <div class="steps-title">📌 How to Redeem Your Code:</div>
        <ol>
          <li>Open the <strong>Amazon App</strong> or visit <a href="https://www.amazon.in/addgiftcard" target="_blank" style="color: #f59e0b; text-decoration: underline;">amazon.in/addgiftcard</a>.</li>
          <li>Log in to your active Amazon India account.</li>
          <li>Paste or enter your gift card code: <strong>${cleanCode}</strong>.</li>
          <li>Click <strong>"Add to your balance"</strong>.</li>
          <li>The <strong>₹${amountInr}</strong> will be instantly credited to your Amazon Pay balance!</li>
        </ol>
        <div style="text-align: center; margin-top: 14px;">
          <a href="https://www.amazon.in/addgiftcard" class="btn-cta" target="_blank">Redeem on Amazon India 🚀</a>
        </div>
      </div>

      <div style="font-size: 12px; color: #94a3b8; text-align: center;">
        Need help? Reply directly to this email or reach us at <a href="mailto:team@satyainfotechnetworks.com" style="color: #f59e0b;">team@satyainfotechnetworks.com</a>.
      </div>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} StuEarn India. Powered by Satya InfoTech Networks.<br />
      This is an automated reward confirmation email. Keep your gift card code safe and do not share it with unauthorized individuals.
    </div>
  </div>
</body>
</html>
  `;

  const info = await transport.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    text: `Hello ${userName},\n\nYour ${brandName} for ₹${amountInr} INR has been approved!\n\nGift Card Code: ${cleanCode}\n\nTo redeem, visit: https://www.amazon.in/addgiftcard\n\nThank you for using Survey King / StuEarn India!`,
    html
  });

  console.log(`✉️ [SMTP GIFT CARD EMAIL SENT] To: ${to} | Code: ${cleanCode} | MessageId: ${info.messageId}`);
  return { success: true, messageId: info.messageId };
}

module.exports = {
  sendGiftCardEmail
};
