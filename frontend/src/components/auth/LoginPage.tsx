import React, { useState } from 'react';
import {
  LogIn,
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  X,
  ShieldCheck,
  Building2,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onOpenLegal?: (type: 'terms' | 'privacy' | 'security' | 'cookies') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onOpenLegal }) => {
  const { login } = useAuth();

  // Sign In Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sign Up / Request Access Form State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupFeedback, setSignupFeedback] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Forgot Password Modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<string | null>(null);
  const [modalEmail, setModalEmail] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login(username.trim(), password.trim());
    } catch (err: any) {
      if (err.message && err.message.includes('429')) {
        setError('Rate limit exceeded. Please wait a moment before retrying.');
      } else if (err.message && (err.message.includes('401') || err.message.includes('Bad credentials'))) {
        setError('Invalid username or password. Please verify credentials.');
      } else if (err.message && err.message.includes('disabled')) {
        setError('Account has been deactivated. Please contact your FleetIQ Administrator.');
      } else {
        setError(err.message || 'Authentication service temporarily unavailable. Please retry.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setSignupFeedback('Please fill out all required fields.');
      return;
    }

    setIsSigningUp(true);
    setTimeout(() => {
      setIsSigningUp(false);
      setSignupFeedback(`Account request for ${signupName} submitted for administrator provisioning approval.`);
      setTimeout(() => {
        setSignupName('');
        setSignupEmail('');
        setSignupPassword('');
        setSignupFeedback(null);
      }, 4000);
    }, 600);
  };

  const fillCredential = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEmail.trim()) return;
    setModalFeedback(`Password reset instructions dispatched to ${modalEmail}.`);
    setTimeout(() => {
      setShowForgotModal(false);
      setModalFeedback(null);
      setModalEmail('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#f1f4f9] text-slate-800 flex flex-col justify-center items-center p-4 sm:p-8 relative overflow-hidden font-sans select-none">
      {/* Organic Royal Blue Fluid Blobs in Background */}
      {/* Top Left Organic Blob */}
      <svg
        className="absolute -top-16 -left-16 w-80 h-80 sm:w-[480px] sm:h-[480px] pointer-events-none z-0 text-[#4361ee]/90 drop-shadow-sm"
        viewBox="0 0 500 500"
        fill="currentColor"
      >
        <path d="M 0,0 L 420,0 C 390,140 430,280 320,380 C 230,460 90,390 0,440 Z" />
      </svg>

      {/* Top Right Accent Blob */}
      <svg
        className="absolute -top-10 right-1/4 w-48 h-48 sm:w-64 sm:h-64 pointer-events-none z-0 text-[#4361ee]/80"
        viewBox="0 0 200 200"
        fill="currentColor"
      >
        <circle cx="100" cy="50" r="80" />
      </svg>

      {/* Bottom Right Organic Blob */}
      <svg
        className="absolute -bottom-20 -right-20 w-80 h-80 sm:w-[500px] sm:h-[500px] pointer-events-none z-0 text-[#4361ee]/90 drop-shadow-sm"
        viewBox="0 0 500 500"
        fill="currentColor"
      >
        <path d="M 500,500 L 80,500 C 130,370 70,220 180,120 C 280,30 430,90 500,0 Z" />
      </svg>

      {/* Main Tablet / Frame Container */}
      <div className="w-full max-w-4xl bg-[#f8fafc] border-2 border-slate-700/80 rounded-[28px] sm:rounded-[36px] shadow-2xl p-6 sm:p-10 relative z-10 my-4 backdrop-blur-xs">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-normal text-slate-700 tracking-tight">
            Minimal login and signup forms
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            FleetIQ Enterprise Operations Portal • Multi-OEM Telemetry & Intelligence
          </p>
        </div>

        {/* Dual Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-3xl mx-auto">
          {/* Card 1: Welcome! Sign in to your account */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-all duration-200">
            <div>
              {/* Blue Top Arrow Icon */}
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#4361ee]">
                  <LogIn className="w-7 h-7 stroke-[2.2]" />
                </div>
              </div>

              {/* Headings */}
              <h2 className="text-xl font-bold text-slate-800 text-center">Welcome!</h2>
              <p className="text-xs text-slate-400 text-center mt-0.5 mb-6">Sign in to your account</p>

              {/* Error Alert */}
              {error && (
                <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-600 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-500 font-medium mb-1">Name</label>
                  <div className="relative border-b border-slate-200 focus-within:border-[#4361ee] transition">
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. admin or operator"
                      className="w-full py-1.5 pr-8 text-sm text-slate-800 bg-transparent outline-none placeholder-slate-300 font-sans"
                    />
                    <UserIcon className="w-4 h-4 text-slate-300 absolute right-1 top-2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 font-medium mb-1">Password</label>
                  <div className="relative border-b border-slate-200 focus-within:border-[#4361ee] transition">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full py-1.5 pr-8 text-sm text-slate-800 bg-transparent outline-none placeholder-slate-300 font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-1 top-2 text-slate-300 hover:text-slate-500 transition"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer hover:text-slate-600 transition">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-[#4361ee] border-slate-300 focus:ring-[#4361ee]"
                    />
                    <span>remember me?</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[#4361ee] hover:underline font-medium"
                  >
                    forgot password?
                  </button>
                </div>

                {/* Login Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-lg bg-[#4361ee] hover:bg-[#3b52d4] disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span>Login</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Demo Credentials Strip */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Quick Dev Credentials
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <button
                  type="button"
                  onClick={() => fillCredential('admin', 'Admin@FleetIQ2026')}
                  className="px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200/80 transition"
                >
                  <span className="text-[11px] font-bold text-slate-700 block">Admin</span>
                  <span className="text-[9px] text-[#4361ee] font-mono block">ROLE_ADMIN</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillCredential('operator', 'Operator@FleetIQ2026')}
                  className="px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200/80 transition"
                >
                  <span className="text-[11px] font-bold text-slate-700 block">Operator</span>
                  <span className="text-[9px] text-emerald-600 font-mono block">OPERATOR</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillCredential('viewer', 'Viewer@FleetIQ2026')}
                  className="px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 hover:border-amber-200 border border-slate-200/80 transition"
                >
                  <span className="text-[11px] font-bold text-slate-700 block">Viewer</span>
                  <span className="text-[9px] text-amber-600 font-mono block">VIEWER</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Create account! */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-all duration-200">
            <div>
              {/* Blue Top User Circle Icon */}
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#4361ee]">
                  <div className="w-8 h-8 rounded-full border-2 border-[#4361ee] flex items-center justify-center">
                    <UserIcon className="w-4 h-4 stroke-[2.4]" />
                  </div>
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-xl font-bold text-slate-800 text-center mb-6">Create account!</h2>

              {/* Feedback alert */}
              {signupFeedback && (
                <div className="mb-4 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{signupFeedback}</span>
                </div>
              )}

              {/* Signup Form */}
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-500 font-medium mb-1">Name</label>
                  <div className="relative border-b border-slate-200 focus-within:border-[#4361ee] transition">
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full py-1.5 pr-8 text-sm text-slate-800 bg-transparent outline-none placeholder-slate-300 font-sans"
                    />
                    <UserIcon className="w-4 h-4 text-slate-300 absolute right-1 top-2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 font-medium mb-1">E-mail</label>
                  <div className="relative border-b border-slate-200 focus-within:border-[#4361ee] transition">
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="corporate@domain.com"
                      className="w-full py-1.5 pr-8 text-sm text-slate-800 bg-transparent outline-none placeholder-slate-300 font-sans"
                    />
                    <Mail className="w-4 h-4 text-slate-300 absolute right-1 top-2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 font-medium mb-1">Password</label>
                  <div className="relative border-b border-slate-200 focus-within:border-[#4361ee] transition">
                    <input
                      type="password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full py-1.5 pr-8 text-sm text-slate-800 bg-transparent outline-none placeholder-slate-300 font-sans"
                    />
                    <Lock className="w-4 h-4 text-slate-300 absolute right-1 top-2" />
                  </div>
                </div>

                {/* Create Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSigningUp}
                    className="px-6 py-2 rounded-lg bg-[#4361ee] hover:bg-[#3b52d4] disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition active:scale-95"
                  >
                    {isSigningUp ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Create</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Social / SSO Section */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-400 block mb-2">
                Or create account using enterprise SSO:
              </span>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSignupFeedback('Corporate SAML / Okta SSO flow initialized.');
                    setTimeout(() => setSignupFeedback(null), 3000);
                  }}
                  className="w-8 h-8 rounded-full border border-slate-200 hover:border-[#4361ee] flex items-center justify-center text-slate-500 hover:text-[#4361ee] transition bg-white"
                  title="Okta Enterprise SSO"
                >
                  <Building2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSignupFeedback('Azure AD / Microsoft Entra SSO flow initialized.');
                    setTimeout(() => setSignupFeedback(null), 3000);
                  }}
                  className="w-8 h-8 rounded-full border border-slate-200 hover:border-[#4361ee] flex items-center justify-center text-slate-500 hover:text-[#4361ee] transition bg-white"
                  title="Azure AD / Entra ID"
                >
                  <ShieldCheck className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSignupFeedback('Google Workspace SSO flow initialized.');
                    setTimeout(() => setSignupFeedback(null), 3000);
                  }}
                  className="w-8 h-8 rounded-full border border-slate-200 hover:border-[#4361ee] flex items-center justify-center text-slate-500 hover:text-[#4361ee] transition bg-white"
                  title="Google Workspace"
                >
                  <Globe className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>© 2026 Minimal Forms. All rights reserved | FleetIQ Technologies Inc.</p>
          <div className="flex items-center justify-center gap-3 mt-1.5 text-[11px] text-slate-400">
            <button onClick={() => onOpenLegal && onOpenLegal('terms')} className="hover:text-slate-600">
              Terms of Service
            </button>
            <span>•</span>
            <button onClick={() => onOpenLegal && onOpenLegal('privacy')} className="hover:text-slate-600">
              Privacy Policy
            </button>
            <span>•</span>
            <button onClick={() => onOpenLegal && onOpenLegal('security')} className="hover:text-slate-600">
              Security Compliance
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Reset Account Password</h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {modalFeedback ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{modalFeedback}</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <p className="text-xs text-slate-500">
                  Enter your registered corporate email to receive a password reset authorization link.
                </p>
                <div className="border-b border-slate-200 focus-within:border-[#4361ee] transition">
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={modalEmail}
                    onChange={(e) => setModalEmail(e.target.value)}
                    className="w-full py-1.5 text-xs text-slate-800 bg-transparent outline-none placeholder-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-lg bg-[#4361ee] hover:bg-[#3b52d4] text-white text-xs font-semibold transition"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
