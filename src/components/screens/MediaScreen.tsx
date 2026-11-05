import React, { useState } from 'react';
import { GameState } from '../../types/game';
import { sound } from '../../engine/audioEngine';
import {
  Newspaper,
  Radio,
  Users,
  Mic,
  TrendingDown,
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface MediaScreenProps {
  state: GameState;
  onHoldPressConference: (speechTone: 'patriotic' | 'economic' | 'compromise') => void;
}

export const MediaScreen: React.FC<MediaScreenProps> = ({
  state,
  onHoldPressConference
}) => {
  const [conferenceStatus, setConferenceStatus] = useState<string | null>(null);

  const DEMOGRAPHICS = [
    {
      groupKu: 'کرێکارانی بەندەر و کارگەکان',
      groupEn: 'Industrial & Port Labor',
      supportPct: Math.round(state.stats.publicApprovalPct * 0.9 - (state.stats.inflationPct > 7 ? 10 : 0)),
      issuesKu: 'مووچەی کەمترین، هەڵئاوسانی نان، دژایەتی کاڵای بیانی'
    },
    {
      groupKu: 'خاوەنکار و سەرمایەداران',
      groupEn: 'Business & Investors',
      supportPct: Math.round(state.stats.publicApprovalPct * 1.1 - (state.stats.taxRatePct > 28 ? 12 : 0)),
      issuesKu: 'باجی نزم، ڕێککەوتنی بازرگانی لەگەڵ کالدۆر، سەقامگیری دراو'
    },
    {
      groupKu: 'ئەفسەران و هێزەکانی سوپا',
      groupEn: 'Military & Veterans',
      supportPct: Math.round(state.stats.militaryReadinessPct * 0.85 + (state.stats.governmentStabilityPct > 50 ? 5 : -5)),
      issuesKu: 'بەرگری سنووری باکوور، کڕینی چەک، دژایەتی سازان لەگەڵ دراڤیک'
    },
    {
      groupKu: 'خوێندکاران و ڕۆشنبیران',
      groupEn: 'Students & Intellectuals',
      supportPct: Math.round(state.stats.pressFreedomPct * 0.8 + 10),
      issuesKu: 'ئازادی رۆژنامەگەری، دادپەروەری کۆمەڵایەتی، پاراستنی ژینگە'
    },
    {
      groupKu: 'جوتیاران و دانیشتووانی گوندەکان',
      groupEn: 'Rural Farmers',
      supportPct: Math.round(state.stats.foodReservesPct * 0.7 + 15),
      issuesKu: 'سۆبسیدی دانەوێڵە، کێشەی وشکەساڵی، رێگاکانی گواستنەوە'
    }
  ];

  const handleSpeech = (tone: 'patriotic' | 'economic' | 'compromise') => {
    sound.playGavel();
    onHoldPressConference(tone);
    if (tone === 'patriotic') {
      setConferenceStatus('وتارێکی نیشتمانی گەرم پێشکەش کرا؛ ورەی سەربازان و ناسیۆنالیستەکان بەرزبووەوە!');
    } else if (tone === 'economic') {
      setConferenceStatus('وتاری چاکسازی دارایی پێشکەش کرا؛ بازاڕی بۆرسە و وەبەرهێنەران هێور بوونەوە.');
    } else {
      setConferenceStatus('پەیامی سازانی نیشتمانی راگەیەندرا؛ ئۆپۆزسیۆنی پەرلەمان پێشوازی لە دیالۆگ کرد.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <span className="text-amber-400 text-xs font-mono uppercase tracking-wider">
          ڕای گشتی و ئازادی ڕۆژنامەگەری
        </span>
        <h2 className="text-2xl lg:text-3xl font-display font-bold text-slate-100">
          دیوانی ڕاگەیاندن و دەنگی خەڵک
        </h2>
        <p className="text-slate-300 text-xs lg:text-sm mt-1">
          چاودێری ڕاپرسییە گشتییەکان، ڕۆژنامە سەرەکییەکانی کۆمار و بەستنی کۆنگرەی ڕۆژنامەوانی سەرۆکایەتی.
        </p>
      </div>

      {/* Media Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 block">تێکڕای ڕای گشتی (Approval)</span>
          <span className={`text-3xl font-bold font-mono tabular-nums ${state.stats.publicApprovalPct > 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {state.stats.publicApprovalPct}%
          </span>
          <span className="text-[10px] text-slate-400 block">
            {state.stats.publicApprovalPct > 50 ? 'زۆرینەی خەڵک پشتیوانتانن' : 'مەترسی لە دەستدانی دەنگی هەڵبژاردن!'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 block">پێوەری ئازادی ڕۆژنامەگەری</span>
          <span className="text-3xl font-bold font-mono text-teal-300 tabular-nums">
            {state.stats.pressFreedomPct}%
          </span>
          <span className="text-[10px] text-slate-400 block">شەفافیەتی گرێبەستە دەوڵەتییەکان</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 block">مەترسی ناڕەزایەتی و خۆپیشاندان</span>
          <span className={`text-3xl font-bold font-mono ${state.stats.publicApprovalPct < 35 || state.stats.inflationPct > 8 ? 'text-rose-400' : 'text-slate-300'}`}>
            {state.stats.publicApprovalPct < 35 || state.stats.inflationPct > 8 ? 'بەرز' : 'نزم'}
          </span>
          <span className="text-[10px] text-slate-400 block">بەهۆی هەڵئاوسان و دابەزینی داهات</span>
        </div>
      </div>

      {/* Main Newspapers Frontpages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Paper 1: Veyra Times */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-display font-bold text-amber-400 text-sm">ڕۆژنامەی سەروەری وەیرا</span>
            <span className="text-[10px] text-slate-400 font-mono">سەربەخۆ</span>
          </div>
          <h4 className="text-base font-bold text-slate-100 leading-snug">
            «مێزی سەروەری رووبەڕووی گەورەترین تاقیکردنەوەی دیپلۆماسی دەبێتەوە»
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            وەیرا تاوتوێی قەیرانی هێڵی باکوور دەکات لە کاتێکدا هاوپەیمانی پەرلەمان لە ژێر چاودێری وردی هاوڵاتیاندایە.
          </p>
        </div>

        {/* Paper 2: Worker's Voice */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-display font-bold text-rose-400 text-sm">دەنگی کرێکاری لۆریان</span>
            <span className="text-[10px] text-slate-400 font-mono">ئۆپۆزسیۆن</span>
          </div>
          <h4 className="text-base font-bold text-slate-100 leading-snug">
            «کرێکاران هۆشداری دەدەن لە هەڵئاوسانی کڕینی کاڵا و باجەکان»
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            سەندیکاکانی بەندەری لۆریان داوا دەکەن حکومەت لەبری چەک، پشتیوانی لە کەمکردنەوەی نرخی نان و گواستنەوە بکات.
          </p>
        </div>

        {/* Paper 3: Sovereign Finance */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-display font-bold text-teal-400 text-sm">ئابووری ئارڤێن</span>
            <span className="text-[10px] text-slate-400 font-mono">بازرگانی</span>
          </div>
          <h4 className="text-base font-bold text-slate-100 leading-snug">
            «کالدۆر و سەحران بە سەرنجەوە چاودێری بڕیارەکانی کۆشکی وەیرا دەکەن»
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            وەبەرهێنەرانی بیانی دەڵێن پەیماننامەی بازرگانی ئازاد کلیلی بووژانەوەی بەندەرەکانی کۆماری ئارڤێن دەبێت.
          </p>
        </div>
      </div>

      {/* Demographic Polling & Presidential Press Briefing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Demographic Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Users className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-sm">
              ڕاپرسی دەنگدەران بەپێی چین و توێژە کۆمەڵایەتییەکان
            </h3>
          </div>

          <div className="space-y-4">
            {DEMOGRAPHICS.map((demo, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{demo.groupKu}</span>
                  <span className="font-mono font-bold text-amber-300 tabular-nums">
                    {Math.max(10, Math.min(95, demo.supportPct))}% پشتگیری
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-amber-400 rounded-full"
                    style={{ width: `${Math.max(10, Math.min(95, demo.supportPct))}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block">{demo.issuesKu}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Presidential Press Conference (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Mic className="w-5 h-5 text-teal-400" />
              <h3 className="font-bold text-slate-100 text-sm">
                کۆنگرەی ڕۆژنامەوانی سەرۆکایەتی کۆمار
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              وتاری سەرۆک بۆ هاوڵاتیان دەتوانێت کاریگەری خێرا لەسەر ڕای گشتی، متمانەی بازاڕ و هێورکردنەوەی پەرلەمان دروست بکات.
            </p>

            {conferenceStatus && (
              <div className="mt-3 p-3 rounded-xl bg-teal-950/40 border border-teal-500/40 text-xs text-teal-200">
                {conferenceStatus}
              </div>
            )}
          </div>

          <div className="space-y-2.5 pt-4">
            <button
              onClick={() => handleSpeech('patriotic')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold text-right transition-colors border border-slate-700 flex items-center justify-between"
            >
              <span>وتاری نیشتمانی و بەرگری لە سەروەری</span>
              <span className="text-[10px] text-teal-400">+5% سوپا، +3% ڕای گشتی</span>
            </button>

            <button
              onClick={() => handleSpeech('economic')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold text-right transition-colors border border-slate-700 flex items-center justify-between"
            >
              <span>وتاری شەفافیەتی دارایی و کۆنترۆڵی هەڵئاوسان</span>
              <span className="text-[10px] text-amber-400">+4% سەقامگیری بازاڕ</span>
            </button>

            <button
              onClick={() => handleSpeech('compromise')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold text-right transition-colors border border-slate-700 flex items-center justify-between"
            >
              <span>بانگەوازی ئاشتی و سازان لەگەڵ ئۆپۆزسیۆن</span>
              <span className="text-[10px] text-emerald-400">+6% سەقامگیری پەرلەمان</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
