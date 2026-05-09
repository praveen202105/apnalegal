export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function otpExpiresAt(): Date {
  return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
}

export async function sendOtp(phone: string, otp: string): Promise<void> {
  const provider = process.env.SMS_PROVIDER || 'console';

  if (provider === 'console') {
    console.log(`\n📱 OTP for ${phone}: ${otp} (dev mode — not sent via SMS)\n`);
    return;
  }

  // TODO: integrate MSG91 or Twilio here
  // e.g. await msg91.sendOtp(phone, otp);
  throw new Error(`SMS provider "${provider}" not configured`);
}
