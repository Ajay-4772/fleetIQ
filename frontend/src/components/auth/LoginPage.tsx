import React, { useState } from 'react';
import { Shield, Lock, User as UserIcon, ArrowRight, AlertCircle, CheckCircle2, HelpCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onOpenLegal?: (type: 'terms' | 'privacy' | 'security' | 'cookies') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onOpenLegal }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Self-Service Modals
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<string | null>(null);
  const [modalEmail, setModalEmail] = useState('');
  const [modalName, setModalName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
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

  const fillCredential = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEmail.trim()) return;
    setModalFeedback(`Password reset instructions dispatched to ${modalEmail}. Please check your corporate inbox.`);
    setTimeout(() => {
      setShowForgotModal(false);
      setModalFeedback(null);
      setModalEmail('');
    }, 3000);
  };

  const handleRequestAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEmail.trim() || !modalName.trim()) return;
    setModalFeedback(`Access request for ${modalName} has been forwarded to the Platform Administrator for review.`);
    setTimeout(() => {
      setShowRequestModal(false);
      setModalFeedback(null);
      setModalEmail('');
      setModalName('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
            <Shield className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white">FleetIQ</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 ml-2">
              Operations Center
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true"></span>
          <span>Platform Operational</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-950/80 border border-slate-800/90 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Operations Portal Login</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Authenticate with your corporate credentials to access multi-OEM telemetry streams, fleet decisions, and intelligence copilot.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username / Identifier
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" aria-hidden="true" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin or operator"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs text-white placeholder-slate-500 transition font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" aria-hidden="true" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs text-white placeholder-slate-500 transition font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-blue-400 hover:text-blue-300 transition font-medium"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => setShowRequestModal(true)}
                className="text-slate-400 hover:text-slate-200 transition font-medium"
              >
                Request access
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <span>Sign In to FleetIQ</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          {/* Development Seed Accounts Helper */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Pre-Configured Environments (Development)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredential('admin', 'Admin@FleetIQ2026')}
                className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 text-left transition"
              >
                <div className="text-[11px] font-bold text-slate-200">Admin</div>
                <div className="text-[9px] text-blue-400 font-mono">ROLE_ADMIN</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredential('operator', 'Operator@FleetIQ2026')}
                className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 text-left transition"
              >
                <div className="text-[11px] font-bold text-slate-200">Operator</div>
                <div className="text-[9px] text-emerald-400 font-mono">OPERATOR</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredential('viewer', 'Viewer@FleetIQ2026')}
                className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 text-left transition"
              >
                <div className="text-[11px] font-bold text-slate-200">Viewer</div>
                <div className="text-[9px] text-amber-400 font-mono">VIEWER</div>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Reset Account Password</h3>
              <button onClick={() => setShowForgotModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            {modalFeedback ? (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{modalFeedback}</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <p className="text-xs text-slate-400">
                  Enter your registered corporate email to receive a password reset authorization link.
                </p>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Request Access Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Request Platform Access</h3>
              <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            {modalFeedback ? (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{modalFeedback}</span>
              </div>
            ) : (
              <form onSubmit={handleRequestAccess} className="space-y-3">
                <p className="text-xs text-slate-400">
                  Submit your details to request role-based access to the FleetIQ operations console.
                </p>
                <input
                  type="text"
                  required
                  placeholder="Full Legal Name"
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="email"
                  required
                  placeholder="Corporate Email"
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
                >
                  Submit Access Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer & Compliance Links */}
      <footer className="px-8 py-4 border-t border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          <span>© 2026 FleetIQ Technologies Inc. Authoritative Multi-OEM Fleet Intelligence.</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onOpenLegal && onOpenLegal('terms')}
            className="hover:text-slate-300 transition"
          >
            Terms of Service
          </button>
          <span>•</span>
          <button
            onClick={() => onOpenLegal && onOpenLegal('privacy')}
            className="hover:text-slate-300 transition"
          >
            Privacy Policy
          </button>
          <span>•</span>
          <button
            onClick={() => onOpenLegal && onOpenLegal('security')}
            className="hover:text-slate-300 transition"
          >
            Security Compliance
          </button>
        </div>
      </footer>
    </div>
  );
};
