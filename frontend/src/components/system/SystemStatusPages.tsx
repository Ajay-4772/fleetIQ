import React from 'react';
import { AlertTriangle, ShieldAlert, ServerCrash, Wrench, ArrowLeft, RefreshCw, Home } from 'lucide-react';

interface ErrorViewProps {
  onReturnHome: () => void;
  onRetry?: () => void;
  requestId?: string;
}

export const NotFoundPage: React.FC<ErrorViewProps> = ({ onReturnHome }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center mx-auto shadow-2xs">
          <AlertTriangle className="w-7 h-7 text-amber-500" />
        </div>
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Error 404</span>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Resource Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            The requested fleet asset, navigation route, or telematics report does not exist or has been relocated.
          </p>
        </div>
        <button
          onClick={onReturnHome}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs"
        >
          <Home className="w-4 h-4" />
          <span>Return to Fleet Overview</span>
        </button>
      </div>
    </div>
  );
};

export const AccessDeniedPage: React.FC<ErrorViewProps & { is401?: boolean }> = ({
  onReturnHome,
  is401 = false
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 font-mono">
            {is401 ? 'Error 401 — Unauthorized' : 'Error 403 — Access Denied'}
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {is401 ? 'Authentication Required' : 'Elevated Permissions Required'}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            {is401
              ? 'Your active session has expired or requires valid enterprise credentials to proceed.'
              : 'Your assigned security role lacks authorization for this administrative domain. Contact your FleetIQ Administrator.'}
          </p>
        </div>
        <button
          onClick={onReturnHome}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export const ServerErrorPage: React.FC<ErrorViewProps> = ({ onReturnHome, onRetry, requestId }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
          <ServerCrash className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 font-mono">Error 500</span>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Internal Platform Error</h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            An unexpected error occurred while executing backend processing. The incident has been recorded in the platform audit log.
          </p>
          {requestId && (
            <div className="text-[10px] font-mono text-slate-400 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
              Correlation ID: {requestId}
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          )}
          <button
            onClick={onReturnHome}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const MaintenancePage: React.FC<ErrorViewProps> = ({ onRetry }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
          <Wrench className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 font-mono">Status 503</span>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">System Under Maintenance</h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            FleetIQ telematics database migrations and infrastructure upgrades are currently in progress. Multi-OEM ingestion streams will resume shortly.
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Check Platform Status</span>
          </button>
        )}
      </div>
    </div>
  );
};
