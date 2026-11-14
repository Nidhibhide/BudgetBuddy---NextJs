import Razorpay from "razorpay";
import crypto from "crypto";

export function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("Razorpay keys are missing");
  }

  return new Razorpay({ key_id, key_secret });
}

/** Convert major currency units to Razorpay subunits (paise/cents). */
export function toRazorpayAmount(amount: number): number {
  return Math.round(amount * 100);
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expected === signature;
}
