import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Send,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Car,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ChatConversation, ChatMessage, ChatConversationDetail } from '../../types';
import { api } from '../../services/api';

interface CopilotWorkspaceProps {
  onSelectVehicle?: (vehicleId: string) => void;
}

export const CopilotWorkspace: React.FC<CopilotWorkspaceProps> = ({ onSelectVehicle }) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeDetail, setActiveDetail] = useState<ChatConversationDetail | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);
  const [expandedCitations, setExpandedCitations] = useState<{ [msgId: string]: boolean }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Compact operational suggested inquiry chips
  const suggestedChips = [
    { label: 'Critical battery faults', query: 'Which vehicles currently have critical battery or thermal fault codes?' },
    { label: 'OEM diagnostic protocol', query: 'What is the OEM diagnostic protocol for DTC P0A80 in Toyota fleets?' },
    { label: 'Pending operator reviews', query: 'Summarize high-priority actions awaiting human operator review.' },
    { label: 'Warranty threshold alerts', query: 'Are there any BMW or Tesla vehicles exceeding warranty telemetry thresholds?' }
  ];

  const loadConversations = async () => {
    setIsLoadingList(true);
    try {
      const list = await api.listConversations();
      setConversations(list);
      if (list.length > 0 && !activeConversationId) {
        selectConversation(list[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
      setError('Unable to load chat history.');
    } finally {
      setIsLoadingList(false);
    }
  };

  const selectConversation = async (id: string) => {
    setActiveConversationId(id);
    setIsLoadingDetail(true);
    setError(null);
    try {
      const detail = await api.getConversation(id);
      setActiveDetail(detail);
    } catch (err: any) {
      console.error('Failed to load conversation messages:', err);
      setError('Failed to load messages for conversation ' + id);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCreateNew = async () => {
    setError(null);
    try {
      const newConv = await api.createConversation('Fleet Operations Query');
      setConversations((prev) => [newConv, ...prev]);
      await selectConversation(newConv.id);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (err: any) {
      setError('Failed to initialize new conversation.');
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        if (remaining.length > 0) {
          selectConversation(remaining[0].id);
        } else {
          setActiveConversationId(null);
          setActiveDetail(null);
        }
      }
    } catch (err: any) {
      setError('Failed to delete conversation.');
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || prompt).trim();
    if (!messageText || isSending) return;

    setError(null);
    let targetConvId = activeConversationId;

    if (!targetConvId) {
      try {
        const title = messageText.length > 30 ? messageText.substring(0, 30) + '...' : messageText;
        const newConv = await api.createConversation(title);
        setConversations((prev) => [newConv, ...prev]);
        targetConvId = newConv.id;
        setActiveConversationId(newConv.id);
      } catch (err) {
        setError('Failed to create new conversation.');
        return;
      }
    }

    const optimisticUserMsg: ChatMessage = {
      id: 'temp-' + Date.now(),
      conversationId: targetConvId,
      role: 'USER',
      content: messageText,
      createdAt: new Date().toISOString()
    };

    setActiveDetail((prev) => ({
      conversation: prev ? prev.conversation : {
        id: targetConvId!,
        title: messageText.length > 25 ? messageText.substring(0, 25) + '...' : messageText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 1
      },
      messages: prev ? [...prev.messages, optimisticUserMsg] : [optimisticUserMsg]
    }));

    setPrompt('');
    setIsSending(true);

    try {
      const assistantMsg = await api.sendMessage(targetConvId, messageText);
      setActiveDetail((prev) => {
        if (!prev) return null;
        const filtered = prev.messages.filter((m) => m.id !== optimisticUserMsg.id);
        return {
          ...prev,
          messages: [...filtered, optimisticUserMsg, assistantMsg]
        };
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetConvId
            ? { ...c, messageCount: c.messageCount + 2, updatedAt: new Date().toISOString() }
            : c
        )
      );
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Error executing assistant query. Please retry.');
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeDetail?.messages]);

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const toggleCitation = (msgId: string) => {
    setExpandedCitations((prev) => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  return (
    <div className="flex h-[calc(100vh-140px)] w-full bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs font-sans">
      {/* 1. Collapsible Conversation History Sidebar */}
      <aside
        className={`bg-slate-50 border-r border-slate-200/80 flex flex-col justify-between transition-all duration-200 ease-in-out ${
          isHistoryCollapsed ? 'w-0 p-0 border-none overflow-hidden' : 'w-72 p-3'
        }`}
      >
        <div className="space-y-3 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Conversations
            </span>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold shadow-2xs transition"
              title="Start New Conversation"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>New</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" aria-hidden="true" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200/80 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {isLoadingList && conversations.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading history...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No conversations found.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => selectConversation(conv.id)}
                    className={`group w-full flex items-center justify-between p-2.5 rounded-lg text-left cursor-pointer transition text-xs ${
                      isActive
                        ? 'bg-blue-50 text-blue-900 border border-blue-200/70 font-semibold'
                        : 'text-slate-700 hover:bg-white border border-transparent hover:border-slate-200/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-1">
                      <MessageSquare
                        className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
                        aria-hidden="true"
                      />
                      <span className="truncate text-xs">{conv.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition shrink-0"
                      title="Delete Conversation"
                    >
                      <Trash2 className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </aside>

      {/* 2. Main Conversational Canvas */}
      <main className="flex-1 flex flex-col justify-between bg-white overflow-hidden min-w-0">
        {/* Canvas Header */}
        <div className="px-5 py-3 border-b border-slate-200/80 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsHistoryCollapsed(!isHistoryCollapsed)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              title={isHistoryCollapsed ? 'Show conversation history' : 'Hide conversation history'}
              aria-label={isHistoryCollapsed ? 'Show conversation history' : 'Hide conversation history'}
            >
              {isHistoryCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" aria-hidden="true" />
              ) : (
                <PanelLeftClose className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                {activeDetail?.conversation.title || 'FleetIQ Copilot'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true"></span>
              Grounded
            </span>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" aria-hidden="true" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => activeConversationId && selectConversation(activeConversationId)}
                className="px-2 py-0.5 rounded bg-white border border-rose-200 text-rose-700 font-bold hover:bg-rose-100 transition"
              >
                Retry
              </button>
            </div>
          )}

          {isLoadingDetail ? (
            <div className="py-20 text-center space-y-2">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <span className="text-xs text-slate-400 font-medium">Retrieving conversation...</span>
            </div>
          ) : !activeDetail || activeDetail.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-12 space-y-4">
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 shadow-2xs">
                <Sparkles className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">FleetIQ Operations Assistant</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Query connected multi-OEM vehicles, fault codes, battery alerts, and operational priorities.
                </p>
              </div>

              {/* Compact Clickable Suggestion Chips */}
              <div className="pt-2 w-full space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Quick Inquiries
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {suggestedChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip.query)}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 text-xs font-semibold text-slate-700 hover:text-blue-900 transition flex items-center justify-between group"
                    >
                      <span>{chip.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            activeDetail.messages.map((msg) => {
              const isUser = msg.role === 'USER';
              const isCitationOpen = !!expandedCitations[msg.id];
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-xs leading-relaxed ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-2xl space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-3.5 rounded-xl ${
                        isUser
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-50 border border-slate-200/80 text-slate-900 shadow-2xs space-y-2'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>

                      {/* Assistant Response Metadata */}
                      {!isUser && (msg.modelTag || msg.confidenceScore) && (
                        <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-[10px] text-slate-500">
                          {msg.modelTag && (
                            <span className="font-mono px-2 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                              {msg.modelTag}
                            </span>
                          )}
                          {msg.confidenceScore && (
                            <span className="font-medium">
                              Confidence: <strong>{msg.confidenceScore}</strong>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Expandable Citations / Sources */}
                      {!isUser && msg.citations && msg.citations.length > 0 && (
                        <div className="pt-1">
                          <button
                            onClick={() => toggleCitation(msg.id)}
                            className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition"
                          >
                            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Grounded in {msg.citations.length} sources</span>
                            {isCitationOpen ? (
                              <ChevronUp className="w-3 h-3" aria-hidden="true" />
                            ) : (
                              <ChevronDown className="w-3 h-3" aria-hidden="true" />
                            )}
                          </button>

                          {isCitationOpen && (
                            <div className="mt-2 p-2.5 rounded-lg bg-white border border-slate-200/80 text-[11px] space-y-1.5 animate-in fade-in duration-100">
                              <span className="font-bold text-slate-700 block mb-1">Sources & Grounding Documents:</span>
                              {msg.citations.map((cite, cIdx) => (
                                <div key={cIdx} className="flex items-start gap-2 text-slate-600 text-[11px]">
                                  <span className="text-blue-500 font-bold shrink-0 mt-0.5">•</span>
                                  <span>{typeof cite === 'string' ? cite : (cite as any).title || (cite as any).source}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200/80 bg-white shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/20 transition"
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask FleetIQ Copilot about vehicles, DTC fault codes, or maintenance risk..."
              className="flex-1 bg-transparent border-none outline-none text-xs text-slate-800 placeholder-slate-400 resize-none font-sans"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isSending}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition shadow-2xs shrink-0"
              title="Send Message"
              aria-label="Send Message"
            >
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
