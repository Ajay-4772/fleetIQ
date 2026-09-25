import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, Database, BookOpen, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AssistantResponse } from '../../types';
import { api } from '../../services/api';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onSelectVehicle?: (vehicleId: string) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  initialQuery,
  onSelectVehicle
}) => {
  const [query, setQuery] = useState(initialQuery || '');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialQuery && isOpen) {
      setQuery(initialQuery);
      handleAsk(initialQuery);
    }
  }, [initialQuery, isOpen]);

  if (!isOpen) return null;

  const handleAsk = async (textToAsk: string) => {
    if (!textToAsk.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.queryAssistant(textToAsk.trim());
      setResponse(res);
    } catch (err: any) {
      setError(err.message || 'Failed to reach FleetIQ Assistant');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(query);
  };

  const sampleQuestions = [
    'How many critical vehicles are there?',
    'Which vehicles require immediate maintenance?',
    'What does P0300 mean?',
    'Why is VH-1001 high priority?',
    'Show vehicles with battery health below 70%',
    'What are the top operational risks right now?',
    'Explain the current fleet health',
    'What actions require human review?'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-end">
      <div className="bg-white border-l border-slate-200 w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">FleetIQ Intelligence Copilot</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                  Grounded AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Hybrid Live Database + RAG Knowledge Base</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Prompt Chips */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
              Suggested Questions
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(q);
                    handleAsk(q);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-600 text-xs font-medium border border-slate-200/80 transition text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center gap-3 text-xs text-blue-700 animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin text-blue-600" />
              <span>Querying live fleet database and technical RAG documents...</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">Query Error</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Assistant Response Card */}
          {response && !loading && (
            <div className="space-y-4 animate-fade-in">
              {/* Query Type Badge */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      response.queryType === 'LIVE_DATA'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : response.queryType === 'KNOWLEDGE_RAG'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {response.queryType.replace('_', ' ')}
                  </span>
                  <span className="text-slate-400 font-medium">Confidence: {Math.round(response.confidence * 100)}%</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{response.aiProviderStatus}</span>
              </div>

              {/* Answer Content */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-800 leading-relaxed space-y-2 whitespace-pre-wrap">
                {response.answer}
              </div>

              {/* Recommended Action Box */}
              {response.recommendedAction && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-700 block mb-0.5">
                      Operator Recommendation
                    </span>
                    <p className="font-medium">{response.recommendedAction}</p>
                  </div>
                </div>
              )}

              {/* Sources Section */}
              {response.sources && response.sources.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Grounded Data Sources
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {response.sources.map((src, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600 font-mono shadow-2xs"
                      >
                        {src.includes('Database') || src.includes('Repository') ? (
                          <Database className="w-3 h-3 text-blue-500" />
                        ) : (
                          <BookOpen className="w-3 h-3 text-purple-500" />
                        )}
                        <span>{src}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about vehicles, fault codes, or maintenance..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
