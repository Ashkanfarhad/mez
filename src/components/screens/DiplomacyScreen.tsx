import React, { useState } from 'react';
import { GameState, Country } from '../../types/game';
import { sound } from '../../engine/audioEngine';
import {
  Handshake,
  ShieldCheck,
  FileCheck2,
  Zap,
  Globe2,
  Sparkles,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';

interface DiplomacyScreenProps {
  state: GameState;
  initialSelectedCountryId?: string;
  onSignTreaty: (treaty: {
    countryId: string;
    typeKu: string;
    descriptionKu: string;
    relationDelta: number;
    statDelta?: any;
  }) => void;
}

export const DiplomacyScreen: React.FC<DiplomacyScreenProps> = ({
  state,
  initialSelectedCountryId,
  onSignTreaty
}) => {
  const [selectedCountryId, setSelectedCountryId] = useState<string>(
    initialSelectedCountryId && initialSelectedCountryId !== 'arven'
      ? initialSelectedCountryId
      : 'kaldor'
  );

  const [selectedTreatyType, setSelectedTreatyType] = useState<string>('trade');
  const [negotiationResult, setNegotiationResult] = useState<{
    outcome: 'accepted' | 'rejected' | 'counteroffer';
    statementKu: string;
    counterTermsKu?: string;
    relationChange: number;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const selectedCountry: Country = state.countries[selectedCountryId] || state.countries.kaldor;

  const TREATY_TEMPLATES = [
    {
      id: 'trade',
      nameKu: 'پەیماننامەی ئازادی بازرگانی و گومرگ',
      icon: Handshake,
      descriptionKu: 'کەمکردنەوەی ٥٠٪ باجی گومرگی لە بەندەری لۆریان و رێگەدان بە هاوردەی کەلوپەلی پیشەسازی.',
      requirementsKu: 'پەیوەندی لە سەرووی ٢٠ خاڵ پێویستە.',
      minRelations: 15,
      costBillion: 1.5,
      benefitKu: '+1.2% گەشەی GDP، +$3B داهات ساڵانە'
    },
    {
      id: 'defense',
      nameKu: 'پەیمانی بەرگری دەریایی و سەربازی هاوبەش',
      icon: ShieldCheck,
      descriptionKu: 'پابەندبوونی هەردوو دەوڵەت بە بەرگری لە کاتی هێرشی لایەنی سێیەم بۆ سەر سنوورەکان.',
      requirementsKu: 'پەیوەندی لە سەرووی ٤٠ خاڵ پێویستە.',
      minRelations: 35,
      costBillion: 2.0,
      benefitKu: '+15% ئامادەیی سەربازی و کەمکردنەوەی مەترسی دراڤیک'
    },
    {
      id: 'energy',
      nameKu: 'ڕێککەوتنی ستراتیژی دابینکردنی وزە و گاز',
      icon: Zap,
      descriptionKu: 'کڕینی نەوت یان گازی شل بە نرخی جێگیر لە بەندەرەکان بەبێ وابەستەبوون بە شاخەکانی باکوور.',
      requirementsKu: 'پەیوەندی لە سەرووی ٠ پێویستە.',
      minRelations: 0,
      costBillion: 3.5,
      benefitKu: '+20% یەدەگی وزە و سەقامگیری کارەبای هاوین'
    },
    {
      id: 'intelligence',
      nameKu: 'پەیمانی هاوبەشی زانیاری هەواڵگری و سایبەر',
      icon: FileCheck2,
      descriptionKu: 'ئاڵوگۆڕی زانیاری نهێنی لەسەر تۆڕە سیخوڕییەکان و هێرشە ئەلیکترۆنییەکان.',
      requirementsKu: 'پەیوەندی لە سەرووی ٢٥ پێویستە.',
      minRelations: 25,
      costBillion: 1.0,
      benefitKu: 'کەمکردنەوەی مەترسی دزەکردنی نهێنییەکان لە تازیرا'
    },
    {
      id: 'nonaggression',
      nameKu: 'پەیمانی پەلامارنەدان و کشانەوەی سنوور',
      icon: Globe2,
      descriptionKu: 'کشانەوەی هێزە قورسەکان بە دووری ٢٠ کیلۆمەتر لە خاڵە سنورییەکان.',
      requirementsKu: 'پەیوەندی لە سەرووی -١٠ پێویستە.',
      minRelations: -10,
      costBillion: 0.5,
      benefitKu: '+10% سەقامگیری حکومەت و دوورخستنەوەی جەنگ'
    }
  ];

  const activeTreaty = TREATY_TEMPLATES.find((t) => t.id === selectedTreatyType) || TREATY_TEMPLATES[0];

  const handleNegotiate = async () => {
    setIsLoading(true);
    setNegotiationResult(null);
    sound.playClick();

    try {
      const res = await fetch('/api/diplomacy/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryId: selectedCountry.id,
          treatyType: activeTreaty.nameKu,
          terms: {
            costBillion: activeTreaty.costBillion,
            benefitKu: activeTreaty.benefitKu
          },
          gameState: {
            turn: state.turn,
            countries: state.countries,
            stats: state.stats
          }
        })
      });

      const data = await res.json();
      setNegotiationResult(data);

      if (data.outcome === 'accepted') {
        sound.playSealStamp();
      } else {
        sound.playTeletype();
      }
    } catch (err) {
      console.error('Diplomacy failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignAcceptedTreaty = () => {
    if (!negotiationResult || negotiationResult.outcome !== 'accepted') return;

    sound.playSealStamp();
    onSignTreaty({
      countryId: selectedCountry.id,
      typeKu: activeTreaty.nameKu,
      descriptionKu: `${activeTreaty.nameKu} لە نێوان کۆماری ئارڤێن و ${selectedCountry.nameKu} واژۆکرا.`,
      relationDelta: negotiationResult.relationChange,
      statDelta: {
        treasuryBillion: -activeTreaty.costBillion,
        energyReservesPct: selectedTreatyType === 'energy' ? 15 : 0,
        militaryReadinessPct: selectedTreatyType === 'defense' ? 10 : 0
      }
    });

    setNegotiationResult(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <span className="text-amber-400 text-xs font-mono uppercase tracking-wider">
          پەیوەندییە نێودەوڵەتییەکان و پەیماننامەکان
        </span>
        <h2 className="text-2xl lg:text-3xl font-display font-bold text-slate-100">
          دیوانی دانوستاندنی دیپلۆماسی لەگەڵ وڵاتان
        </h2>
        <p className="text-slate-300 text-xs lg:text-sm mt-1">
          واژۆکردنی هاوپەیمانی سەربازی، بازرگانی، وزە و پەلامارنەدان لەگەڵ سەرکردەکانی ناوچەکە.
        </p>
      </div>

      {/* Country Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {Object.values(state.countries)
          .filter((c) => c.id !== 'arven')
          .map((country) => (
            <button
              key={country.id}
              onClick={() => {
                setSelectedCountryId(country.id);
                setNegotiationResult(null);
                sound.playClick();
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-all flex items-center gap-2 ${
                selectedCountryId === country.id
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-lg scale-102'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <div
                className="w-5 h-3.5 rounded-sm overflow-hidden"
                dangerouslySetInnerHTML={{ __html: country.flagSvg }}
              />
              <span>{country.nameKu}</span>
              <span
                className={`text-[10px] font-mono tabular-nums ${
                  country.relationsWithArven > 20
                    ? 'text-emerald-500 font-bold'
                    : country.relationsWithArven < -20
                    ? 'text-rose-500 font-bold'
                    : 'text-slate-400'
                }`}
              >
                ({country.relationsWithArven > 0 ? '+' : ''}
                {country.relationsWithArven})
              </span>
            </button>
          ))}
      </div>

      {/* Main Negotiation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Foreign Leader Profile & Active Treaties (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div
                className="w-14 h-9 rounded-md overflow-hidden shadow shrink-0 border border-slate-700"
                dangerouslySetInnerHTML={{ __html: selectedCountry.flagSvg }}
              />
              <div>
                <h3 className="font-bold text-slate-100 text-sm">{selectedCountry.nameKu}</h3>
                <span className="text-xs text-amber-400 block">{selectedCountry.leaderKu}</span>
                <span className="text-[10px] text-slate-400">{selectedCountry.leaderTitleKu}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">سیستەمی حوکمڕانی:</span>
                <span className="text-slate-200">{selectedCountry.governmentKu}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">پەیوەندی لەگەڵ ئارڤێن:</span>
                <span className={selectedCountry.relationsWithArven > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {selectedCountry.relationsWithArven} / 100
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">هێزی سەربازی:</span>
                <span className="text-teal-400 font-mono">{selectedCountry.militaryPower} / 100</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
              <strong className="text-slate-200 block mb-1">دۆخی دیپلۆماسی:</strong>
              {selectedCountry.bioKu}
            </div>
          </div>

          {/* Signed Treaties List */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <FileText className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-200">
                پەیماننامە فەرمییە واژۆکراوەکان ({state.treatiesSigned.length})
              </h4>
            </div>

            {state.treatiesSigned.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">هیچ پەیماننامەیەکی فەرمی هێشتا واژۆ نەکراوە.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {state.treatiesSigned.map((tr, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                    <span className="font-bold text-amber-300 block">{tr.typeKu}</span>
                    <span className="text-slate-400 text-[10px]">
                      دەوڵەت: {state.countries[tr.countryId]?.nameKu} · وەرزی {tr.turnSigned}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Treaty Proposal Drafting (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-base font-bold text-slate-100 pb-3 border-b border-slate-800 flex items-center gap-2">
            <Handshake className="w-5 h-5 text-amber-400" />
            <span>پێشنیارکردنی پەیماننامەی دیپلۆماسی بۆ {selectedCountry.nameKu}</span>
          </h3>

          {/* Treaty Category Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TREATY_TEMPLATES.map((treaty) => {
              const Icon = treaty.icon;
              const isSelected = selectedTreatyType === treaty.id;
              return (
                <div
                  key={treaty.id}
                  onClick={() => {
                    setSelectedTreatyType(treaty.id);
                    setNegotiationResult(null);
                    sound.playClick();
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-400/80 shadow-md ring-1 ring-amber-400/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{treaty.nameKu}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                        {treaty.descriptionKu}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Treaty Terms Summary */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">{activeTreaty.nameKu}</span>
              <span className="text-amber-400 font-mono">تێچووی سەرەتایی: ${activeTreaty.costBillion}B ملیار دۆلار</span>
            </div>
            <p className="text-slate-300 leading-relaxed">{activeTreaty.descriptionKu}</p>
            <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-800/60 text-slate-400 text-[11px]">
              <span>مەرج: {activeTreaty.requirementsKu}</span>
              <span>دەستکەوتی چاوەڕوانکراو: <strong className="text-emerald-400">{activeTreaty.benefitKu}</strong></span>
            </div>
          </div>

          {/* Negotiation Response Box */}
          {negotiationResult && (
            <div
              className={`p-5 rounded-xl border space-y-3 text-xs leading-relaxed ${
                negotiationResult.outcome === 'accepted'
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                  : negotiationResult.outcome === 'rejected'
                  ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                  : 'bg-amber-950/30 border-amber-500/50 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {negotiationResult.outcome === 'accepted' ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>پەیماننامەکە لەلایەن {selectedCountry.nameKu}ـەوە پەسەندکرا!</span>
                  </>
                ) : negotiationResult.outcome === 'rejected' ? (
                  <>
                    <XCircle className="w-5 h-5 text-rose-400" />
                    <span>پێشنیارەکە بە فەرمی رەتکرایەوە لەلایەن سەرکردەی دەوڵەتەوە.</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    <span>پێشنیاری جێگرەوە و مەرجداری دەوڵەتی {selectedCountry.nameKu}:</span>
                  </>
                )}
              </div>

              <p className="text-slate-200 italic">«{negotiationResult.statementKu}»</p>

              {negotiationResult.counterTermsKu && (
                <div className="p-3 bg-slate-900/60 rounded-lg border border-amber-500/30 text-amber-300">
                  <strong>مەرجی جێگرەوە:</strong> {negotiationResult.counterTermsKu}
                </div>
              )}

              {negotiationResult.outcome === 'accepted' && (
                <button
                  onClick={handleSignAcceptedTreaty}
                  className="mt-3 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>واژۆکردنی فەرمی و چەسپاندن لە تۆماری دەوڵەتدا</span>
                </button>
              )}
            </div>
          )}

          {/* Action Trigger */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={handleNegotiate}
              disabled={isLoading}
              className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'نێردراوی دیپلۆماسی لە کۆشکن...' : 'ناردنی شاندی دانوستانکار بۆ پایتەختی بیانی'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
