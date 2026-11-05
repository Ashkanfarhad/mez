import React, { useState, useRef, useEffect } from 'react';
import { GameState, AdvisorId, ActionableProposal } from '../../types/game';
import { AdvisorPortrait } from '../AdvisorPortrait';
import { sound } from '../../engine/audioEngine';
import {
  Send,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Shield,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Eye,
  UserCheck,
  ChevronDown,
  Info
} from 'lucide-react';

interface CouncilScreenProps {
  state: GameState;
  onAddChatMessage: (message: {
    sender: 'player' | AdvisorId | 'council';
    textKu: string;
    speakerNameKu?: string;
  }) => void;
  onApplyCouncilTurnResult: (result: {
    trustUpdates?: { advisorId: string; metric: string; delta: number; reasonKu: string }[];
    newMemories?: { advisorId: string; summaryKu: string; playerStanceKu?: string; promiseOrWarningKu?: string; unresolvedQuestionKu?: string }[];
    actionableProposal?: ActionableProposal | null;
    meetingSummaryUpdateKu?: string;
  }) => void;
  onConfirmProposal: (proposalId: string) => void;
  onRejectProposal: (proposalId: string) => void;
}

export const CouncilScreen: React.FC<CouncilScreenProps> = ({
  state,
  onAddChatMessage,
  onApplyCouncilTurnResult,
  onConfirmProposal,
  onRejectProposal
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<'all' | AdvisorId>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [inspectingAdvisorId, setInspectingAdvisorId] = useState<AdvisorId | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.chatHistory, isLoading, state.pendingProposals]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText.trim();
    if (!textToSend || isLoading) return;

    sound.playClick();
    setErrorMsg(null);
    setLastPrompt(textToSend);

    // 1. Add player message to chat history
    onAddChatMessage({
      sender: 'player',
      speakerNameKu: 'جەنابی سەرۆک کۆمار (ئێوە)',
      textKu: textToSend
    });

    if (!customPrompt) {
      setInputText('');
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/council/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          advisorId: selectedTarget === 'all' ? undefined : selectedTarget,
          gameState: {
            turn: state.turn,
            stats: state.stats,
            advisors: state.advisors,
            currentSessionId: state.currentSessionId,
            rollingSummaryKu: state.rollingSummaryKu,
            currentTopicKu: state.currentTopicKu,
            sideAgreements: state.sideAgreements
          }
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${res.status})`);
      }

      const data = await res.json();

      const dialogueList = data.responses || data.dialogue || [];
      if (Array.isArray(dialogueList) && dialogueList.length > 0) {
        sound.playTeletype();
        dialogueList.forEach((resp: { advisorId: string; speakerNameKu: string; textKu: string }) => {
          onAddChatMessage({
            sender: (resp.advisorId as AdvisorId) || 'council',
            speakerNameKu: resp.speakerNameKu,
            textKu: resp.textKu
          });
        });

        // Apply trust changes, memories, proposals, and summaries
        onApplyCouncilTurnResult({
          trustUpdates: data.trustUpdates,
          newMemories: data.newMemories,
          actionableProposal: data.actionableProposal,
          meetingSummaryUpdateKu: data.meetingSummaryUpdateKu
        });
      } else {
        throw new Error('وەڵامی ئەنجومەن بەتاڵ بوو، تکایە دووبارە هەوڵبدەرەوە.');
      }
    } catch (err: any) {
      console.error('Council chat error:', err);
      setErrorMsg(err.message || 'پەیوەندی لەگەڵ سێرڤەری زیرەکی دەستکرد تووشی کێشە بوو. دەتوانن دووبارە هەوڵبدەنەوە.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const sampleQuestions = [
    'چۆن مامەڵە لەگەڵ دراڤیک بکەین لەسەر قەیرانی وزە؟',
    'ڕاتان چییە لەسەر پەیماننامەی بازرگانی کالدۆر؟',
    'چۆن رێگری لە هەڵئاوسانی بەرز بکەین لە بازاڕدا؟',
    'ئامادەیی سوپای ئارڤێن چۆنە ئەگەر گرژی دروست بێت؟',
    'ئۆپۆزسیۆن چی دەوێت لە بەرامبەر دەنگدان بە یاسای بودجە؟',
    'پێشنیارێکی تەوافوقی بۆ دابەزاندنی کورتهێنانی خەزێنە ئامادە بکەن.'
  ];

  const inspectingAdvisor = inspectingAdvisorId ? state.advisors[inspectingAdvisorId] : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Council Room Visual Header with background image */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl h-80 lg:h-96">
        <img
          src="/assets/01-council-room.png"
          alt="ژووری کۆبوونەوەی ئەنجومەنی وەزیران"
          className="w-full h-full object-cover object-center"
        />
        {/* Scrim Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent flex flex-col justify-end p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <span className="text-amber-400 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                کۆشکی کۆماری وەیرا · ژووری مێزی باڵادەست · ئەنجومەنی ئاسایشی نیشتمانی
              </span>
              <h2 className="text-2xl lg:text-3xl font-display font-bold text-slate-100 mt-1">
                کۆبوونەوەی ئەنجومەنی وەزیرانی کۆماری ئارڤێن
              </h2>
              <p className="text-slate-300 text-xs lg:text-sm mt-1 max-w-2xl">
                هەموو وەزیرێک خاوەن متمانە، هەڵوێستی ڕوون و کارنامەی نهێنی خۆیەتی. وتووێژەکان بڕیار ناگۆڕن، تا ئێوە پێشنیارەکان پەسەند نەکەن.
              </p>
            </div>

            {/* Target Advisor Filter */}
            <div className="bg-slate-950/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 flex items-center gap-1 overflow-x-auto text-xs">
              <span className="text-[11px] text-slate-400 px-2 font-medium">ئاراستەکردن:</span>
              <button
                onClick={() => setSelectedTarget('all')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  selectedTarget === 'all'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                تەواوی ئەنجومەن
              </button>
              {(['rayan', 'lina', 'darok', 'nara', 'sami', 'mira'] as const).map((id) => (
                <button
                  key={id}
                  onClick={() => setSelectedTarget(id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    selectedTarget === id
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {state.advisors[id].nameKu.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Dialogue & Interactive Room Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ministers Table (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100">
              ئەندامانی ئەنجومەن و دۆسیەی متمانە
            </h3>
            <span className="text-[10px] text-slate-400">کلیک بکە بۆ زانیاری دۆسیە</span>
          </div>

          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {(['rayan', 'lina', 'darok', 'nara', 'sami', 'mira'] as const).map((id) => {
              const adv = state.advisors[id];
              const isTargeted = selectedTarget === id;
              return (
                <div
                  key={id}
                  className={`p-3 rounded-xl border transition-all ${
                    isTargeted
                      ? 'bg-slate-800/95 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setInspectingAdvisorId(id)}
                      title="بینینی دۆسیەی وەزیر"
                    >
                      <AdvisorPortrait id={id} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          onClick={() => setSelectedTarget(id)}
                          className="text-xs font-bold text-slate-200 hover:text-amber-300 cursor-pointer truncate"
                        >
                          {adv.nameKu}
                        </span>
                        <button
                          onClick={() => setInspectingAdvisorId(id)}
                          className="text-[10px] text-teal-400 hover:text-teal-300 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-teal-950/60 border border-teal-800/50"
                        >
                          <Eye className="w-2.5 h-2.5" />
                          <span>دۆسیە</span>
                        </button>
                      </div>
                      <span className="text-[10px] text-teal-400 block truncate">
                        {adv.roleKu}
                      </span>

                      {/* Trust & Respect Metrics */}
                      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/70 text-[10px]">
                        <div>
                          <div className="flex justify-between text-slate-400 mb-0.5">
                            <span>متمانە بە سەرۆک:</span>
                            <span className="font-mono font-bold text-amber-300">{adv.trustInPresident || adv.loyalty}%</span>
                          </div>
                          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 transition-all"
                              style={{ width: `${adv.trustInPresident || adv.loyalty}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-slate-400 mb-0.5">
                            <span>ڕێز بۆ بڕیارەکان:</span>
                            <span className="font-mono font-bold text-teal-300">{adv.respectForJudgment || 50}%</span>
                          </div>
                          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-400 transition-all"
                              style={{ width: `${adv.respectForJudgment || 50}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Red line / agenda hint */}
                      {adv.privateAgenda?.redLinesKu?.[0] && (
                        <p className="text-[10px] text-rose-300/80 mt-1.5 truncate flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                          <span>هێڵی سوور: {adv.privateAgenda.redLinesKu[0]}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Debate & Chat Area (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-[680px]">
          {/* Active Pending Proposals from Council */}
          {state.pendingProposals && state.pendingProposals.length > 0 && (
            <div className="mb-4 space-y-3">
              {state.pendingProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border-2 border-amber-500/50 shadow-lg space-y-2.5 animate-fadeIn"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                        پێشنیاری فەرمی بۆ بڕیاری سەرۆکایەتی
                      </span>
                    </div>
                    {proposal.costBillion !== undefined && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-bold">
                        تێچوو: ${proposal.costBillion}B
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-100">{proposal.titleKu}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{proposal.summaryKu}</p>

                  {/* Impact preview */}
                  <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                    {proposal.statChanges && Object.entries(proposal.statChanges).map(([k, v]) => (
                      <span key={k} className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700 font-mono">
                        {k}: {Number(v) > 0 ? `+${v}` : v}
                      </span>
                    ))}
                  </div>

                  {proposal.reasoningKu && (
                    <p className="text-[11px] text-amber-200/80 italic">«{proposal.reasoningKu}»</p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => onConfirmProposal(proposal.id)}
                      className="flex-1 py-2 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-colors active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>پەسەندکردنی بڕیار و جێبەجێکردن</span>
                    </button>
                    <button
                      onClick={() => onRejectProposal(proposal.id)}
                      className="py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>رەتکردنەوە</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Transcript Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {state.chatHistory.map((item) => {
              const isPlayer = item.sender === 'player';
              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 ${isPlayer ? 'flex-row-reverse' : ''}`}
                >
                  {!isPlayer && (
                    <div className="shrink-0 mt-1">
                      <AdvisorPortrait id={item.sender as AdvisorId} size="sm" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs lg:text-sm leading-relaxed ${
                      isPlayer
                        ? 'bg-amber-400 text-slate-950 font-medium rounded-tr-none shadow-md'
                        : 'bg-slate-950/85 border border-slate-800 text-slate-200 rounded-tl-none shadow'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1 text-[11px] font-semibold opacity-85">
                      <span>{item.speakerNameKu || item.sender}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{item.textKu}</p>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />
                <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-2xl text-xs text-amber-400 flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                  <span>ئەنجومەنی وەزیران بیردەکەنەوە و لە نێوان خۆیاندا تاوتوێی لێکەوتەکانی دەکەن...</span>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
                {lastPrompt && (
                  <button
                    onClick={() => handleSendMessage(lastPrompt)}
                    disabled={isLoading}
                    className="px-3 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>دووبارە هەوڵبدەرەوە</span>
                  </button>
                )}
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="pt-3 pb-2 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-1">
              <span className="text-slate-400 shrink-0">پێشنیارەکان:</span>
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white whitespace-nowrap shrink-0 transition-colors border border-slate-700/50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Multi-line Chat Input */}
          <div className="pt-2 flex items-end gap-2">
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                rows={2}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="ڕای وەزیرەکان بپرسە، پرسیارێک بکە، یان فەرمانێک بدە بە زمانی کوردیی سۆرانی... (Enter بۆ ناردن، Shift+Enter بۆ دێڕی نوێ)"
                disabled={isLoading}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs lg:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
              />
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className="px-5 py-3.5 rounded-xl bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95 flex items-center gap-1.5 text-xs shadow-md shrink-0 h-[52px]"
            >
              <Send className="w-4 h-4" />
              <span>ناردن</span>
            </button>
          </div>
        </div>
      </div>

      {/* Minister Dossier Modal */}
      {inspectingAdvisor && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-5 animate-scaleUp">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <AdvisorPortrait id={inspectingAdvisorId!} size="md" />
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{inspectingAdvisor.nameKu}</h3>
                  <span className="text-xs text-teal-400 font-medium">{inspectingAdvisor.roleKu}</span>
                  <p className="text-xs text-slate-400 mt-1">{inspectingAdvisor.agendaKu}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectingAdvisorId(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div>
                <span className="text-xs text-slate-400">متمانە بە سەرۆک کۆمار:</span>
                <span className="text-xl font-bold font-mono text-amber-400 block mt-1">
                  {inspectingAdvisor.trustInPresident || inspectingAdvisor.loyalty}%
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400">ڕێز بۆ لێهاتوویی و بڕیاردان:</span>
                <span className="text-xl font-bold font-mono text-teal-400 block mt-1">
                  {inspectingAdvisor.respectForJudgment || 50}%
                </span>
              </div>
            </div>

            {/* Agendas & Institutional Goals */}
            {inspectingAdvisor.privateAgenda && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  ئامانج و کارنامەی نهێنی (Private Dossier)
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                    <span className="font-bold text-slate-300 block mb-1">ئامانجی دامەزراوەیی:</span>
                    <p className="text-slate-400">{inspectingAdvisor.privateAgenda.institutionalObjectiveKu}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                    <span className="font-bold text-slate-300 block mb-1">نیگەرانییە تایبەتەکان:</span>
                    <p className="text-slate-400">{inspectingAdvisor.privateAgenda.privateConcernKu}</p>
                  </div>
                  {inspectingAdvisor.privateAgenda.redLinesKu && inspectingAdvisor.privateAgenda.redLinesKu.length > 0 && (
                    <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30">
                      <span className="font-bold text-rose-300 block mb-1">هێڵە سوورە نەبەزێنراوەکان:</span>
                      <ul className="list-disc list-inside text-rose-300/90 space-y-1">
                        {inspectingAdvisor.privateAgenda.redLinesKu.map((rl, i) => (
                          <li key={i}>{rl}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Relationship History Log */}
            {inspectingAdvisor.relationshipHistory && inspectingAdvisor.relationshipHistory.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                  مێژووی هەڵوێست و گۆڕانی متمانە
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {inspectingAdvisor.relationshipHistory.map((h, i) => (
                    <div key={i} className="p-2 rounded bg-slate-950/60 border border-slate-800/80 text-[11px] flex justify-between gap-2">
                      <span className="text-slate-300">{h.reasonKu}</span>
                      <span className={`font-mono font-bold shrink-0 ${h.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {h.delta >= 0 ? `+${h.delta}` : h.delta} (وەرزی {h.turn})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectingAdvisorId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                داخستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

