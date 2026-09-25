import React from 'react';
import { Shield, FileText, AlertTriangle, X } from 'lucide-react';

interface LegalModalProps {
  type: 'terms' | 'privacy' | 'security' | 'cookies' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                {type === 'terms' && 'FleetIQ Terms and Conditions of Service'}
                {type === 'privacy' && 'FleetIQ Enterprise Data Privacy Policy'}
                {type === 'security' && 'Security Architecture & Vulnerability Reporting'}
                {type === 'cookies' && 'FleetIQ Cookie & Session Policy'}
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">Document Version: 2026.1-STABLE</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer Alert */}
        <div className="p-3.5 bg-amber-50 border-b border-amber-200/70 text-xs text-amber-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-semibold">
            LEGAL REVIEW REQUIRED — This is an enterprise product template pending final corporate legal and compliance sign-off.
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto text-xs text-slate-700 space-y-4 leading-relaxed">
          {type === 'terms' && (
            <>
              <h4 className="font-bold text-slate-900 text-sm">1. Acceptance of Service Terms</h4>
              <p>
                By accessing FleetIQ Operations Platform, authorized corporate entities agree to govern telematics data ingestion, automated decision pipelines, and fleet dispatch actions in compliance with applicable jurisdictional transport regulations.
              </p>
              <h4 className="font-bold text-slate-900 text-sm">2. Multi-OEM Telematics Usage</h4>
              <p>
                FleetIQ processes connected vehicle signals from supported OEMs (Toyota, Ford, BMW, Tesla). Operational dispatch recommendations produced by the deterministic engine or AI Copilot are advisory and subject to human operator oversight.
              </p>
              <h4 className="font-bold text-slate-900 text-sm">3. Acceptable Use & RBAC Credentials</h4>
              <p>
                Authorized personnel must maintain confidentiality of issued credentials. Credential sharing, unauthorized automated scraping, or attempts to bypass backend rate-limiting will trigger security audit log alarms.
              </p>
            </>
          )}

          {type === 'privacy' && (
            <>
              <h4 className="font-bold text-slate-900 text-sm">1. Data Ingestion & Storage</h4>
              <p>
                FleetIQ collects Vehicle Identification Numbers (VIN), sensor telemetry (battery state of charge, odometer, speed, engine temperature), and Diagnostic Trouble Codes (DTC). No passenger Personally Identifiable Information (PII) is captured.
              </p>
              <h4 className="font-bold text-slate-900 text-sm">2. AI Copilot Data Boundary</h4>
              <p>
                Copilot queries and chat sessions are stored in customer-isolated databases. User queries are evaluated against deterministic rules and grounded OEM technical specifications. Data is not shared across multi-tenant boundaries.
              </p>
              <h4 className="font-bold text-slate-900 text-sm">3. Audit Trail Retention</h4>
              <p>
                User logins, role modifications, and vehicle action status updates are retained in append-only audit tables for enterprise compliance and compliance auditing.
              </p>
            </>
          )}

          {type === 'security' && (
            <>
              <h4 className="font-bold text-slate-900 text-sm">1. Enterprise Security Baseline</h4>
              <p>
                FleetIQ enforces Spring Security JWT stateless authentication, server-side RBAC authorization, per-IP rate-limiting filters (429 Too Many Requests), and Flyway schema governance.
              </p>
              <h4 className="font-bold text-slate-900 text-sm">2. Vulnerability Disclosure</h4>
              <p>
                Security researchers and corporate partners should report potential findings directly to the designated security team: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-900">security@fleetiq.internal</code>.
              </p>
            </>
          )}

          {type === 'cookies' && (
            <>
              <h4 className="font-bold text-slate-900 text-sm">1. Session Tokens</h4>
              <p>
                FleetIQ uses local storage and HTTP headers exclusively for stateless JWT bearer authorization tokens. No cross-site advertising or third-party behavioral trackers are utilized.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
