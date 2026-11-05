import React, { useState } from 'react';
import { GameState, Country } from '../../types/game';
import { sound } from '../../engine/audioEngine';
import {
  Globe,
  Shield,
  DollarSign,
  Handshake,
  Compass,
  ArrowRight
} from 'lucide-react';

interface WorldMapScreenProps {
  state: GameState;
  onSelectCountryForDiplomacy: (countryId: string) => void;
}

export const WorldMapScreen: React.FC<WorldMapScreenProps> = ({
  state,
  onSelectCountryForDiplomacy
}) => {
  const [selectedCountryId, setSelectedCountryId] = useState<string>('arven');

  const selectedCountry: Country = state.countries[selectedCountryId] || state.countries.arven;

  const handleCountryClick = (id: string) => {
    setSelectedCountryId(id);
    sound.playClick();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-amber-400 text-xs font-mono uppercase tracking-wider">
            دیپلۆماسی و ستراتیژی جیهانی
          </span>
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-slate-100">
            نەخشەی سیاسی و سەربازی هەشت وڵاتەکە
          </h2>
          <p className="text-slate-300 text-xs lg:text-sm mt-1">
            کلیک لەسەر خاکی هەر دەوڵەتێک بکە بۆ بینینی توانای سەربازی، ئابووری، و دەستپێکردنی گفتوگۆی دیپلۆماسی.
          </p>
        </div>

        {/* Quick Country Switcher Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {Object.values(state.countries).map((c) => (
            <button
              key={c.id}
              onClick={() => handleCountryClick(c.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 ${
                selectedCountryId === c.id
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <div
                className="w-4 h-2.5 rounded-sm overflow-hidden shrink-0"
                dangerouslySetInnerHTML={{ __html: c.flagSvg }}
              />
              <span>{c.nameKu.replace('کۆماری ', '').replace('یەکێتیی ', '').replace('شانشینی ', '').replace('میرنشینەکانی ', '').replace('فیدراسیۆنی ', '').replace('کۆنفیدراسیۆنی ', '')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map Viewport with 02-world-map.png */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 min-h-[500px] lg:min-h-[560px]">
        {/* Background Image */}
        <img
          src="/assets/02-world-map.png"
          alt="نەخشەی جیهانی ئارڤێن و حەوت دەوڵەتەکە"
          className="w-full h-full object-cover object-center select-none"
        />

        {/* Dynamic SVG Layer for Alliance & Trade Arcs */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Active Treaties Arcs connecting Arven (50, 52) to other countries */}
          {state.treatiesSigned.map((treaty, idx) => {
            const targetCountry = state.countries[treaty.countryId];
            if (!targetCountry) return null;
            return (
              <path
                key={idx}
                d={`M 50% 52% Q ${(50 + targetCountry.mapCoords.x) / 2}% ${(52 + targetCountry.mapCoords.y) / 2 - 8}% ${targetCountry.mapCoords.x}% ${targetCountry.mapCoords.y}%`}
                fill="none"
                stroke="#00f5d4"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                className="opacity-80"
              />
            );
          })}
        </svg>

        {/* Interactive Country Markers / Capital Pins */}
        {Object.values(state.countries).map((country) => {
          const isSelected = selectedCountryId === country.id;
          const isArven = country.id === 'arven';
          const relations = country.relationsWithArven;

          return (
            <div
              key={country.id}
              onClick={() => handleCountryClick(country.id)}
              style={{
                left: `${country.mapCoords.x}%`,
                top: `${country.mapCoords.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              className="absolute z-20 cursor-pointer group"
            >
              {/* Ping Ring for Selected */}
              {isSelected && (
                <div className="absolute -inset-3 rounded-full bg-amber-400/30 animate-ping-slow pointer-events-none" />
              )}

              {/* Marker Pin */}
              <div
                className={`p-1.5 rounded-full shadow-2xl transition-all duration-200 flex items-center justify-center ${
                  isArven
                    ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/40 scale-125'
                    : isSelected
                    ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/50 scale-110'
                    : relations > 30
                    ? 'bg-teal-500 text-slate-950 hover:scale-110'
                    : relations < -20
                    ? 'bg-rose-500 text-white hover:scale-110'
                    : 'bg-slate-800 text-slate-200 border border-slate-600 hover:scale-110'
                }`}
              >
                <div
                  className="w-5 h-3.5 rounded-sm overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: country.flagSvg }}
                />
              </div>

              {/* Country Label Tag */}
              <div
                className={`mt-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap shadow-lg backdrop-blur-md transition-all text-center ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 scale-105 font-bold'
                    : 'bg-slate-950/85 text-slate-200 border border-slate-800 group-hover:bg-slate-900 group-hover:text-white'
                }`}
              >
                <span>{country.capitalKu.split(' ')[0]}</span>
                <span className="block text-[9px] opacity-75">{country.nameKu.split(' ')[1] || country.nameKu}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Country Detail Inspector (Side-by-Side or Bottom Card) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-11 rounded-lg overflow-hidden shadow-md shrink-0 border border-slate-700"
              dangerouslySetInnerHTML={{ __html: selectedCountry.flagSvg }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-100">
                  {selectedCountry.nameKu}
                </h3>
                <span className="text-xs text-slate-400 font-mono">({selectedCountry.nameEn})</span>
              </div>
              <p className="text-xs text-amber-400 font-medium">
                {selectedCountry.leaderTitleKu}: {selectedCountry.leaderKu}
              </p>
            </div>
          </div>

          {selectedCountry.id !== 'arven' && (
            <button
              onClick={() => onSelectCountryForDiplomacy(selectedCountry.id)}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-md flex items-center gap-2 self-start lg:self-auto"
            >
              <span>دەستپێکردنی دانوستاندنی دیپلۆماسی</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block mb-1">سیستەمی دەسەڵات</span>
            <span className="font-semibold text-slate-200">{selectedCountry.governmentKu}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block mb-1">کۆی بەرهەمی ناوخۆ (GDP)</span>
            <span className="font-semibold text-emerald-400 font-mono tabular-nums">
              ${selectedCountry.gdpBillions}B ملیار دۆلار
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block mb-1">ئامادەیی سوپا</span>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-400 rounded-full"
                  style={{ width: `${selectedCountry.militaryReadiness}%` }}
                />
              </div>
              <span className="font-mono text-teal-300">{selectedCountry.militaryReadiness}%</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block mb-1">پەیوەندی لەگەڵ ئارڤێن</span>
            <div className="flex items-center gap-2">
              <span
                className={`font-bold font-mono ${
                  selectedCountry.relationsWithArven > 25
                    ? 'text-emerald-400'
                    : selectedCountry.relationsWithArven < -20
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}
              >
                {selectedCountry.relationsWithArven > 0 ? '+' : ''}
                {selectedCountry.relationsWithArven}
              </span>
              <span className="text-[10px] text-slate-400">
                {selectedCountry.relationsWithArven > 25
                  ? 'هاوپەیمانی دۆستانە'
                  : selectedCountry.relationsWithArven < -20
                  ? 'ناکۆک و پڕمەترسی'
                  : 'هاوسەنگ'}
              </span>
            </div>
          </div>
        </div>

        {/* Country Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
            <h4 className="font-bold text-slate-200">کورتەی دۆخی سیاسی و هەرێمی:</h4>
            <p className="text-slate-300 leading-relaxed">{selectedCountry.bioKu}</p>
            <div className="pt-2">
              <span className="text-slate-400 font-semibold block mb-1">شارە سەرەکییەکان:</span>
              <div className="flex flex-wrap gap-2">
                {selectedCountry.cities.map((city, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300"
                  >
                    {city.nameKu} ({city.population}) · {city.roleKu}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-slate-400 font-semibold block mb-1">بەرژەوەندییە ستراتیژییەکان:</span>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                {selectedCountry.interestsKu.map((interest, idx) => (
                  <li key={idx}>{interest}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="text-slate-400 font-semibold block mb-1">دۆخی بازرگانی:</span>
              <span className="text-amber-300 font-medium">{selectedCountry.tradeStatusKu}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
