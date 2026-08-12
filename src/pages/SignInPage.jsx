/*
  TIP: This page is a state machine with three "steps":
    'email'  → enter email (or use Google), validated live
    'code'   → 6-digit code entry, with a resend countdown
  A fourth in-between moment ("We've sent a code to X") is shown
  briefly as a transition, matching her design, before the code
  boxes appear.

  This mirrors real email-OTP sign-in flows (no password to remember —
  just prove you own the email by entering a code sent to it).
*/
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_SECONDS = 53; // matches "Resend code in 53 secs" in her design

export default function SignInPage() {
  const [step, setStep] = useState('email'); // 'email' | 'sending' | 'code'
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const isValidEmail = EMAIL_REGEX.test(email);
  const showInvalid = emailTouched && email.length > 0 && !isValidEmail;

  // TIP: the countdown for "Resend code in N secs". setInterval keeps
  // running until the cleanup function (the returned function) runs —
  // React calls that cleanup automatically when the component
  // unmounts, or right before this effect re-runs. Without it, you'd
  // stack up multiple intervals every time the step changes.
  useEffect(() => {
    if (step !== 'code' || secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [step, secondsLeft]);

  async function handleContinue(e) {
    e.preventDefault();
    setEmailTouched(true);
    if (!isValidEmail) return;

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/customer/request-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Could not send code — try again.');

      setStep('sending');
      // TIP: brief transition screen ("We have sent a code to...")
      // before showing the code boxes, matching her design's separate
      // frame for that moment.
      setTimeout(() => {
        setStep('code');
        setSecondsLeft(RESEND_SECONDS);
      }, 1400);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCodeChange(index, value) {
    if (!/^\d?$/.test(value)) return; // only allow a single digit
    const next = [...code];
    next[index] = value;
    setCode(next);
    setError('');

    // TIP: auto-advance focus to the next box as soon as one is filled —
    // this is why OTP inputs feel fast to use instead of clicking each box.
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (next.every((d) => d !== '')) {
      verifyCode(next.join(''));
    }
  }

  function handleCodeKeyDown(index, e) {
    // TIP: backspace on an empty box jumps back to the previous one,
    // matching how every OTP input you've ever used behaves.
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function verifyCode(fullCode) {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/customer/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid code — try again.');

      login(data.user, data.token);
      const redirectTo = new URLSearchParams(location.search).get('redirect') || '/account';
      navigate(redirectTo);
    } catch (err) {
      setError(err.message);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setSecondsLeft(RESEND_SECONDS);
    setCode(['', '', '', '', '', '']);
    await fetch(`${import.meta.env.VITE_API_URL}/api/auth/customer/request-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
  }

  function handleGoogleSignIn() {
    // TIP: Google Identity Services normally renders its own button
    // and hands back an ID token, which then gets sent to the backend
    // to verify. That setup needs a real Google Client ID from Google
    // Cloud Console, so this is wired to a placeholder until that's
    // configured — see server/README.md.
    window.dispatchEvent(
      new CustomEvent('lara-toast', {
        detail: 'Google Sign-In needs a Google Client ID to be configured first.',
      })
    );
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 py-16 text-center">
      <h1 className="font-display text-2xl italic mb-10">Lara's Crochet</h1>

      {step === 'email' && (
        <form onSubmit={handleContinue} className="w-full">
          <h2 className="text-sm font-bold mb-1">Sign In</h2>
          <p className="text-xs text-[var(--muted)] mb-6">Sign in or create an account</p>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="mb-4 flex w-full items-center justify-center gap-2 border border-[var(--line)] py-3 text-sm hover:bg-black/[0.02]"
          >
            {/* Simple inline "G" mark — avoids pulling in a brand asset */}
            <span className="font-bold text-[#4285F4]">G</span>
            Sign in with Google
          </button>

          <div className="mb-4 flex items-center gap-3 text-[10px] uppercase text-[var(--muted)]">
            <span className="h-px flex-1 bg-[var(--line)]" />
            or
            <span className="h-px flex-1 bg-[var(--line)]" />
          </div>

          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              placeholder="Email"
              className={`w-full border px-3 py-3 text-sm outline-none ${
                showInvalid
                  ? 'border-red-400 text-red-600'
                  : 'border-[var(--line)] focus:border-[var(--ink)]'
              }`}
            />
            {/* Valid-email checkmark, matching her "Valid email address" frame */}
            {emailTouched && isValidEmail && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-sm">✓</span>
            )}
            {showInvalid && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-sm">✕</span>
            )}
          </div>
          {showInvalid && (
            <p className="mt-1 text-left text-[11px] text-red-500">Invalid email address</p>
          )}
          {error && <p className="mt-2 text-[11px] text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full bg-[var(--ink)] py-3 text-sm text-white uppercase tracking-wide hover:bg-[var(--maroon)] disabled:opacity-50"
          >
            {submitting ? 'Sending...' : 'Continue'}
          </button>

          <p className="mt-6 text-[10px] leading-relaxed text-[var(--muted)]">
            By continuing, you agree to receive recurring, automated marketing messages from
            SMS40 and agree to our Terms of Service and Privacy Policy.
          </p>
        </form>
      )}

      {step === 'sending' && (
        <p className="text-sm text-[var(--muted)]">
          We have sent a code to <strong>{email}</strong>
          <br />
          Kindly check and input code to verify your email address.
        </p>
      )}

      {step === 'code' && (
        <div className="w-full">
          <h2 className="text-sm font-bold mb-1">Enter Code</h2>
          <p className="text-xs text-[var(--muted)] mb-6">Sent to {email}</p>

          <div className="flex justify-center gap-2">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                onKeyDown={(e) => handleCodeKeyDown(i, e)}
                className="h-12 w-10 border border-[var(--line)] text-center text-lg outline-none focus:border-[var(--ink)]"
              />
            ))}
          </div>
          {error && <p className="mt-3 text-[11px] text-red-500">{error}</p>}

          <button
            onClick={handleResend}
            disabled={secondsLeft > 0}
            className="mt-4 text-[11px] underline disabled:no-underline disabled:text-[var(--muted)]"
          >
            {secondsLeft > 0 ? `Resend code in ${secondsLeft} secs` : 'Resend code'}
          </button>
        </div>
      )}

      <p className="mt-10 text-[10px] text-[var(--muted)] underline">Privacy Policy</p>
    </section>
  );
}
