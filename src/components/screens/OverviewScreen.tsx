import React, { useState } from 'react';
import { GameState, DecisionOption } from '../../types/game';
import { sound } from '../../engine/audioEngine';
import { AdvisorPortrait } from '../AdvisorPortrait';
import {
  AlertTriangle,
  FileText,
  Clock,
  TrendingUp,
  CheckCircle2,
  ChevronLeft,
  Users
} from 'lucide-react';

interface OverviewScreenProps {
  state: GameState;
  onApplyDecision: (decisionId: string, optionId: string) => void;
  onNavigateToCouncil: () => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  state,
  onApplyDecision,
  onNavigateToCouncil
}) => {
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(
    state.pendingDecisions.length > 0 ? state.pendingDecisions[0].id : null
  );
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const activeDecision = state.pendingDecisions.find((d) => d.id === selectedDecisionId) || state.pendingDecisions[0];

  const handleSelectOption = (optionId: string) => {
    setSelectedOptionId(optionId);
    sound.playClick();
  };

  const handleConfirmDecision = () => {
    if (!activeDecision || !selectedOptionId) return;
    sound.playGavel();
    onApplyDecision(activeDecision.id, selectedOptionId);
    setSelectedOptionId(null);
  };

  const selectedOption: DecisionOption | undefined = activeDecision?.options.find((o) => o.id === selectedOptionId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Presidential Banner & Game Over Check */}
      {state.isGameOver ? (
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border border-amber-500/50 rounded-2xl p-6 lg:p-8 text-center space-y-4 shadow-2xl">
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-amber-300">
            {state.stats.publicApprovalPct >= 45 ? 'ئەنجامی هەڵبژاردن: سەرکەوتنی گەورە!' : 'کۆتایی خولی سەرۆکایەتی کۆمار'}
          </h2>
          <p className="text-slate-200 text-sm lg:text-base max-w-3xl mx-auto leading-relaxed">
            {state.gameEndReasonKu}
          </p>
        </div>
      ) : null}

      {/* Top Section: Urgent Decisions & Presidential Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Main Column: Active Decision Dossier (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-slate-100">
                  دۆسیەی بڕیاری سەرۆکایەتی کۆمار
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                {state.pendingDecisions.length > 0
                  ? `${state.pendingDecisions.length} بڕیاری پێویست لەبەردەستاندایە`
                  : 'هیچ بڕیارێکی هەڵپەسێردراو نییە لەم وەرزەدا'}
              </span>
            </div>

            {/* Decision Tabs if multiple */}
            {state.pendingDecisions.length > 1 && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
                {state.pendingDecisions.map((dec) => (
                  <button
                    key={dec.id}
                    onClick={() => {
                      setSelectedDecisionId(dec.id);
                      setSelectedOptionId(null);
                      sound.playClick();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                      activeDecision?.id === dec.id
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {dec.titleKu}
                  </button>
                ))}
              </div>
            )}

            {activeDecision ? (
              <div className="mt-5 space-y-5">
                <div>
                  <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>سەرچاوە: {activeDecision.sourceKu}</span>
                  </div>
                  <h3 className="text-xl font-display font-bold text-slate-100 leading-snug">
                    {activeDecision.titleKu}
                  </h3>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                    {activeDecision.briefKu}
                  </p>
                </div>

                {/* Options List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    بژاردەکانی بەردەم جەنابی سەرۆک کۆمار:
                  </h4>
                  {activeDecision.options.map((opt, idx) => {
                    const isSelected = selectedOptionId === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-slate-800/90 border-amber-400/80 shadow-md ring-1 ring-amber-400/30'
                            : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <div className="flex-1 space-y-2">
                            <p className="text-sm font-medium text-slate-100 leading-snug">
                              {opt.textKu}
                            </p>

                            {/* Minister Stance Indicators */}
                            {opt.advisorReactions && (
                              <div className="flex flex-wrap items-center gap-2 text-[11px] pt-1">
                                <span className="text-slate-400 font-medium">هەڵوێستی وەزیران:</span>
                                {Object.entries(opt.advisorReactions).map(([advId, reaction]) => {
                                  const adv = state.advisors[advId as keyof typeof state.advisors];
                                  if (!adv) return null;
                                  return (
                                    <span
                                      key={advId}
                                      className={`inline-flex items-center gap-1 ${
                                        reaction === 'support'
                                          ? 'text-emerald-400'
                                          : reaction === 'oppose'
                                          ? 'text-rose-400'
                                          : 'text-slate-400'
                                      }`}
                                    >
                                      {adv.nameKu} ({reaction === 'support' ? 'پشتیوانە' : reaction === 'oppose' ? 'نەیارە' : 'بێلایەنە'})
                                    </span>
                                  );
                                })}
                              </div>
                            )}

                            {/* Immediate and Delayed Consequence preview if selected */}
                            {isSelected && (
                              <div className="mt-3 pt-3 border-t border-slate-750 space-y-2 text-xs">
                                <div className="text-slate-300">
                                  <strong className="text-slate-200">شیکاری ئەنجومەن:</strong> {opt.rationaleKu}
                                </div>

                                <div className="flex flex-wrap gap-3 text-[11px] text-slate-300">
                                  {opt.immediateEffects.treasuryBillion !== undefined && (
                                    <span>
                                      خەزێنە:{' '}
                                      <strong className={opt.immediateEffects.treasuryBillion >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                        {opt.immediateEffects.treasuryBillion > 0 ? '+' : ''}
                                        {opt.immediateEffects.treasuryBillion}$B
                                      </strong>
                                    </span>
                                  )}
                                  {opt.immediateEffects.publicApprovalPct !== undefined && (
                                    <span>
                                      ڕای گشتی:{' '}
                                      <strong className={opt.immediateEffects.publicApprovalPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                        {opt.immediateEffects.publicApprovalPct > 0 ? '+' : ''}
                                        {opt.immediateEffects.publicApprovalPct}%
                                      </strong>
                                    </span>
                                  )}
                                  {opt.immediateEffects.energyReservesPct !== undefined && (
                                    <span>
                                      یەدەگی وزە:{' '}
                                      <strong className={opt.immediateEffects.energyReservesPct >= 0 ? 'text-teal-400' : 'text-rose-400'}>
                                        {opt.immediateEffects.energyReservesPct > 0 ? '+' : ''}
                                        {opt.immediateEffects.energyReservesPct}%
                                      </strong>
                                    </span>
                                  )}
                                </div>

                                {opt.delayedConsequence && (
                                  <div className="flex items-center gap-1.5 text-amber-400 bg-amber-950/40 border border-amber-500/30 p-2 rounded-lg text-[11px]">
                                    <Clock className="w-3.5 h-3.5 shrink-0" />
                                    <span>
                                      <strong>ئاگاداری دەرئەنجامی درێژخایەن:</strong> ئەم بڕیارە لە وەرزی {opt.delayedConsequence.triggerTurn} کاریگەری نوێ لەسەر ئارڤێن دروست دەکات!
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-base font-semibold text-slate-200">
                  هەموو بڕیارە بەپەلەکانی ئەم وەرزە یەکلایی کراونەتەوە!
                </p>
                <p className="text-xs text-slate-400">
                  دەتوانن راوێژ بە ئەنجومەنی وەزیران بکەن یان پەیماننامە دیپلۆماسییەکان تاوتوێ بکەن پێش پێشڕەوی بۆ وەرزی نوێ.
                </p>
              </div>
            )}
          </div>

          {/* Action Bar */}
          {activeDecision && (
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <button
                onClick={onNavigateToCouncil}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <span>گفتوگۆ لەگەڵ وەزیرەکان لەسەر ئەم بڕیارە</span>
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleConfirmDecision}
                disabled={!selectedOptionId}
                className="px-6 py-2.5 rounded-xl font-semibold text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 disabled:pointer-events-none shadow-lg transition-all active:scale-95 flex items-center gap-2"
              >
                <span>واژۆکردنی فەرمانی سەرۆکایەتی کۆمار</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Council Quick Consult & Live Chronicle (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Council Portal */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  ئەنجومەنی ڕاوێژکاری باڵا
                </h3>
              </div>
              <button
                onClick={onNavigateToCouncil}
                className="text-[11px] text-teal-400 hover:underline"
              >
                چوونە ژووری کۆبوونەوە
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['rayan', 'lina', 'darok', 'nara', 'sami', 'mira'] as const).map((id) => {
                const adv = state.advisors[id];
                return (
                  <div
                    key={id}
                    onClick={onNavigateToCouncil}
                    className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-teal-500/50 cursor-pointer flex flex-col items-center text-center transition-transform hover:-translate-y-0.5"
                  >
                    <AdvisorPortrait id={id} size="sm" />
                    <span className="text-[11px] font-semibold text-slate-200 mt-1 truncate max-w-[70px]">
                      {adv.nameKu.split(' ')[0]}
                    </span>
                    <span className="text-[9px] text-slate-400 truncate max-w-[70px]">
                      {adv.roleKu.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chronicle Teletype / Wire Feed */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-100">
                بروسکەی بەپەلەی سەرۆکایەتی
              </h3>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {state.chronicle.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/60 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="text-amber-400 font-semibold">وەرزی {entry.turn}</span>
                    <span>{entry.category}</span>
                  </div>
                  <h4 className="font-semibold text-slate-100 text-xs leading-snug">
                    {entry.titleKu}
                  </h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {entry.contentKu || (entry as any).descriptionKu}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
