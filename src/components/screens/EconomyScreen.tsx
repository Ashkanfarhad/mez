import React, { useState } from 'react';
import { GameState, CityData } from '../../types/game';
import { sound } from '../../engine/audioEngine';
import {
  Coins,
  TrendingUp,
  Building2,
  Anchor,
  Factory,
  Zap,
  Wheat,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface EconomyScreenProps {
  state: GameState;
  onUpdateTaxRate: (newRate: number) => void;
  onInvestInCity: (cityId: string, projectName: string, costBillion: number) => void;
}

export const EconomyScreen: React.FC<EconomyScreenProps> = ({
  state,
  onUpdateTaxRate,
  onInvestInCity
}) => {
  const [selectedCityId, setSelectedCityId] = useState<string>('veyra');
  const [tempTaxRate, setTempTaxRate] = useState<number>(state.stats.taxRatePct);

  const selectedCity: CityData = state.cities[selectedCityId] || state.cities.veyra;

  const CITY_PROJECTS: Record<string, { nameKu: string; costBillion: number; descKu: string; benefitKu: string }[]> = {
    veyra: [
      {
        nameKu: 'نوێکردنەوەی تۆڕی کارەبای پایتەخت',
        costBillion: 3.5,
        descKu: 'گۆڕینی کێبڵە کۆنەکان بە تۆڕی زیرەکی دیجیتاڵی بۆ کەمکردنەوەی بەفیڕۆچوونی کارەبا.',
        benefitKu: '+8% ژێرخان، +5% یەدەگی وزە'
      },
      {
        nameKu: 'هێڵی شەمەندەفەری خێرای وەیرا-لۆریان',
        costBillion: 5.0,
        descKu: 'بەستنەوەی پایتەختی سیاسی بە بەندەری لۆریان لە ماوەی ٤٥ خولەکدا.',
        benefitKu: '+1.4% گەشەی GDP، -1% بێکاری'
      }
    ],
    lorian: [
      {
        nameKu: 'قۆناغی دووەمی بەندەری قووڵی بازرگانی',
        costBillion: 4.2,
        descKu: 'فراوانکردنی لەنگەری کەشتییە زەبەلاحەکان و کۆنتێنەرەکانی یەکێتیی کالدۆر.',
        benefitKu: '+1.6% گەشەی GDP، +$2.5B داهاتی گومرگ'
      },
      {
        nameKu: 'سەکۆی هەناردە و پاشەکەوتکردنی گازی شل (LNG)',
        costBillion: 3.8,
        descKu: 'دروستکردنی گەورەترین عەمباری هایدرۆکاربۆن بۆ هاوردەی نەوتی سەحران.',
        benefitKu: '+18% یەدەگی وزە، کەمکردنەوەی هەڕەشەی دراڤیک'
      }
    ],
    meros: [
      {
        nameKu: 'کۆمپلێکسی پیشەسازی پۆڵا و بەرهەمهێنانی چەک',
        costBillion: 3.0,
        descKu: 'مۆدێرنکردنی کارگەکانی مێرۆس بە تەکنەلۆژیای نیشتمانی بۆ دروستکردنی کەلوپەلی بەرگری.',
        benefitKu: '+12% ئامادەیی سوپا، -1.5% بێکاری لە مێرۆس'
      },
      {
        nameKu: 'پارکی پیشەسازی هایدرۆجین و سەوز',
        costBillion: 2.8,
        descKu: 'بەکارهێنانی پاشماوەی کانزاکان بۆ بەرهەمهێنانی سووتەمەنی خاوێن.',
        benefitKu: '+6% ژێرخان، -0.8% هەڵئاوسان'
      }
    ]
  };

  const handleApplyTaxRate = () => {
    sound.playClick();
    onUpdateTaxRate(tempTaxRate);
  };

  const handleFundProject = (projectName: string, costBillion: number) => {
    if (state.stats.treasuryBillion < costBillion) {
      alert('خەزێنەی دەوڵەت بەشی ئەم تێچووە ناکات!');
      return;
    }
    sound.playGavel();
    onInvestInCity(selectedCity.id, projectName, costBillion);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <span className="text-amber-400 text-xs font-mono uppercase tracking-wider">
          دارایی نیشتمانی و پەرەپێدانی شارەکان
        </span>
        <h2 className="text-2xl lg:text-3xl font-display font-bold text-slate-100">
          بەڕێوەبردنی ئابووری و شارە مەزنەکان
        </h2>
        <p className="text-slate-300 text-xs lg:text-sm mt-1">
          کۆنترۆڵی باج، هەڵئاوسان، پاشەکەوتی وزە و خۆراک، و پڕۆژە ستراتیژییەکانی وەیرا، لۆریان و مێرۆس.
        </p>
      </div>

      {/* Macroeconomic Dashboard Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] block">خەزێنەی گشتی</span>
          <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
            ${state.stats.treasuryBillion}B
          </span>
          <span className="text-[10px] text-slate-400 block">پاشەکەوتی نەختینە</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] block">قەرزی دەوڵەت</span>
          <span className="text-xl font-bold font-mono text-slate-300 tabular-nums">
            ${state.stats.debtBillion}B
          </span>
          <span className="text-[10px] text-slate-400 block">سوو: ساڵانە 4.8%</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] block">گەشەی ئابووری (GDP)</span>
          <span className="text-xl font-bold font-mono text-teal-400 tabular-nums">
            +{state.stats.gdpGrowthPct}%
          </span>
          <span className="text-[10px] text-slate-400 block">ساڵانە پێشبینیکراو</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] block">ڕێژەی هەڵئاوسان</span>
          <span className={`text-xl font-bold font-mono tabular-nums ${state.stats.inflationPct > 7 ? 'text-rose-400' : 'text-amber-400'}`}>
            {state.stats.inflationPct}%
          </span>
          <span className="text-[10px] text-slate-400 block">نرخی کاڵا و گواستنەوە</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] block">ڕێژەی بێکاری</span>
          <span className="text-xl font-bold font-mono text-amber-300 tabular-nums">
            {state.stats.unemploymentPct}%
          </span>
          <span className="text-[10px] text-slate-400 block">هێزی کاری چالاک</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] block">یەدەگی وزە</span>
          <span className={`text-xl font-bold font-mono tabular-nums ${state.stats.energyReservesPct < 30 ? 'text-rose-400' : 'text-teal-300'}`}>
            {state.stats.energyReservesPct}%
          </span>
          <span className="text-[10px] text-slate-400 block">گاز و هایدرۆکاربۆن</span>
        </div>
      </div>

      {/* Tax Policy Control Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-sm">
              دەستکاریکردنی ڕێژەی باجی نیشتمانی (Tax Rate Policy)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            ڕێژەی ئێستا: <strong className="text-amber-300">{state.stats.taxRatePct}%</strong>
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>باجی نزم (١٠٪) · گەشەی خێرا بەڵام خەزێنەی بەتاڵ</span>
              <span className="font-mono font-bold text-amber-400 text-base">{tempTaxRate}%</span>
              <span>باجی بەرز (٤٥٪) · داهاتی زۆر بەڵام ناڕەزایەتی هاوڵاتی</span>
            </div>
            <input
              type="range"
              min="10"
              max="45"
              step="1"
              value={tempTaxRate}
              onChange={(e) => setTempTaxRate(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          <button
            onClick={handleApplyTaxRate}
            disabled={tempTaxRate === state.stats.taxRatePct}
            className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs disabled:opacity-40 transition-colors shadow-md shrink-0"
          >
            پەسەندکردنی ڕێژەی باجی نوێ
          </button>
        </div>
      </div>

      {/* Cities Showcase and Investment Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* City Visual & Switcher (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
          {/* City Selector Tabs */}
          <div className="flex items-center gap-2 p-4 bg-slate-950 border-b border-slate-800 overflow-x-auto text-xs">
            {Object.values(state.cities).map((city) => (
              <button
                key={city.id}
                onClick={() => {
                  setSelectedCityId(city.id);
                  sound.playClick();
                }}
                className={`px-4 py-2 rounded-xl whitespace-nowrap shrink-0 transition-colors flex items-center gap-2 ${
                  selectedCityId === city.id
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {city.id === 'veyra' && <Building2 className="w-4 h-4" />}
                {city.id === 'lorian' && <Anchor className="w-4 h-4" />}
                {city.id === 'meros' && <Factory className="w-4 h-4" />}
                <span>{city.nameKu}</span>
              </button>
            ))}
          </div>

          {/* City Image Viewport */}
          <div className="relative h-64 md:h-72 w-full overflow-hidden">
            <img
              src={selectedCity.image}
              alt={selectedCity.nameKu}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-5">
              <h3 className="text-2xl font-display font-bold text-slate-100">
                {selectedCity.nameKu}
              </h3>
              <p className="text-slate-300 text-xs mt-1">{selectedCity.specialtyKu}</p>
            </div>
          </div>

          {/* City Metrics */}
          <div className="p-5 grid grid-cols-3 gap-3 text-xs bg-slate-950/60 border-t border-slate-800">
            <div>
              <span className="text-slate-400 block text-[10px]">دانیشتووان</span>
              <span className="font-bold text-slate-200">{selectedCity.population}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">ڕێژەی بێکاری شار</span>
              <span className="font-mono text-amber-300">{selectedCity.unemployment}%</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">ئاستی ژێرخان</span>
              <span className="font-mono text-teal-400">{selectedCity.infrastructureLevel}/100</span>
            </div>
          </div>
        </div>

        {/* City Investment Projects (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="font-bold text-slate-100 text-sm">
              پڕۆژە ستراتیژییەکانی پەرەپێدانی {selectedCity.nameKu}
            </h4>
            <span className="text-xs text-amber-400 font-mono">خەزێنە: ${state.stats.treasuryBillion}B</span>
          </div>

          <div className="space-y-3">
            {(CITY_PROJECTS[selectedCity.id] || []).map((proj, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <h5 className="font-bold text-slate-200">{proj.nameKu}</h5>
                  <span className="font-mono text-amber-400 font-semibold shrink-0">
                    ${proj.costBillion}B
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">{proj.descKu}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <span className="text-emerald-400 text-[11px]">{proj.benefitKu}</span>
                  <button
                    onClick={() => handleFundProject(proj.nameKu, proj.costBillion)}
                    disabled={state.stats.treasuryBillion < proj.costBillion}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-slate-950 font-bold text-[11px] transition-colors"
                  >
                    وەبەرهێنان
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
