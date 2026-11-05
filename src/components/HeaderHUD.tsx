import React from 'react';
import { GameState } from '../types/game';
import { Volume2, VolumeX, ShieldAlert, Sparkles } from 'lucide-react';
import { sound } from '../engine/audioEngine';

export type ScreenId =
  | 'overview'
  | 'council'
  | 'world_map'
  | 'diplomacy'
  | 'parliament'
  | 'economy'
  | 'security'
  | 'media'
  | 'chronicle'
  | 'settings';

interface HeaderHUDProps {
  state: GameState;
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onAdvanceTurn: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  state,
  activeScreen,
  onNavigate,
  onAdvanceTurn,
  isMuted,
  onToggleMute
}) => {
  const { stats, turn, maxTurns } = state;
  const turnsLeft = maxTurns - turn + 1;

  // Season label
  const seasonsKu = ['بەهار', 'هاوین', 'پاییز', 'زستان'];
  const currentSeason = seasonsKu[(turn - 1) % 4];
  const currentYear = 2026 + Math.floor((turn - 1) / 4);

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1, 2, 3: Top Bar Contract */}
      <div className="flex items-center justify-between gap-8 px-4 lg:px-8 py-3 max-w-7xl mx-auto">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-amber-500 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
            ST
          </div>
          <button
            onClick={() => onNavigate('overview')}
            className="text-right font-display text-base lg:text-lg font-bold tracking-tight text-slate-100 hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
          >
            THE SOVEREIGN TABLE · مێزی باڵادەست
          </button>
        </div>

        {/* Zone 2: Navigation Links (single-line, whitespace-nowrap) */}
        <nav className="hidden xl:flex items-center gap-5 text-xs font-medium text-slate-300">
          <button
            onClick={() => onNavigate('overview')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeScreen === 'overview' ? 'text-amber-400 font-bold border-b-2 border-amber-400' : 'hover:text-white'
            }`}
          >
            دیمەنی نیشتمانی
          </button>
          <button
            onClick={() => onNavigate('council')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeScreen === 'council' ? 'text-amber-400 font-bold border-b-2 border-amber-400' : 'hover:text-white'
            }`}
          >
            ئەنجومەنی وەزیران
          </button>
          <button
            onClick={() => onNavigate('world_map')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeScreen === 'world_map' ? 'text-amber-400 font-bold border-b-2 border-amber-400' : 'hover:text-white'
            }`}
          >
            نەخشەی جیهانی
          </button>
          <button
            onClick={() => onNavigate('diplomacy')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeScreen === 'diplomacy' ? 'text-amber-400 font-bold border-b-2 border-amber-400' : 'hover:text-white'
            }`}
          >
            دیپلۆماسی
          </button>
          <button
            onClick={() => onNavigate('parliament')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeScreen === 'parliament' ? 'text-amber-400 font-bold border-b-2 border-amber-400' : 'hover:text-white'
            }`}
          >
            پەرلەمان
          </button>
          <button
            onClick={() => onNavigate('economy')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeScreen === 'economy' ? 'text-amber-400 font-bold border-b-2 border-amber-400' : 'hover:text-white'
            }`}
          >
            ئابووری و شارەکان
          </button>
          <button
            onClick={() => onNavigate('security')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeScreen === 'security' ? 'text-amber-400 font-bold border-b-2 border-amber-400' : 'hover:text-white'
            }`}
          >
            ئاسایش
          </button>
          <button
            onClick={() => onNavigate('media')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeScreen === 'media' ? 'text-amber-400 font-bold border-b-2 border-amber-400' : 'hover:text-white'
            }`}
          >
            راگەیاندن
          </button>
          <button
            onClick={() => onNavigate('chronicle')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeScreen === 'chronicle' ? 'text-amber-400 font-bold border-b-2 border-amber-400' : 'hover:text-white'
            }`}
          >
            تۆماری بڕیارەکان
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeScreen === 'settings' ? 'text-amber-400 font-bold border-b-2 border-amber-400' : 'hover:text-white'
            }`}
          >
            رێکخستن
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (Advance Turn) + Audio Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleMute}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800/60 transition-colors"
            title={isMuted ? 'دەنگ کارابکە' : 'دەنگ بێدەنگ بکە'}
            aria-label="Toggle Audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-teal-400" />}
          </button>

          <button
            onClick={() => {
              sound.playTurnAdvance();
              onAdvanceTurn();
            }}
            disabled={state.isGameOver}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-teal-400 hover:from-amber-300 hover:to-teal-300 rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>پێشڕەوی وەرزی نوێ ({turn}/{maxTurns})</span>
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Screen Selector Bar */}
      <div className="xl:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-slate-900 text-xs">
        {[
          { id: 'overview', label: 'نیشتمانی' },
          { id: 'council', label: 'ئەنجومەن' },
          { id: 'world_map', label: 'نەخشە' },
          { id: 'diplomacy', label: 'دیپلۆماسی' },
          { id: 'parliament', label: 'پەرلەمان' },
          { id: 'economy', label: 'ئابووری' },
          { id: 'security', label: 'ئاسایش' },
          { id: 'media', label: 'راگەیاندن' },
          { id: 'chronicle', label: 'مێژوو' },
          { id: 'settings', label: 'پاشەکەوت' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as ScreenId)}
            className={`px-2.5 py-1 rounded whitespace-nowrap shrink-0 text-xs transition-colors ${
              activeScreen === item.id ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Presidential KPI Strip: Clean Unboxed Metadata */}
      <div className="bg-slate-900/80 border-t border-slate-800/60 px-4 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto text-[11px] lg:text-xs text-slate-300">
          <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
            <span className="font-semibold text-amber-300">وەرزی {turn}: {currentSeason} {currentYear}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">هەڵبژاردن: {turnsLeft > 0 ? `${turnsLeft} وەرز ماوە` : 'ئەم وەرزە!'}</span>
          </div>

          <div className="flex items-center gap-4 whitespace-nowrap shrink-0 tabular-nums">
            <span title="خەزێنەی گشتی">
              خەزێنە: <strong className="text-emerald-400">${stats.treasuryBillion}B</strong>
            </span>
            <span className="text-slate-600">·</span>
            <span title="قەرزی نیشتمانی">
              قەرز: <span className="text-slate-400">${stats.debtBillion}B</span>
            </span>
            <span className="text-slate-600">·</span>
            <span title="ڕێژەی هەڵئاوسان">
              هەڵئاوسان: <strong className={stats.inflationPct > 7 ? 'text-rose-400' : 'text-amber-300'}>{stats.inflationPct}%</strong>
            </span>
            <span className="text-slate-600">·</span>
            <span title="یەدەگی وزە">
              وزە: <strong className={stats.energyReservesPct < 30 ? 'text-rose-400' : 'text-teal-300'}>{stats.energyReservesPct}%</strong>
            </span>
            <span className="text-slate-600">·</span>
            <span title="ڕای گشتی هاوڵاتیان">
              ڕای گشتی: <strong className={stats.publicApprovalPct > 50 ? 'text-emerald-400' : 'text-amber-400'}>{stats.publicApprovalPct}%</strong>
            </span>
            <span className="text-slate-600">·</span>
            <span title="سەقامگیری هاوپەیمانی حکومەت">
              سەقامگیری: <strong className={stats.governmentStabilityPct < 35 ? 'text-rose-400' : 'text-slate-200'}>{stats.governmentStabilityPct}%</strong>
            </span>
          </div>

          {state.activeCrisesCount > 0 && (
            <div className="flex items-center gap-1 text-rose-400 font-semibold whitespace-nowrap shrink-0">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>{state.activeCrisesCount} قەیرانی بەپەلە</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
