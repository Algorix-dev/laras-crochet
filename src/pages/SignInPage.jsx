/*
  TIP: Rebuilt against exact values pulled from Figma's Inspect
  panel — fonts, hex colors, and pixel spacing below are not
  estimates, they're the real numbers. This is the reference
  pattern for how every other page gets rebuilt: real values in,
  precise output out, rather than eyeballing a screenshot.

  Flow, per the spec:
    'intro'  → branded splash: logo fades in, tagline appears,
               then transitions into the form (this step was
               missing from the original build entirely)
    'email'  → enter email (or Google), validated live
    'sending'→ "we sent a code to X" — shown for a full 8 seconds
               per the spec's own animation-delay, not a quick blip
    'code'   → 6-digit entry with a resend countdown
*/
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_SECONDS = 53; // spec: "Resend code in 53 secs"

export default function SignInPage() {
  const [step, setStep] = useState('intro'); // 'intro' | 'email' | 'sending' | 'code'
  const [introVisible, setIntroVisible] = useState(false);
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

  /* TIP: the splash sequence — spec shows two near-identical frames,
     the first with the logo faded in (opacity building), the second
     fully visible with the tagline "THEY THAT GET IT", then a
     transition to the actual form after ~2.5s total. This is a
     branded loading moment, not a functional step, so it's driven
     by timers rather than user input. */
  useEffect(() => {
    if (step !== 'intro') return;
    const fadeIn = setTimeout(() => setIntroVisible(true), 50);
    const toForm = setTimeout(() => setStep('email'), 2500);
    return () => {
      clearTimeout(fadeIn);
      clearTimeout(toForm);
    };
  }, [step]);

  // Resend countdown — same pattern as before, values now match spec exactly
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
      // TIP: spec's own animation-delay on this frame is 8000ms —
      // a deliberately generous read time, not a quick flash.
      setTimeout(() => {
        setStep('code');
        setSecondsLeft(RESEND_SECONDS);
      }, 8000);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  function handleCodeChange(index, value) {
    if (!/^\d?$/.test(value)) return;
    const next = [...code];
    next[index] = value;
    setCode(next);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (next.every((d) => d !== '')) {
      verifyCode(next.join(''));
    }
  }

  function handleCodeKeyDown(index, e) {
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
    window.dispatchEvent(
      new CustomEvent('lara-toast', {
        detail: 'Google Sign-In needs a Google Client ID to be configured first.',
      })
    );
  }

  // ── Intro splash ──────────────────────────────────────────────
  if (step === 'intro') {
    return (
      <section className="font-ui flex min-h-[80vh] flex-col items-center justify-center bg-[#FAFAFA] px-5 text-center">
        <div
          className="transition-opacity duration-[1500ms] ease-out"
          style={{ opacity: introVisible ? 1 : 0 }}
        >
          {/* TIP: real logo PNG goes here once Teniayo sends it — the
              script wordmark can't be reproduced in a web font. This
              text is a placeholder standing in for that image. */}
          <p className="font-display text-3xl italic text-[#404040]">Lara's Crochet</p>
          <p className="mt-2 text-[20px] tracking-[0.7em] text-[#A3A3A3]">THEY THAT GET IT</p>
        </div>
      </section>
    );
  }

  return (
    <section className="font-ui mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center bg-[#FAFAFA] px-5 py-16 text-center">
      {/* Full logo — placeholder text until the real PNG arrives */}
      <p className="mb-16 font-display text-2xl italic text-[#404040]">Lara's Crochet</p>

      {step === 'email' && (
        <form onSubmit={handleContinue} className="w-full max-w-[457px]">
          <h1 className="text-[20px] font-bold leading-[30px] tracking-[-0.04em] text-[#404040]">
            Sign In
          </h1>
          <p className="mb-6 text-[14px] leading-5 text-[#737373]">Sign in or create an account</p>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="mb-4 flex w-full items-center justify-center gap-3 border border-[#A3A3A3] bg-[#FFFCFC] py-4 text-[16px] font-semibold leading-6 text-[#564345] hover:bg-black/[0.02]"
          >
            <span aria-hidden="true" className="font-bold text-[#4285F4]">G</span>
            Sign in with Google
          </button>

          <div className="mb-4 flex items-center gap-3 text-[16px] font-semibold leading-6 text-[#737373]">
            <span className="h-px flex-1 bg-[#D4D4D4]" />
            OR
            <span className="h-px flex-1 bg-[#D4D4D4]" />
          </div>

          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              placeholder="Email"
              className={`h-16 w-full border px-4 text-[16px] leading-6 outline-none placeholder:text-[#A3A3A3] ${
                showInvalid
                  ? 'border-red-400 text-red-600'
                  : emailTouched && isValidEmail
                  ? 'border-emerald-500'
                  : 'border-[#D4D4D4] focus:border-[#404040]'
              }`}
            />
            {emailTouched && isValidEmail && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600">✓</span>
            )}
            {showInvalid && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">✕</span>
            )}
          </div>
          {showInvalid && (
            <p className="mt-1 text-left text-[12px] text-red-500">Invalid email address</p>
          )}
          {error && <p className="mt-2 text-[12px] text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full bg-[#404040] py-3 text-sm uppercase tracking-wide text-white hover:bg-[#564345] disabled:opacity-50"
          >
            {submitting ? 'Sending...' : 'Continue'}
          </button>

          <p className="mt-6 text-[16px] leading-6 text-[#737373]">
            By continuing, you agree to receive recurring, automated marketing messages from
            Lara's Crochet and agree to our Terms of Service and Privacy Policy.
          </p>
        </form>
      )}

      {step === 'sending' && (
        <p className="max-w-[648px] text-[24px] font-medium leading-8 text-[#737373]">
          We have sent a code to <strong className="text-[#404040]">{email}</strong>
          <br />
          Kindly check and input code to verify your email address.
        </p>
      )}

      {step === 'code' && (
        <div className="w-full max-w-[412px]">
          <h1 className="text-[20px] font-bold leading-[30px] tracking-[-0.04em] text-[#404040]">
            Enter Code
          </h1>
          <p className="mb-6 text-[14px] leading-5 text-[#737373]">Sent to {email}</p>

          <div className="flex justify-center gap-[10px]">
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
                className="h-16 w-[60px] border-2 border-[#D4D4D4] text-center text-lg outline-none focus:border-[#404040]"
              />
            ))}
          </div>
          {error && <p className="mt-3 text-[12px] text-red-500">{error}</p>}

          <button
            onClick={handleResend}
            disabled={secondsLeft > 0}
            className="mt-8 text-[16px] font-semibold leading-6 text-[#737373] underline disabled:no-underline"
          >
            {secondsLeft > 0 ? `Resend code in ${secondsLeft} secs` : 'Resend code'}
          </button>
        </div>
      )}

      <p className="mt-10 text-[16px] leading-6 text-[#404040] underline">Privacy Policy</p>
    </section>
  );
}
