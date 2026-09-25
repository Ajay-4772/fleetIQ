import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Mail,
  User as UserIcon,
  UserCheck,
  Building,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onOpenLegal?: (type: 'terms' | 'privacy' | 'security' | 'cookies') => void;
}

type AuthView = 'login' | 'register' | 'forgot' | 'reset';

export const LoginPage: React.FC<LoginPageProps> = ({ onOpenLegal }) => {
  const { login, register, forgotPassword, resetPassword, error: authError, clearError } = useAuth();

  const [activeView, setActiveView] = useState<AuthView>('login');

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginNotice, setLoginNotice] = useState<string | null>(null);

  // Register Form State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regOrganization, setRegOrganization] = useState('');
  const [regTermsAccepted, setRegTermsAccepted] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  // Reset Password State
  const [resetToken, setResetToken] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Submitting indicator
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clean error messages by stripping raw API prefixes
  const sanitizeErrorMessage = (raw: string | null): string => {
    if (!raw) return '';
    let cleaned = raw.replace(/^API error \d+:\s*/i, '').trim();
    if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
      try {
        const parsed = JSON.parse(cleaned);
        cleaned = parsed.message || parsed.error || cleaned;
      } catch {
        // ignore JSON parse error
      }
    }
    return cleaned;
  };

  // Check URL parameters for reset token on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    const resetParam = params.get('reset');
    if (tokenParam || resetParam === 'true') {
      if (tokenParam) setResetToken(tokenParam);
      setActiveView('reset');
    }
  }, []);

  const switchView = (view: AuthView) => {
    clearError();
    setLoginError(null);
    setRegError(null);
    setForgotError(null);
    setResetError(null);
    setForgotSuccess(null);
    setResetSuccess(null);
    setActiveView(view);
  };

  // Switch to login view with pre-filled identifier and informative banner
  const handleExistingUserSignIn = (identifier: string) => {
    setLoginIdentifier(identifier);
    switchView('login');
    setLoginNotice(`An account for ${identifier} is already registered. Please sign in below.`);
  };

  // 1. Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginNotice(null);
    clearError();

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setLoginError('Please enter your corporate identifier and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(loginIdentifier.trim(), loginPassword);
    } catch (err: any) {
      setLoginError(sanitizeErrorMessage(err.message) || 'Invalid corporate credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Handle Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    clearError();

    if (!regFullName.trim() || !regEmail.trim() || !regUsername.trim() || !regPassword) {
      setRegError('Please complete all required fields.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }

    if (regPassword.length < 8) {
      setRegError('Password must be at least 8 characters long.');
      return;
    }

    if (!regTermsAccepted) {
      setRegError('You must agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        username: regUsername.trim(),
        password: regPassword,
        organization: regOrganization.trim() || undefined,
        termsAccepted: regTermsAccepted
      });
    } catch (err: any) {
      const msg = sanitizeErrorMessage(err.message) || 'Registration failed.';
      setRegError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Handle Forgot Password
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    clearError();

    if (!forgotEmail.trim()) {
      setForgotError('Please provide your corporate email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await forgotPassword(forgotEmail.trim());
      setForgotSuccess(res.message || 'Instructions have been dispatched to your email.');
    } catch (err: any) {
      setForgotError(sanitizeErrorMessage(err.message) || 'Failed to submit reset request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Handle Reset Password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    clearError();

    if (!resetToken.trim() || !resetNewPassword || !resetConfirmPassword) {
      setResetError('Please complete all reset fields.');
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('New passwords do not match.');
      return;
    }

    if (resetNewPassword.length < 8) {
      setResetError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword({
        token: resetToken.trim(),
        newPassword: resetNewPassword,
        confirmPassword: resetConfirmPassword
      });
      setResetSuccess(res.message || 'Password successfully updated.');
      setTimeout(() => {
        switchView('login');
      }, 2500);
    } catch (err: any) {
      setResetError(sanitizeErrorMessage(err.message) || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if the registration error is an "account/email/username already registered" condition
  const isAlreadyRegisteredError = Boolean(
    regError &&
      (regError.toLowerCase().includes('already registered') ||
        regError.toLowerCase().includes('already exists') ||
        regError.toLowerCase().includes('duplicate') ||
        regError.toLowerCase().includes('in use'))
  );

  const displayLoginError =
    loginError ||
    (activeView === 'login' &&
    authError &&
    !authError.toLowerCase().includes('already registered') &&
    !authError.toLowerCase().includes('already exists')
      ? sanitizeErrorMessage(authError)
      : null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-slate-50 to-slate-100/80 text-slate-900 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white relative">
      {/* Top Corporate Header */}
      <header className="px-6 sm:px-12 py-4 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
            <Shield className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">FleetIQ</span>
            <span className="text-[11px] font-semibold text-slate-500 ml-2.5 hidden sm:inline">
              Connected Vehicle Intelligence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
          <span>Operations Center</span>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 space-y-6 animate-view-transition">
          {/* Header Title Section */}
          <div className="space-y-1.5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-3 text-blue-600 shadow-2xs transition-transform duration-300 hover:scale-105">
              {activeView === 'login' && <UserIcon className="w-6 h-6" />}
              {activeView === 'register' && <Building className="w-6 h-6" />}
              {activeView === 'forgot' && <Mail className="w-6 h-6" />}
              {activeView === 'reset' && <KeyRound className="w-6 h-6" />}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              {activeView === 'login' && 'Sign in to FleetIQ'}
              {activeView === 'register' && 'Request Enterprise Access'}
              {activeView === 'forgot' && 'Reset Account Password'}
              {activeView === 'reset' && 'Set New Password'}
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              {activeView === 'login' && 'Enter your credentials to access telematics streams and fleet operations.'}
              {activeView === 'register' && 'Register your corporate profile for multi-OEM telemetry authorization.'}
              {activeView === 'forgot' && 'Enter your corporate email to receive a secure authorization reset token.'}
              {activeView === 'reset' && 'Provide your authorization token and configure a new security password.'}
            </p>
          </div>

          {/* VIEW 1: SIGN IN */}
          {activeView === 'login' && (
            <div key="login-view" className="animate-view-transition space-y-4">
              {/* Friendly Welcome Back Notice */}
              {loginNotice && (
                <div
                  role="status"
                  className="animate-slide-down p-3.5 rounded-xl bg-blue-50/90 border border-blue-200 text-xs text-blue-900 flex items-start justify-between gap-2.5 shadow-2xs"
                >
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">Welcome Back</span>
                      <span className="text-[11px] text-blue-700 leading-tight">{loginNotice}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLoginNotice(null)}
                    className="text-blue-400 hover:text-blue-700 text-sm font-bold leading-none p-1 cursor-pointer"
                    aria-label="Dismiss notice"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Login Error Alert */}
              {displayLoginError && (
                <div
                  role="alert"
                  className="animate-slide-down animate-gentle-shake p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 shadow-2xs"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="leading-snug font-medium">{displayLoginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label htmlFor="login-username" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Corporate Email or Username
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" aria-hidden="true" />
                    <input
                      id="login-username"
                      name="username"
                      type="text"
                      required
                      autoComplete="username"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. admin@fleetiq.internal or dispatcher_dave"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 text-xs text-slate-900 placeholder-slate-400 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="login-password" className="text-xs font-semibold text-slate-700">
                      Security Password
                    </label>
                    <button
                      type="button"
                      onClick={() => switchView('forgot')}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold transition hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" aria-hidden="true" />
                    <input
                      id="login-password"
                      name="password"
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 text-xs text-slate-900 placeholder-slate-400 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 transition p-0.5 cursor-pointer"
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5 text-xs text-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-white border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                    />
                    <span>Keep session active</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-bold transition-all duration-150 flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </>
                  )}
                </button>

                <div className="pt-4 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-500">
                    Need platform access?{' '}
                    <button
                      type="button"
                      onClick={() => switchView('register')}
                      className="text-blue-600 hover:text-blue-700 font-semibold transition hover:underline cursor-pointer"
                    >
                      Request an account
                    </button>
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* VIEW 2: REGISTER */}
          {activeView === 'register' && (
            <div key="register-view" className="animate-view-transition space-y-4">
              {/* REAL-TIME APP STYLE: Account Already Exists Banner */}
              {isAlreadyRegisteredError ? (
                <div
                  role="alert"
                  className="animate-slide-down animate-gentle-shake p-4 rounded-xl bg-blue-50/90 border border-blue-200/90 shadow-sm space-y-2.5"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <UserCheck className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-slate-900 text-xs">Account Already Exists</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        An account with{' '}
                        <strong className="text-blue-900 font-semibold">{regEmail || regUsername}</strong> is already
                        registered in FleetIQ.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 pl-8">
                    <button
                      type="button"
                      onClick={() => handleExistingUserSignIn(regEmail || regUsername)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-2xs cursor-pointer"
                    >
                      <span>Sign In Instead</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(regEmail);
                        switchView('forgot');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200 transition cursor-pointer"
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              ) : regError ? (
                <div
                  role="alert"
                  className="animate-slide-down animate-gentle-shake p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 shadow-2xs"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="leading-snug font-medium">{regError}</span>
                </div>
              ) : null}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label htmlFor="reg-fullname" className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      id="reg-fullname"
                      type="text"
                      required
                      autoComplete="name"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 text-xs text-slate-900 placeholder-slate-400 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="reg-email" className="text-xs font-semibold text-slate-700">
                      Corporate Email
                    </label>
                    {isAlreadyRegisteredError && (
                      <span className="text-[10px] font-bold text-rose-600">Already Registered</span>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      id="reg-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        if (regError) setRegError(null);
                      }}
                      placeholder="jane.doe@enterprise.com"
                      className={`w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50/80 border text-xs text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none ${
                        isAlreadyRegisteredError
                          ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/10'
                          : 'border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10'
                      }`}
                    />
                  </div>
                  {isAlreadyRegisteredError && (
                    <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1 animate-slide-down">
                      <span>An account exists with this email.</span>
                      <button
                        type="button"
                        onClick={() => handleExistingUserSignIn(regEmail)}
                        className="text-blue-600 hover:underline font-semibold cursor-pointer"
                      >
                        Sign in instead →
                      </button>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="reg-username" className="block text-xs font-semibold text-slate-700 mb-1">
                      Username
                    </label>
                    <input
                      id="reg-username"
                      type="text"
                      required
                      autoComplete="username"
                      value={regUsername}
                      onChange={(e) => {
                        setRegUsername(e.target.value);
                        if (regError) setRegError(null);
                      }}
                      placeholder="jdoe_ops"
                      className={`w-full px-3 py-2 rounded-xl bg-slate-50/80 border text-xs text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none ${
                        isAlreadyRegisteredError && regUsername === regEmail
                          ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/10'
                          : 'border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10'
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-org" className="block text-xs font-semibold text-slate-700 mb-1">
                      Organization
                    </label>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        id="reg-org"
                        type="text"
                        value={regOrganization}
                        onChange={(e) => setRegOrganization(e.target.value)}
                        placeholder="Fleet Logistics Inc"
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 text-xs text-slate-900 placeholder-slate-400 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      id="reg-password"
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 8 chars, 1 uppercase, 1 digit, 1 symbol"
                      className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 text-xs text-slate-900 placeholder-slate-400 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-confirm-password" className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="reg-confirm-password"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat security password"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 text-xs text-slate-900 placeholder-slate-400 transition-all duration-200"
                  />
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2 text-[11px] text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={regTermsAccepted}
                      onChange={(e) => setRegTermsAccepted(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded bg-white border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                    />
                    <span>
                      I accept the{' '}
                      <button
                        type="button"
                        onClick={() => onOpenLegal && onOpenLegal('terms')}
                        className="text-blue-600 hover:underline font-semibold cursor-pointer"
                      >
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button
                        type="button"
                        onClick={() => onOpenLegal && onOpenLegal('privacy')}
                        className="text-blue-600 hover:underline font-semibold cursor-pointer"
                      >
                        Privacy Policy
                      </button>
                      .
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-bold transition-all duration-150 flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Provisioning Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Registration</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <div className="pt-3 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-500">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => switchView('login')}
                      className="text-blue-600 hover:text-blue-700 font-semibold transition hover:underline cursor-pointer"
                    >
                      Return to Sign In
                    </button>
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* VIEW 3: FORGOT PASSWORD */}
          {activeView === 'forgot' && (
            <div key="forgot-view" className="animate-view-transition space-y-4">
              {forgotSuccess ? (
                <div className="animate-slide-down p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-emerald-900">Instructions Dispatched</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">{forgotSuccess}</p>
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => switchView('reset')}
                      className="text-blue-600 hover:underline text-xs font-semibold cursor-pointer"
                    >
                      I have a reset token &rarr;
                    </button>
                    <button
                      type="button"
                      onClick={() => switchView('login')}
                      className="text-slate-500 hover:text-slate-800 text-xs font-medium cursor-pointer"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  {forgotError && (
                    <div
                      role="alert"
                      className="animate-slide-down animate-gentle-shake p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 shadow-2xs"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span className="leading-snug font-medium">{forgotError}</span>
                    </div>
                  )}

                  <div>
                    <label htmlFor="forgot-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Corporate Registered Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        id="forgot-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="e.g. operator@fleetiq.internal"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 text-xs text-slate-900 placeholder-slate-400 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-bold transition-all duration-150 flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing Request...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Reset Instructions</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <button
                      type="button"
                      onClick={() => switchView('login')}
                      className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-medium transition cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => switchView('reset')}
                      className="text-blue-600 hover:text-blue-700 font-semibold hover:underline cursor-pointer"
                    >
                      Already have a token?
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* VIEW 4: RESET PASSWORD */}
          {activeView === 'reset' && (
            <div key="reset-view" className="animate-view-transition space-y-4">
              {resetSuccess ? (
                <div className="animate-slide-down p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-emerald-900">Password Updated</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">{resetSuccess}</p>
                  <p className="text-[11px] text-slate-500 pt-1">Redirecting to sign-in portal...</p>
                </div>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  {resetError && (
                    <div
                      role="alert"
                      className="animate-slide-down animate-gentle-shake p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 shadow-2xs"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span className="leading-snug font-medium">{resetError}</span>
                    </div>
                  )}

                  <div>
                    <label htmlFor="reset-token" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Password Reset Token
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        id="reset-token"
                        type="text"
                        required
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        placeholder="Paste single-use token"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 font-mono text-xs text-slate-900 placeholder-slate-400 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reset-new-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        id="reset-new-password"
                        type={showResetPassword ? 'text' : 'password'}
                        required
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        placeholder="Min 8 chars, 1 uppercase, 1 digit, 1 symbol"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 text-xs text-slate-900 placeholder-slate-400 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPassword(!showResetPassword)}
                        className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      >
                        {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reset-confirm-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      id="reset-confirm-password"
                      type="password"
                      required
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 text-xs text-slate-900 placeholder-slate-400 transition-all duration-200"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-bold transition-all duration-150 flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Update Security Password</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => switchView('login')}
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium transition hover:underline cursor-pointer"
                    >
                      Return to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Corporate Compliance & Legal Footer */}
      <footer className="px-6 sm:px-12 py-4 border-t border-slate-200/80 bg-white/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shadow-2xs">
        <div>
          <span>© 2026 FleetIQ Technologies Inc. Multi-OEM Telematics & Fleet Intelligence.</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onOpenLegal && onOpenLegal('terms')}
            className="hover:text-blue-600 font-medium transition cursor-pointer"
          >
            Terms of Service
          </button>
          <span>•</span>
          <button
            onClick={() => onOpenLegal && onOpenLegal('privacy')}
            className="hover:text-blue-600 font-medium transition cursor-pointer"
          >
            Privacy Policy
          </button>
          <span>•</span>
          <button
            onClick={() => onOpenLegal && onOpenLegal('security')}
            className="hover:text-blue-600 font-medium transition cursor-pointer"
          >
            Security Compliance
          </button>
        </div>
      </footer>
    </div>
  );
};
