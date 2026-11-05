import React, { useState } from 'react';
import { GameState, BillProposal } from '../../types/game';
import { sound } from '../../engine/audioEngine';
import {
  Landmark,
  Scale,
  Users2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Gavel
} from 'lucide-react';

interface ParliamentScreenProps {
  state: GameState;
  onVoteOnBill: (billId: string) => void;
}

export const ParliamentScreen: React.FC<ParliamentScreenProps> = ({
  state,
  onVoteOnBill
}) => {
  const [selectedBillId, setSelectedBillId] = useState<string>(
    state.bills.length > 0 ? state.bills[0].id : ''
  );

  const selectedBill = state.bills.find((b) => b.id === selectedBillId) || state.bills[0];

  const totalSeats = 200;
  const coalitionSeats = state.parties
    .filter((p) => p.alignment === 'coalition')
    .reduce((acc, p) => acc + p.seats, 0);

  const oppositionSeats = state.parties
    .filter((p) => p.alignment === 'opposition')
    .reduce((acc, p) => acc + p.seats, 0);

  const neutralSeats = totalSeats - coalitionSeats - oppositionSeats;

  const handleVote = (billId: string) => {
    sound.playGavel();
    onVoteOnBill(billId);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-amber-400 text-xs font-mono uppercase tracking-wider">
            یاسادانان و دەسەڵاتی گەل
          </span>
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-slate-100">
            پەرلەمانی کۆماری ئارڤێن (٢٠٠ کورسی)
          </h2>
          <p className="text-slate-300 text-xs lg:text-sm mt-1">
            هاوپەیمانی حکومەت خاوەنی {coalitionSeats} کورسییە؛ زۆرینەی پێویست بۆ پەسەندکردنی یاسا ١٠١ دەنگە.
          </p>
        </div>

        {/* Coalition Stability Gauge */}
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">سەقامگیری هاوپەیمانی</span>
            <span className={`font-bold font-mono text-sm ${state.stats.governmentStabilityPct < 35 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {state.stats.governmentStabilityPct}%
            </span>
          </div>
          <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${state.stats.governmentStabilityPct < 35 ? 'bg-rose-500' : 'bg-emerald-500'}`}
              style={{ width: `${state.stats.governmentStabilityPct}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400">
            {state.stats.governmentStabilityPct < 35 ? 'مەترسی هەڵوەشانەوە!' : 'هاوپەیمانی پتەوە'}
          </span>
        </div>
      </div>

      {/* Hemicycle Parliament Visualizer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-sm">
              دابەشبوونی فراکسیۆنە پەرلەمانتارییەکان لە هۆڵی نیشتمانی
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-teal-400 font-semibold">هاوپەیمانی: {coalitionSeats} کورسی</span>
            <span className="text-slate-600">·</span>
            <span className="text-rose-400 font-semibold">ئۆپۆزسیۆن: {oppositionSeats} کورسی</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">بێلایەن: {neutralSeats}</span>
          </div>
        </div>

        {/* Visual Seat Grid Dots */}
        <div className="bg-slate-950/80 p-6 rounded-xl border border-slate-800/80 flex flex-col items-center">
          <div className="flex flex-wrap justify-center gap-1.5 max-w-2xl py-2">
            {state.parties.flatMap((party) =>
              Array.from({ length: party.seats }).map((_, seatIdx) => (
                <div
                  key={`${party.id}-${seatIdx}`}
                  style={{ backgroundColor: party.color }}
                  title={`${party.nameKu} (${party.alignment === 'coalition' ? 'هاوپەیمان' : 'ئۆپۆزسیۆن'})`}
                  className="w-3.5 h-3.5 rounded-full shadow-sm hover:scale-125 transition-transform cursor-pointer"
                />
              ))
            )}
          </div>
          <div className="w-48 h-1 bg-amber-400/50 rounded-full mt-4" />
          <span className="text-[11px] font-mono text-slate-400 mt-1">مێزی دەستەی سەرۆکایەتی پەرلەمان</span>
        </div>

        {/* Parties List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {state.parties.map((party) => (
            <div
              key={party.id}
              className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: party.color }}
                  />
                  <span className="font-bold text-slate-200 truncate max-w-[140px]">
                    {party.nameKu}
                  </span>
                </div>
                <span className="font-mono font-bold text-amber-300 tabular-nums">
                  {party.seats} کورسی
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">{party.ideologyKu}</p>
              <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                <span>متمانە بە سەرۆک: {party.loyaltyToPresident}%</span>
                <span className={party.alignment === 'coalition' ? 'text-teal-400 font-semibold' : 'text-rose-400'}>
                  {party.alignment === 'coalition' ? 'هاوپەیمانی سەرەکی' : 'بەرەی ئۆپۆزسیۆن'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legislative Proposals (Bills) Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bills Navigation (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-slate-100 pb-2 border-b border-slate-800 flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-400" />
            <span>پڕۆژەیاسا فەرمییەکان</span>
          </h3>

          <div className="space-y-2">
            {state.bills.map((bill) => (
              <div
                key={bill.id}
                onClick={() => {
                  setSelectedBillId(bill.id);
                  sound.playClick();
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedBill?.id === bill.id
                    ? 'bg-slate-800/90 border-amber-400/80 shadow-md ring-1 ring-amber-400/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-amber-400 font-mono uppercase">{bill.category}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      bill.status === 'passed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : bill.status === 'rejected'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {bill.status === 'passed' ? 'پەسەندکراو' : bill.status === 'rejected' ? 'رەتکراوە' : 'لە دەنگداندایە'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-100 leading-snug">{bill.titleKu}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Bill Detailed Debate & Vote (8 cols) */}
        {selectedBill && (
          <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-400 font-mono">دۆسیەی پەرلەمانی: {selectedBill.titleEn}</span>
                <h3 className="text-lg font-bold text-slate-100">{selectedBill.titleKu}</h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Users2 className="w-4 h-4 text-slate-400" />
                <span>دەنگی پێویست: ١٠١ لە ٢٠٠</span>
              </div>
            </div>

            <p className="text-xs lg:text-sm text-slate-300 bg-slate-950/70 p-4 rounded-xl border border-slate-800 leading-relaxed">
              {selectedBill.summaryKu}
            </p>

            {/* Voting Prediction / Status Breakdown */}
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-slate-300 block">
                {selectedBill.status === 'pending' ? 'پێشبینی دەنگدان لە پەرلەمان:' : 'ئەنجامی فەرمی دەنگدان:'}
              </span>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-emerald-400 font-bold">بەڵێ: {selectedBill.supportBreakdown.for}</span>
                <span className="text-rose-400 font-bold">نەخێر: {selectedBill.supportBreakdown.against}</span>
                <span className="text-slate-400">بێدەنگ: {selectedBill.supportBreakdown.abstain}</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${(selectedBill.supportBreakdown.for / 200) * 100}%` }}
                />
                <div
                  className="bg-rose-500 h-full"
                  style={{ width: `${(selectedBill.supportBreakdown.against / 200) * 100}%` }}
                />
                <div
                  className="bg-slate-600 h-full"
                  style={{ width: `${(selectedBill.supportBreakdown.abstain / 200) * 100}%` }}
                />
              </div>
            </div>

            {/* Expected Consequences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-slate-300">
                <strong className="text-emerald-400 block mb-1">ئەگەر دەنگی بەڵێ بهێنێت:</strong>
                {selectedBill.consequencesKu.passed}
              </div>
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-slate-300">
                <strong className="text-rose-400 block mb-1">ئەگەر رەتبکرێتەوە:</strong>
                {selectedBill.consequencesKu.failed}
              </div>
            </div>

            {/* Voting Action */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end">
              {selectedBill.status === 'pending' ? (
                <button
                  onClick={() => handleVote(selectedBill.id)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all active:scale-95 flex items-center gap-2"
                >
                  <Gavel className="w-4 h-4" />
                  <span>بانگهێشتکردنی پەرلەمان بۆ دەنگدانی فەرمی</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  {selectedBill.status === 'passed' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>ئەم یاسایە بە فەرمی پەسەندکراوە و جێبەجێ کراوە.</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-400" />
                      <span>ئەم پڕۆژەیە لە دەنگداندا شکستی هێنا و داخرا.</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
