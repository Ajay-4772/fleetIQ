import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Mail,
  User as UserIcon,
  Building,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowLeft
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

  // Register Form State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regOrganization, setRegOrganization] = useState('');
  const [regTermsAccepted, setRegTermsAccepted] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  // Reset Password State
  const [resetToken, setResetToken] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Local Form Error & Loading States
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setFormError(null);
    setForgotSuccess(null);
    setResetSuccess(null);
    setActiveView(view);
  };

  // 1. Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setFormError('Please enter your corporate identifier and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(loginIdentifier.trim(), loginPassword);
    } catch {
      // AuthContext handles error state
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Handle Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!regFullName.trim() || !regEmail.trim() || !regUsername.trim() || !regPassword) {
      setFormError('Please complete all required fields.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (regPassword.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    if (!regTermsAccepted) {
      setFormError('You must agree to the Terms of Service and Privacy Policy to continue.');
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
      setFormError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Handle Forgot Password
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!forgotEmail.trim()) {
      setFormError('Please provide your corporate email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await forgotPassword(forgotEmail.trim());
      setForgotSuccess(res.message || 'Instructions have been dispatched to your email.');
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit reset request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Handle Reset Password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!resetToken.trim() || !resetNewPassword || !resetConfirmPassword) {
      setFormError('Please complete all reset fields.');
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setFormError('New passwords do not match.');
      return;
    }

    if (resetNewPassword.length < 8) {
      setFormError('Password must be at least 8 characters long.');
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
      setFormError(err.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = formError || authError;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-slate-50 to-slate-100/80 text-slate-900 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white relative">
      {/* Top Corporate Header */}
      <header className="px-6 sm:px-12 py-4 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <Shield className="w-4 h-4 text-white" aria-hidden="true" />
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
        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 space-y-6">
          {/* Header Title Section */}
          <div className="space-y-1.5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-3 text-blue-600 shadow-2xs">
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

          {/* Unified Error Alert Banner */}
          {displayError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 shadow-2xs"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span className="leading-snug font-medium">{displayError}</span>
            </div>
          )}

          {/* VIEW 1: SIGN IN */}
          {activeView === 'login' && (
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 text-xs text-slate-900 placeholder-slate-400 transition"
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
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold transition"
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
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 text-xs text-slate-900 placeholder-slate-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 transition p-0.5"
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
                    className="w-4 h-4 rounded bg-white border-slate-300 text-blue-600 focus:ring-blue-500/20"
                  />
                  <span>Keep session active</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
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
                    className="text-blue-600 hover:text-blue-700 font-semibold transition hover:underline"
                  >
                    Request an account
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* VIEW 2: REGISTER */}
          {activeView === 'register' && (
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
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 text-xs text-slate-900 placeholder-slate-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 mb-1">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="jane.doe@enterprise.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 text-xs text-slate-900 placeholder-slate-400"
                  />
                </div>
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
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="jdoe_ops"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 text-xs text-slate-900 placeholder-slate-400"
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
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 text-xs text-slate-900 placeholder-slate-400"
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
                    className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 text-xs text-slate-900 placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 p-0.5"
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 text-xs text-slate-900 placeholder-slate-400"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 text-[11px] text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={regTermsAccepted}
                    onChange={(e) => setRegTermsAccepted(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded bg-white border-slate-300 text-blue-600 focus:ring-blue-500/20"
                  />
                  <span>
                    I accept the{' '}
                    <button
                      type="button"
                      onClick={() => onOpenLegal && onOpenLegal('terms')}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={() => onOpenLegal && onOpenLegal('privacy')}
                      className="text-blue-600 hover:underline font-semibold"
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
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer mt-2"
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
                    className="text-blue-600 hover:text-blue-700 font-semibold transition hover:underline"
                  >
                    Return to Sign In
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* VIEW 3: FORGOT PASSWORD */}
          {activeView === 'forgot' && (
            <div className="space-y-4">
              {forgotSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-emerald-900">Instructions Dispatched</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">{forgotSuccess}</p>
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => switchView('reset')}
                      className="text-blue-600 hover:underline text-xs font-semibold"
                    >
                      I have a reset token &rarr;
                    </button>
                    <button
                      type="button"
                      onClick={() => switchView('login')}
                      className="text-slate-500 hover:text-slate-800 text-xs font-medium"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
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
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 text-xs text-slate-900 placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
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
                      className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-medium transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => switchView('reset')}
                      className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
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
            <div className="space-y-4">
              {resetSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-emerald-900">Password Updated</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">{resetSuccess}</p>
                  <p className="text-[11px] text-slate-500 pt-1">Redirecting to sign-in portal...</p>
                </div>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
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
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 font-mono text-xs text-slate-900 placeholder-slate-400"
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
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 text-xs text-slate-900 placeholder-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPassword(!showResetPassword)}
                        className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 text-xs text-slate-900 placeholder-slate-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
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
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium transition hover:underline"
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
