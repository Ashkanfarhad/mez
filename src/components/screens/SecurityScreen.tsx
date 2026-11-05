import React, { useState } from 'react';
import { GameState, SideAgreement } from '../../types/game';
import { sound } from '../../engine/audioEngine';
import {
  ShieldAlert,
  Eye,
  Radio,
  Lock,
  Unlock,
  Cpu,
  Crosshair,
  CheckCircle2,
  AlertTriangle,
  FileSearch,
  Users
} from 'lucide-react';
import { AdvisorPortrait } from '../AdvisorPortrait';

interface SecurityScreenProps {
  state: GameState;
  onLaunchOperation: (opNameKu: string, costBillion: number, statChanges: any) => void;
  onRevealSideAgreement: (agreementId: string, discoverySourceKu: string) => void;
}

export const SecurityScreen: React.FC<SecurityScreenProps> = ({
  state,
  onLaunchOperation,
  onRevealSideAgreement
}) => {
  const [activeTab, setActiveTab] = useState<'dossiers' | 'operations' | 'leaks'>('operations');
  const [investigating, setInvestigating] = useState(false);
  const [investigationResult, setInvestigationResult] = useState<string | null>(null);

  const undiscoveredAgreements = (state.sideAgreements || []).filter((sa) => !sa.discovered);
  const discoveredAgreements = (state.sideAgreements || []).filter((sa) => sa.discovered);

  const handleInvestigateLeaks = () => {
    if (state.stats.treasuryBillion < 1.0) {
      alert('خەزێنەی دەوڵەت پێویستی بە لانیکەم ١ ملیار دۆلار هەیە بۆ دابینکردنی تۆڕی چاودێری DNI.');
      return;
    }

    sound.playTeletype();
    setInvestigating(true);
    setInvestigationResult(null);

    setTimeout(() => {
      setInvestigating(false);
      if (undiscoveredAgreements.length > 0) {
        const target = undiscoveredAgreements[0];
        onRevealSideAgreement(target.id, 'ڕاپۆرتی سیخوڕی ژێربەژێری DNI (سامی کورد)');
        setInvestigationResult(`بەڵگەنامەی نوێ دۆزرایەوە: «${target.titleKu}» ئاشکراکرا.`);
      } else {
        setInvestigationResult('تۆڕی هەواڵگری پشتڕاستی کردەوە: هیچ ڕێککەوتنێکی نوێی گوماناوی لە نێوان وەزیرەکان لەم قۆناغەدا بوونی نییە.');
      }
    }, 1200);
  };

  const OPERATIONS = [
    {
      id: 'cyber-shield',
      titleKu: 'ئۆپەراسیۆنی قەڵغانی سایبەری تازیرا',
      costBillion: 1.8,
      riskKu: 'کەم',
      descKu: 'جێگیرکردنی سیستەمی کۆدکردنی نیشتمانی بۆ پاراستنی بانکەکانی وەیرا و لۆریان لە هێرشی ئەلیکترۆنی بیانی.',
      benefitKu: '+8% سەقامگیری، بێدەنگکردنی دزەکردنی زانیارییەکان',
      effects: { governmentStabilityPct: 8, treasuryBillion: -1.8 }
    },
    {
      id: 'dravik-border-recon',
      titleKu: 'چاودێری ئاسمانی و فڕۆکەی بێفڕۆکەوان لە سنووری باکوور',
      costBillion: 2.2,
      riskKu: 'مامناوەند',
      descKu: 'ناردنی درۆنی چاودێری بۆ دەستنیشانکردنی پێگەی تۆپخانەکانی پاشا ڤیکتۆری دراڤیک لە کاتی هەڕەشەی گازی باکوور.',
      benefitKu: '+12% ئامادەیی سوپا، ئاگاداری پێشوەختە',
      effects: { militaryReadinessPct: 12, treasuryBillion: -2.2 }
    },
    {
      id: 'lorian-convoy-escort',
      titleKu: 'پاراستنی کەشتیگەلی نەوتی لۆریان لە چەتەگەری باشوور',
      costBillion: 2.0,
      riskKu: 'کەم',
      descKu: 'ناردنی فرێگاتە دەریاییەکانی ئارڤێن بۆ یاوەریکردنی تانکەرە نەوتییەکانی سەحران بە سەلامەتی تا بەندەر.',
      benefitKu: '+10% یەدەگی وزە، دڵنیایی بازرگانی',
      effects: { energyReservesPct: 10, treasuryBillion: -2.0 }
    }
  ];

  const handleExecuteOperation = (op: typeof OPERATIONS[0]) => {
    if (state.stats.treasuryBillion < op.costBillion) {
      alert('خەزێنەی دەوڵەت بەشی ئەم ئۆپەراسیۆنە ناکات!');
      return;
    }
    sound.playGavel();
    onLaunchOperation(op.titleKu, op.costBillion, op.effects);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <span className="text-amber-400 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          ئاسایشی نیشتمانی و هەواڵگری باڵا (DNI)
        </span>
        <h2 className="text-2xl lg:text-3xl font-display font-bold text-slate-100 mt-1">
          دیوانی پاراستنی سەروەری و بەرگری کۆمار
        </h2>
        <p className="text-slate-300 text-xs lg:text-sm mt-1">
          ڕاپۆرتە نهێنییەکانی سامی کورد و ژەنەڕاڵ دارۆک ساڤێن لەسەر سنوورەکان، ئاسایشی سایبەر و لێکۆڵینەوە لە پەیمانە نهێنییەکانی کابینە.
        </p>
      </div>

      {/* Security Status Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ئامادەیی سوپای ئارڤێن</span>
            <ShieldAlert className="w-4 h-4 text-teal-400" />
          </div>
          <span className="text-3xl font-bold font-mono text-teal-300 block tabular-nums">
            {state.stats.militaryReadinessPct}%
          </span>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="bg-teal-400 h-full rounded-full transition-all"
              style={{ width: `${state.stats.militaryReadinessPct}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 block">
            {state.stats.militaryReadinessPct > 70 ? 'ئامادەباشی سەربازی باڵا' : 'ئامادەباشی ئاسایی'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ئاستی هەڕەشەی سایبەری</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-3xl font-bold font-mono text-amber-400 block">
            مامناوەند
          </span>
          <p className="text-[11px] text-slate-400 leading-snug">
            کۆماری تازیرا و ئۆردان چالاکیی سیخوڕییان لەسەر کێبڵە دەریاییەکان تۆمارکراوە.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>دۆخی سنووری باکوور (دراڤیک)</span>
            <Crosshair className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-3xl font-bold font-mono text-rose-400 block">
            گرژی بەرز
          </span>
          <p className="text-[11px] text-slate-400 leading-snug">
            هێزەکانی پاشا ڤیکتۆر لە نزیک بۆری گازی باکوور مانۆڕ ئەنجام دەدەن.
          </p>
        </div>
      </div>

      {/* Intelligence Chief Briefing Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
          <AdvisorPortrait id="sami" size="md" />
          <div>
            <span className="text-xs text-teal-400 font-mono">بەڕێوەبەری دەزگای هەواڵگری نیشتمانی (DNI)</span>
            <h3 className="text-base font-bold text-slate-100">سامی کورد: وتەی چاودێری هەواڵگری</h3>
            <p className="text-xs text-slate-300 mt-1">
              «جەنابی سەرۆک، زانیارییەکان بە زمانی ڕاستی دەدوێن نەک بە دیپلۆماسی نەرم. تازیرا بە نهێنی چاودێری بانکەکانمان دەکات، و وەزیرەکانیش هەندێک جار لە پشتی دەرگای داخراو رێککەوتنی نهێنی دەبەستن.»
            </p>
          </div>
        </div>

        {/* Secret Minister Pacts Investigation Tool */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <FileSearch className="w-4 h-4 text-amber-400" />
                لێکۆڵینەوە لە پەیمانە نهێنییەکانی کابینە و دزەپێکردنی زانیاری
              </span>
              <p className="text-xs text-slate-400 mt-1">
                تیمی چاودێری دەزگای DNI پەیوەندی و مامەڵە ژێربەژێرەکانی نێوان وەزیرەکان بەدواداچوون دەکات.
              </p>
            </div>
            <button
              onClick={handleInvestigateLeaks}
              disabled={investigating}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 shrink-0 transition-all shadow"
            >
              <Eye className="w-4 h-4" />
              <span>{investigating ? 'لێکۆڵینەوە بەردەوامە...' : 'دەستپێکردنی لێکۆڵینەوە ($1.0B)'}</span>
            </button>
          </div>

          {investigationResult && (
            <div className="p-3 rounded-lg bg-teal-950/60 border border-teal-500/40 text-xs text-teal-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{investigationResult}</span>
            </div>
          )}
        </div>

        {/* Discovered Secret Side Agreements section */}
        {discoveredAgreements.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold text-rose-300 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-rose-400" />
              دۆسیە و پەیمانە نهێنییە دۆزراوەکان لە کابینەدا ({discoveredAgreements.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {discoveredAgreements.map((sa) => (
                <div
                  key={sa.id}
                  className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-200 text-sm">{sa.titleKu}</span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px]">
                      ئاشکراکراو لە وەرزی {sa.discoveryTurn || state.turn}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>بەشداربووان: </span>
                    <strong className="text-slate-200">{sa.participants.map(p => state.advisors[p]?.nameKu || p).join(' و ')}</strong>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">{sa.purposeKu}</p>
                  <div className="pt-2 border-t border-rose-500/20 text-[11px] text-amber-300/90">
                    <span>مەرجەکان: </span>
                    <span>{sa.conditionsKu}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Covert Operations Dispatcher */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h4 className="text-sm font-bold text-slate-200">ئۆپەراسیۆنە پێشنیارکراوەکانی دەزگای هەواڵگری:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {OPERATIONS.map((op) => (
              <div
                key={op.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3 flex flex-col justify-between text-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-amber-400 font-mono">تێچوو: ${op.costBillion}B</span>
                    <span className="text-[10px] text-slate-400">مەترسی: {op.riskKu}</span>
                  </div>
                  <h5 className="font-bold text-slate-100 text-sm leading-snug">{op.titleKu}</h5>
                  <p className="text-slate-400 text-[11px] mt-2 leading-relaxed">{op.descKu}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80">
                  <span className="text-emerald-400 text-[11px] block mb-2">{op.benefitKu}</span>
                  <button
                    onClick={() => handleExecuteOperation(op)}
                    disabled={state.stats.treasuryBillion < op.costBillion}
                    className="w-full py-2 rounded-lg bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-slate-950 font-bold text-xs transition-colors shadow"
                  >
                    دەستپێکردنی ئۆپەراسیۆن
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

