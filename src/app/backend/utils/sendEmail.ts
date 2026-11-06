import nodemailer from "nodemailer";

const transporterFun = () => {
  return nodemailer.createTransport({
    host: process.env.HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const mailOptionsForResetPass = (email: string, token: string) => {
  const client = process.env.NEXTAUTH_URL || process.env.CLIENT;
  const resetUrl = `${client}/reset-password?token=${token}`;

  return {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Your Password - BudgetBuddy",
    text: `You're receiving this email from BudgetBuddy to reset your password.

Click the link below to proceed:
${resetUrl}

This link will expire in 5 minutes. If you didn't request this, you can ignore it.`,
    html: `
    <div style="font-family: Arial, sans-serif;">
      <p><strong>BudgetBuddy Password Reset</strong></p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="padding: 10px 16px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
      <p>This link will expire in 5 minutes. If you didn't request this, please ignore it.</p>
    </div>
  `,
  };
};

export { transporterFun, mailOptionsForResetPass };
