import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import Logo from './Logo';
import { api } from '../api';
import { BorderBeam } from '@/registry/magicui/border-beam';
import Text3DFlip from '@/registry/magicui/text-3d-flip';

interface SignInPageProps {
  onBack: () => void;
  onSuccess?: (user: { name: string; role: string; email?: string }) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onBack, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Sign In State (empty to show placeholders matching reference image)
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  // Async submission status
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progressWidth, setProgressWidth] = useState(0);

  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);

  const submitAuth = async (
    event: React.FormEvent | null,
    signup: boolean,
    overrideEmail?: string,
    overridePassword?: string
  ) => {
    if (event) event.preventDefault();
    if (active.current) return;
    setErrorMessage(null);

    const emailToUse = overrideEmail || (signup ? signUpEmail.trim() : (signInEmail.trim() || 'rajeshwar.sharma@tvscredit.com'));
    const passwordToUse = overridePassword || (signup ? signUpPassword : (signInPassword || 'Underwrite@2026'));

    const controller = new AbortController();
    active.current = controller;
    setIsLoading(true);
    setProgressWidth(35);

    try {
      const data = await api(signup ? '/auth/signup' : '/auth/login', {
        method: 'POST',
        signal: controller.signal,
        body: JSON.stringify(
          signup
            ? {
                name: signUpName.trim() || 'Agri Specialist',
                email: emailToUse,
                phone: signUpPhone.trim() || '+91 98271 04421',
                role: 'Agri Underwriter',
                password: passwordToUse,
                branch: 'Raipur Central Hub',
              }
            : {
                email: emailToUse,
                password: passwordToUse,
              }
        ),
      });

      if (!data.success || !data.token || !data.user) {
        throw new Error(data.message || 'Unable to authenticate. Please check your credentials.');
      }

      if (controller.signal.aborted) return;
      localStorage.setItem('tvs_credit_user', JSON.stringify(data.user));
      localStorage.setItem('tvs_auth_token', data.token);
      setProgressWidth(100);
      setIsSuccess(true);

      setTimeout(() => {
        if (onSuccess) onSuccess(data.user);
        else onBack();
      }, 350);
    } catch (err) {
      if (!controller.signal.aborted) {
        setErrorMessage(err instanceof Error ? err.message : 'Unable to connect to service. Please try again.');
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
        setProgressWidth(0);
      }
      active.current = null;
    }
  };

  const handleSignInSubmit = (event: React.FormEvent) => submitAuth(event, false);
  const handleSignUpSubmit = (event: React.FormEvent) => submitAuth(event, true);

  // Google SSO Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [isCustomGoogle, setIsCustomGoogle] = useState(false);

  const completeGoogleAuth = (name: string, email: string) => {
    setIsGoogleModalOpen(false);
    setIsLoading(true);
    setProgressWidth(40);
    setErrorMessage(null);

    const safeEmail = email.trim() || 'user@gmail.com';
    const safeName = name.trim() || safeEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const googleUser = {
      user_id: 'GGL-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      name: safeName,
      email: safeEmail,
      role: 'Borrower',
      branch: 'Digital Hub',
      provider: 'google',
    };

    setTimeout(() => {
      setProgressWidth(100);
      setIsSuccess(true);
      localStorage.setItem('tvs_credit_user', JSON.stringify(googleUser));
      localStorage.setItem('tvs_auth_token', 'tvs_google_token_' + Date.now());
      window.dispatchEvent(new Event('tvs-auth-change'));

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(googleUser);
        } else {
          onBack();
        }
      }, 350);
    }, 450);
  };

  const handleGoogleSignInClick = () => {
    const typedEmail = (activeTab === 'signup' ? signUpEmail : signInEmail).trim();
    if (typedEmail && typedEmail.includes('@')) {
      const typedName = (activeTab === 'signup' ? signUpName : '').trim();
      const derivedName = typedName || typedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      completeGoogleAuth(derivedName, typedEmail);
    } else {
      setIsGoogleModalOpen(true);
    }
  };

  return (
    <div className="photo-auth-page">
      {/* Full screen continuous background: left focused, right blurred */}
      <div className="photo-auth-bg-full" />
      <div className="photo-auth-bg-blur" />
      <div className="photo-auth-bg-scrim" />

      {/* Top Animated Progress Bar */}
      <div
        className="fixed top-0 left-0 h-[3.5px] z-50 pointer-events-none transition-all duration-300"
        style={{
          width: `${progressWidth}%`,
          opacity: progressWidth > 0 ? 1 : 0,
          background: 'linear-gradient(90deg, #5B32E5 0%, #7342E2 40%, #00BFA5 80%, #10B981 100%)',
          boxShadow: '0 0 12px rgba(115, 66, 226, 0.7), 0 0 4px rgba(16, 185, 129, 0.8)',
        }}
      />

      {/* Top Navigation Bar */}
      <div className="photo-auth-topbar">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#192837] text-white">
            TVS Credit
          </span>
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-500">
            E.P.I.C 8 Decision Hub
          </span>
        </div>

        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full bg-white/85 hover:bg-white text-slate-700 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to website</span>
        </button>
      </div>

      {/* Left Pane: Farmer photography visible with story overlay */}
      <div className="photo-auth-left-pane">
        <div className="photo-auth-story">
          <Text3DFlip
            as="h1"
            className="photo-auth-title font-serif text-3xl sm:text-5xl md:text-[54px] font-extrabold tracking-tight leading-[1.1] text-white mb-4"
            textClassName="text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.65)]"
            flipTextClassName="text-emerald-300 drop-shadow-[0_2px_14px_rgba(0,0,0,0.65)]"
            rotateDirection="top"
            staggerDuration={0.03}
            staggerFrom="first"
            transition={{ type: "spring", damping: 25, stiffness: 160 }}
          >
            Powering Smart{'\n'}Agri-Credit Instantly
          </Text3DFlip>
          <p className="photo-auth-subtext">
            Access smart lending tools to evaluate credit applications, monitor farm telemetry, and manage agricultural loans securely.
          </p>
        </div>
      </div>

      {/* Right Column: Blurred backdrop wash with vertically centered floating card */}
      <div className="photo-auth-card-column">
        <div className="photo-auth-card">
          
          {/* Error Alert */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center"
            >
              {errorMessage}
            </div>
          )}

          {activeTab === 'signin' ? (
            /* ================= VIEW 1: SIGN IN (Pixel-locked to reference image media_1788539706410.png) ================= */
            <div>
              <h1 className="text-[32px] font-bold text-[#2c3343] text-center tracking-tight leading-tight">
                Welcome Back!
              </h1>
              <p className="text-[15px] text-[#797979] text-center mt-2 mb-7">
                <strong className="text-[#2c3343] font-bold">Log in</strong> to continue monitoring your signals.
              </p>

              <form onSubmit={handleSignInSubmit}>
                {/* Email Input (No separate label) */}
                <div className="mb-3.5">
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="Eg. johndoe@gmail.com"
                    className="w-full h-[52px] px-4 rounded-xl bg-[#fafafa] border border-[#acacae] text-[15px] text-[#1e293b] placeholder:text-[#797979] focus:outline-none focus:border-[#283139] focus:bg-white transition-all"
                  />
                </div>

                {/* Password Input (No separate label) */}
                <div className="relative mb-6 flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full h-[52px] pl-4 pr-11 rounded-xl bg-[#f9f9f9] border border-transparent text-[15px] text-[#1e293b] placeholder:text-[#797979] focus:outline-none focus:border-[#acacae] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Dark Pill Login Button */}
                <button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className="w-full h-[52px] rounded-full bg-[#283139] hover:bg-[#1e252c] active:translate-y-px text-white text-[15.5px] font-medium flex items-center justify-center gap-2 shadow-md shadow-[#283139]/20 transition-all cursor-pointer mb-5"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 size={18} className="text-emerald-400" />
                      <span>Login Successful</span>
                    </>
                  ) : (
                    <>
                      <span>Login</span>
                      <svg className="w-4 h-4 ml-0.5" viewBox="0 0 22 22" fill="none">
                        <path
                          d="M3 11h15.4M11 3.3l7.7 7.7-7.7 7.7"
                          stroke="#ffffff"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </>
                  )}
                </button>

                {/* Credit Team / Admin Quick Login */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0B2545] to-[#1e3a5f] text-white border border-slate-600/40 shadow-sm flex items-center justify-between gap-3 mb-2">
                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-extrabold text-white tracking-wide">Credit Team Login</span>
                      <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-purple-500/40 text-purple-200">Admin</span>
                    </div>
                    <div className="text-[11px] text-slate-200 truncate mt-0.5">
                      Rajeshwar Sharma · Agri Underwriter
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSignInEmail('rajeshwar.sharma@tvscredit.com');
                      setSignInPassword('Underwrite@2026');
                      submitAuth(null, false, 'rajeshwar.sharma@tvscredit.com', 'Underwrite@2026');
                    }}
                    disabled={isLoading || isSuccess}
                    className="px-3.5 py-2 rounded-xl bg-[#7342E2] hover:bg-[#5B32E5] text-white text-xs font-extrabold transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
                  >
                    Open Dashboard ➔
                  </button>
                </div>
              </form>

              {/* Centered OR Divider */}
              <div className="flex items-center justify-center gap-3 my-5 w-full">
                <div className="flex-1 h-[1px] bg-[#d1d5db]" />
                <span className="text-[11px] font-bold text-[#5a5a5b] tracking-wider uppercase">OR</span>
                <div className="flex-1 h-[1px] bg-[#d1d5db]" />
              </div>

              {/* Sign in with Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignInClick}
                className="w-full h-[50px] rounded-full bg-white hover:bg-slate-50 active:translate-y-px border border-[#c8c8ca] text-[#232424] text-[15px] font-medium flex items-center justify-center gap-3 shadow-2xs transition-all cursor-pointer mb-6"
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>

              {/* Footer Switcher */}
              <p className="text-center text-[13.5px] text-[#0a0a0a]">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setErrorMessage(null);
                  }}
                  className="font-bold underline underline-offset-4 decoration-2 text-[#0a0a0a] hover:text-[#5B32E5] cursor-pointer"
                >
                  Start Free
                </button>
              </p>
            </div>
          ) : (
            /* ================= VIEW 2: CREATE ACCOUNT ================= */
            <div>
              <h1 className="text-[32px] font-bold text-[#2c3343] text-center tracking-tight leading-tight">
                Create Account
              </h1>
              <p className="text-[15px] text-[#797979] text-center mt-2 mb-6">
                <strong className="text-[#2c3343] font-bold">Sign up</strong> to access TVS Credit smart lending tools.
              </p>

              <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                <input
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="Full Name (e.g. Rajeshwar Sharma)"
                  className="w-full h-[50px] px-4 rounded-xl bg-[#fafafa] border border-[#acacae] text-[14.5px] text-[#1e293b] placeholder:text-[#797979] focus:outline-none focus:border-[#283139] focus:bg-white transition-all"
                />

                <input
                  type="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="Work Email (e.g. rajeshwar@tvscredit.com)"
                  className="w-full h-[50px] px-4 rounded-xl bg-[#fafafa] border border-[#acacae] text-[14.5px] text-[#1e293b] placeholder:text-[#797979] focus:outline-none focus:border-[#283139] focus:bg-white transition-all"
                />

                <input
                  type="tel"
                  required
                  value={signUpPhone}
                  onChange={(e) => setSignUpPhone(e.target.value)}
                  placeholder="Mobile Number (+91 98271 04421)"
                  className="w-full h-[50px] px-4 rounded-xl bg-[#fafafa] border border-[#acacae] text-[14.5px] text-[#1e293b] placeholder:text-[#797979] focus:outline-none focus:border-[#283139] focus:bg-white transition-all"
                />

                <input
                  type="password"
                  required
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="Password (minimum 6 characters)"
                  className="w-full h-[50px] px-4 rounded-xl bg-[#fafafa] border border-[#acacae] text-[14.5px] text-[#1e293b] placeholder:text-[#797979] focus:outline-none focus:border-[#283139] focus:bg-white transition-all"
                />

                <button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className="w-full h-[52px] rounded-full bg-[#283139] hover:bg-[#1e252c] active:translate-y-px text-white text-[15.5px] font-medium flex items-center justify-center gap-2 shadow-md shadow-[#283139]/20 transition-all cursor-pointer mt-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 size={18} className="text-emerald-400" />
                      <span>Account Created Successfully</span>
                    </>
                  ) : (
                    <>
                      <span>Create Free Account</span>
                      <svg className="w-4 h-4 ml-0.5" viewBox="0 0 22 22" fill="none">
                        <path
                          d="M3 11h15.4M11 3.3l7.7 7.7-7.7 7.7"
                          stroke="#ffffff"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-center gap-3 my-4 w-full">
                <div className="flex-1 h-[1px] bg-[#d1d5db]" />
                <span className="text-[11px] font-bold text-[#5a5a5b] tracking-wider uppercase">OR</span>
                <div className="flex-1 h-[1px] bg-[#d1d5db]" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignInClick}
                className="w-full h-[48px] rounded-full bg-white hover:bg-slate-50 active:translate-y-px border border-[#c8c8ca] text-[#232424] text-[14.5px] font-medium flex items-center justify-center gap-3 shadow-2xs transition-all cursor-pointer mb-5"
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>Sign up with Google</span>
              </button>

              <p className="text-center text-[13.5px] text-[#0a0a0a]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setErrorMessage(null);
                  }}
                  className="font-bold underline underline-offset-4 decoration-2 text-[#0a0a0a] hover:text-[#5B32E5] cursor-pointer"
                >
                  Log In
                </button>
              </p>
            </div>
          )}

          {/* Magic UI Border Beam */}
          <BorderBeam duration={8} size={240} borderWidth={3} colorFrom="#FF5722" colorTo="#7342E2" />
        </div>
      </div>

      {/* Google Account Chooser Modal */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[420px] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-7 h-7 flex-shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <div>
                  <h3 className="text-[17px] font-semibold text-slate-900 tracking-tight">Sign in with Google</h3>
                  <p className="text-xs text-slate-500">to continue to TVS Credit Decision Hub</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setIsGoogleModalOpen(false); setIsCustomGoogle(false); }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 pt-4 space-y-3">
              {!isCustomGoogle ? (
                <>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Choose an account</p>
                  
                  {/* Option 1: Current typed user */}
                  {(signInEmail || signUpEmail) && (
                    <button
                      type="button"
                      onClick={() => completeGoogleAuth((activeTab === 'signup' ? signUpName : '') || 'User', (activeTab === 'signup' ? signUpEmail : signInEmail))}
                      className="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 border border-slate-200 transition-all text-left group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-semibold flex items-center justify-center text-sm shadow-xs">
                        {(activeTab === 'signup' ? (signUpName[0] || signUpEmail[0] || 'U') : (signInEmail[0] || 'U')).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 group-hover:text-[#5B32E5] truncate">
                          {(activeTab === 'signup' ? signUpName : '') || 'Current Account'}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {activeTab === 'signup' ? signUpEmail : signInEmail}
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}

                  {/* Option 2: Default Google Account */}
                  <button
                    type="button"
                    onClick={() => completeGoogleAuth('Agri Partner', 'partner.agri@gmail.com')}
                    className="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 border border-slate-200 transition-all text-left group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#5B32E5] text-white font-semibold flex items-center justify-center text-sm shadow-xs">
                      A
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 group-hover:text-[#5B32E5] truncate">Agri Partner</div>
                      <div className="text-xs text-slate-500 truncate">partner.agri@gmail.com</div>
                    </div>
                    <svg className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Option 3: TVS Credit Corporate Account */}
                  <button
                    type="button"
                    onClick={() => completeGoogleAuth('TVS Credit User', 'credit.desk@tvscredit.com')}
                    className="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 border border-slate-200 transition-all text-left group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#10B981] text-white font-semibold flex items-center justify-center text-sm shadow-xs">
                      T
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 group-hover:text-[#5B32E5] truncate">TVS Credit Team</div>
                      <div className="text-xs text-slate-500 truncate">credit.desk@tvscredit.com</div>
                    </div>
                    <svg className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Option 4: Enter custom account */}
                  <button
                    type="button"
                    onClick={() => setIsCustomGoogle(true)}
                    className="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 border border-dashed border-slate-300 transition-all text-left group mt-2 cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 font-semibold flex items-center justify-center text-sm group-hover:bg-slate-200 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-700 group-hover:text-[#5B32E5]">Use another Google account</div>
                    </div>
                  </button>
                </>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (customGoogleEmail.trim()) {
                      completeGoogleAuth(customGoogleName.trim(), customGoogleEmail.trim());
                    }
                  }}
                  className="space-y-3 pt-1"
                >
                  <p className="text-xs text-slate-500 mb-2">Enter your Google Account email and name:</p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Kumar"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#5B32E5] focus:ring-1 focus:ring-[#5B32E5]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Google Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. alex.kumar@gmail.com"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#5B32E5] focus:ring-1 focus:ring-[#5B32E5]"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCustomGoogle(false)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      onClick={() => {
                        if (customGoogleEmail.trim()) {
                          completeGoogleAuth(customGoogleName.trim(), customGoogleEmail.trim());
                        }
                      }}
                      disabled={!customGoogleEmail.trim()}
                      className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-[#5B32E5] hover:bg-[#4722bb] disabled:opacity-50 rounded-lg transition-colors shadow-xs cursor-pointer"
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>English (United States)</span>
              <div className="flex gap-3">
                <span className="hover:underline cursor-pointer">Help</span>
                <span className="hover:underline cursor-pointer">Privacy</span>
                <span className="hover:underline cursor-pointer">Terms</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignInPage;
