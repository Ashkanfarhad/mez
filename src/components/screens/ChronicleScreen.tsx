import React, { useState, useMemo } from 'react';
import { GameState, ChronicleRecord } from '../../types/game';
import {
  History,
  Clock,
  Search,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Filter,
  ShieldAlert,
  FileText,
  Users,
  Eye,
  Vote
} from 'lucide-react';

interface ChronicleScreenProps {
  state: GameState;
}

type CategoryFilter = 'all' | 'decision' | 'council_dialogue' | 'intelligence_leak' | 'crisis' | 'parliament' | 'delayed_consequence';

export const ChronicleScreen: React.FC<ChronicleScreenProps> = ({ state }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [selectedTurnFilter, setSelectedTurnFilter] = useState<number | 'all'>('all');
  const [secretFilter, setSecretFilter] = useState<'all' | 'public' | 'secret'>('all');

  const pendingConsequences = state.delayedConsequences.filter((c) => !c.executed);
  const executedConsequences = state.delayedConsequences.filter((c) => c.executed);

  // Available turns in chronicle
  const turns = useMemo(() => {
    const set = new Set<number>();
    state.chronicle.forEach((c) => set.add(c.turn));
    return Array.from(set).sort((a, b) => b - a);
  }, [state.chronicle]);

  // Filtered chronicle items
  const filteredRecords = useMemo(() => {
    return state.chronicle.filter((entry) => {
      // 1. Category filter
      if (selectedCategory !== 'all') {
        if (entry.category !== selectedCategory) return false;
      }

      // 2. Turn filter
      if (selectedTurnFilter !== 'all') {
        if (entry.turn !== selectedTurnFilter) return false;
      }

      // 3. Secret vs Public filter
      if (secretFilter === 'public' && entry.isSecret) return false;
      if (secretFilter === 'secret' && !entry.isSecret && entry.category !== 'intelligence_leak') return false;

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = entry.titleKu?.toLowerCase().includes(q) || false;
        const contentMatch = entry.contentKu?.toLowerCase().includes(q) || false;
        const descMatch = (entry as any).descriptionKu?.toLowerCase().includes(q) || false;
        const impactMatch = entry.impactSummaryKu?.toLowerCase().includes(q) || false;
        const topicMatch = entry.topicKu?.toLowerCase().includes(q) || false;
        if (!titleMatch && !contentMatch && !descMatch && !impactMatch && !topicMatch) {
          return false;
        }
      }

      return true;
    });
  }, [state.chronicle, selectedCategory, selectedTurnFilter, secretFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <span className="text-amber-400 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-amber-400" />
          مێژووی فەرمی کۆمار و دۆسیە نهێنییەکان
        </span>
        <h2 className="text-2xl lg:text-3xl font-display font-bold text-slate-100 mt-1">
          تۆماری مێژوویی بڕیارەکان و لێکەوتە سیاسییەکان (Chronicle)
        </h2>
        <p className="text-slate-300 text-xs lg:text-sm mt-1">
          ئەرشیفێکی نەگۆڕ و گەڕانپێکراو بۆ هەموو بڕیارەکانی سەرۆکایەتی، کۆبوونەوەکانی کابینە، رێککەوتنە نهێنییەکان و قەیرانە نەتەوەییەکان.
        </p>
      </div>

      {/* Delayed Consequences Radar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-sm">
              دەرئەنجامە درێژخایەنە دواکەوتووەکان (Delayed Consequences Radar)
            </h3>
          </div>
          <span className="text-xs text-amber-300 font-mono">
            {pendingConsequences.length} دەرئەنجامی چاوەڕوانکراو
          </span>
        </div>

        {pendingConsequences.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">
            لە ئێستادا هیچ دەرئەنجامێکی دواکەوتوو چاوەڕوانکراو نییە. بڕیارە مێژووییەکانی داهاتوو کاریگەرییان بە شێوەی شەپۆلی لە وەرزەکانی تردا بەردەوام دەبێت.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingConsequences.map((c) => {
              const turnsRemaining = c.triggerTurn - state.turn;
              return (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 text-sm">{c.headlineKu}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] font-mono">
                      {turnsRemaining > 0 ? `دوای ${turnsRemaining} وەرز (وەرزی ${c.triggerTurn})` : 'ئەم وەرزە جێبەجێ دەبێت!'}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">{c.descriptionKu}</p>
                  <div className="pt-2 border-t border-amber-500/20 text-[11px] text-slate-400">
                    <span>سەرچاوەی بڕیار: </span>
                    <strong className="text-slate-200">وەرزی {c.originTurn} ({c.originDecisionTitleKu})</strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        {/* Top search & turn */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="گەڕان لە نێو بڕیارەکان، قەیرانەکان، ڕێککەوتنە نهێنییەکان و وتووێژەکان..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Turn selector */}
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <span className="text-xs text-slate-400">وەرز:</span>
            <select
              value={selectedTurnFilter}
              onChange={(e) => setSelectedTurnFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="all">هەموو وەرزەکان</option>
              {turns.map((t) => (
                <option key={t} value={t}>وەرزی {t}</option>
              ))}
            </select>

            {/* Secret vs Public */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setSecretFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${secretFilter === 'all' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                هەموو
              </button>
              <button
                onClick={() => setSecretFilter('public')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${secretFilter === 'public' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                ئاشکرا
              </button>
              <button
                onClick={() => setSecretFilter('secret')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${secretFilter === 'secret' ? 'bg-rose-500 text-white font-bold' : 'text-rose-400 hover:text-rose-300'}`}
              >
                <Lock className="w-3 h-3" />
                <span>نهێنی</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'هەموو بابەتەکان' },
            { id: 'decision', label: 'بڕیارەکانی دەوڵەت' },
            { id: 'council_dialogue', label: 'کۆبوونەوەی کابینە' },
            { id: 'intelligence_leak', label: 'ڕێککەوتن و دۆسیە نهێنییەکان' },
            { id: 'crisis', label: 'قەیرانەکان' },
            { id: 'parliament', label: 'یاساکانی پەرلەمان' },
            { id: 'delayed_consequence', label: 'دەرئەنجامە درێژخایەنەکان' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as CategoryFilter)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors border ${
                selectedCategory === cat.id
                  ? 'bg-slate-800 text-amber-300 border-amber-400/50 font-bold'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800/80 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Historical Chronicle Timeline & Feed */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-slate-100 text-sm">
              تۆماری رووداوەکان ({filteredRecords.length} تۆمار دۆزرایەوە)
            </h3>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            هیچ رووداو یان بڕیارێک بەم پێوەرانە نەدۆزرایەوە. دەتوانن گەڕانەکەتان پاک بکەنەوە.
          </div>
        ) : (
          <div className="relative border-r border-slate-800 mr-4 space-y-6 pr-6">
            {filteredRecords.map((entry) => {
              const isSecretEntry = entry.isSecret || entry.category === 'intelligence_leak';

              return (
                <div key={entry.id} className="relative space-y-2 text-xs">
                  {/* Dot on the timeline */}
                  <div
                    className={`absolute -right-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                      isSecretEntry
                        ? 'bg-rose-500 ring-2 ring-rose-500/30'
                        : entry.category === 'delayed_consequence'
                        ? 'bg-amber-400'
                        : entry.category === 'crisis'
                        ? 'bg-rose-500'
                        : entry.category === 'parliament'
                        ? 'bg-sky-400'
                        : entry.category === 'diplomacy'
                        ? 'bg-emerald-400'
                        : 'bg-teal-400'
                    }`}
                  />

                  {/* Header badges */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span className="font-mono text-amber-300 font-semibold">وەرزی {entry.turn}</span>
                    <span>·</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                      {entry.topicKu || entry.category}
                    </span>

                    {/* Secret or leak status */}
                    {isSecretEntry ? (
                      <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300 font-bold flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>دۆسیەی هەواڵگری نهێنی</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1">
                        <Unlock className="w-2.5 h-2.5 text-slate-500" />
                        <span>ئاشکرا بۆ ڕای گشتی</span>
                      </span>
                    )}

                    {entry.discoverySourceKu && (
                      <span className="text-teal-400 font-medium">
                        سەرچاوە: {entry.discoverySourceKu}
                      </span>
                    )}

                    {entry.impactSummaryKu && (
                      <>
                        <span>·</span>
                        <span className="text-amber-200/90">{entry.impactSummaryKu}</span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-bold text-slate-100 leading-snug">
                    {entry.titleKu}
                  </h4>

                  {/* Content or description */}
                  <p className="text-slate-300 text-xs leading-relaxed max-w-4xl">
                    {entry.contentKu || (entry as any).descriptionKu}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

