// TIP: sending real email needs a provider account (Resend, SendGrid,
// or Gmail via Nodemailer are the common free-tier options for a
// small site like this). Until one is configured, this just prints
// the code to your server's terminal — good enough to test the whole
// flow yourself locally before wiring up real delivery. Swap the
// body of this function for a real provider's send call later; every
// route that calls sendOtpEmail() stays exactly the same.
export async function sendOtpEmail(email, code) {
  console.log(`\n📧  OTP for ${email}: ${code}\n(Replace sendOtpEmail() in server/utils/email.js with a real provider to actually send this.)\n`);
}
