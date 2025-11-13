import dbConnect from "@/app/backend/config/MongoDB";
import User from "@/app/backend/models/user";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { User as UserType } from "@/app/types/appTypes";
import sgMail from "@sendgrid/mail";

// Static data for email summary
const staticSummaryData = {
  income: 12500,
  expenses: 8900,
  topCategory: { name: "Food", amount: 2500 },
  upcomingBills: [
    { name: "Electricity Bill", amount: 120, dueDate: "2023-10-25" },
    { name: "Internet Bill", amount: 60, dueDate: "2023-10-28" },
    { name: "Rent", amount: 1000, dueDate: "2023-11-01" },
    { name: "Credit Card Payment", amount: 500, dueDate: "2023-11-05" },
  ],
};

async function sendEmailSummary(user: UserType, period: string) {
  // Use static data
  const { income, expenses, topCategory, upcomingBills } = staticSummaryData;

  // Generate HTML email
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #333; text-align: center; margin-bottom: 30px;">${
          period.charAt(0).toUpperCase() + period.slice(1)
        } Budget Summary</h1>
        <p style="font-size: 16px; color: #555;">Hello ${user.name},</p>
        <p style="font-size: 16px; color: #555;">Here's your ${period} financial summary:</p>

        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #2e7d32; margin: 0;">Income: $${income.toFixed(
            2
          )}</h2>
        </div>

        <div style="background-color: #ffebee; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #c62828; margin: 0;">Expenses: $${expenses.toFixed(
            2
          )}</h2>
        </div>

        <div style="background-color: #fff3e0; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #ef6c00; margin: 0;">Top Spending Category: ${
            topCategory.name
          } - $${topCategory.amount}</h2>
        </div>

        <h3 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 10px;">Upcoming Bills:</h3>
        <ul style="list-style-type: none; padding: 0;">
          ${upcomingBills
            .map(
              (bill) => `
            <li style="background-color: #f5f5f5; margin: 10px 0; padding: 15px; border-radius: 5px; border-left: 4px solid #2196f3;">
              <strong>${bill.name}</strong>: $${bill.amount} <br>
              <small style="color: #666;">Due: ${bill.dueDate}</small>
            </li>
          `
            )
            .join("")}
        </ul>

        <p style="font-size: 16px; color: #555; margin-top: 30px;">Keep up the good work managing your budget!</p>
        <p style="font-size: 16px; color: #555;">Best regards,<br><strong>Budget Buddy Team</strong></p>
      </div>
    </div>
  `;

  // Set up SendGrid
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

  const subject = `${
    period.charAt(0).toUpperCase() + period.slice(1)
  } Budget Summary - Budget Buddy`;

  await sgMail.send({
    to: user.email,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject,
    html,
  });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const cronSecret = url.searchParams.get("secret");
  const period = url.searchParams.get("period") || "monthly";

  if (cronSecret !== process.env.CRON_SECRET_KEY) {
    return JsonOne(403, "Unauthorized", false);
  }

  try {
    await dbConnect();
    const users = await User.find({});
    console.log(
      "Sending emails to:",
      users.map((u) => u.email)
    );

    // Send emails in parallel
    await Promise.all(
      users.map(async (user) => {
        try {
          console.log(`Sending email to: ${user.email}`);
          await sendEmailSummary(user, period);
        } catch (error) {
          console.error(`Error sending email to ${user.email}:`, error);
        }
      })
    );

    return JsonOne(200, "Email summaries sent to all users", true);
  } catch (error) {
    console.error("Error in email summary cron:", error);
    return JsonOne(500, "Failed to process email summaries", false);
  }
}
