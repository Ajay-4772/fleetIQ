import React from 'react';
import { X, Zap } from 'lucide-react';
import { SimulatorControlPanel } from '../simulator/SimulatorControlPanel';

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScenarioExecuted: () => void;
}

export const SimulatorModal: React.FC<SimulatorModalProps> = ({
  isOpen,
  onClose,
  onScenarioExecuted
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center shadow-2xs">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Multi-OEM Scenario Simulator Tool</h3>
              <p className="text-[11px] text-slate-400 font-medium">Inject synthetic telematics events through production ingestion pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Simulator Control Panel Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <SimulatorControlPanel onScenarioExecuted={onScenarioExecuted} />
        </div>
      </div>
    </div>
  );
};
