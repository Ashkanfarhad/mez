import React, { useRef, useState } from 'react';
import { GameState } from '../../types/game';
import { sound } from '../../engine/audioEngine';
import {
  Save,
  Download,
  Upload,
  RotateCcw,
  Volume2,
  VolumeX,
  BookOpen,
  Check,
  ShieldCheck
} from 'lucide-react';

interface SettingsScreenProps {
  state: GameState;
  onSaveGame: (slot: number) => void;
  onLoadGame: (slot: number) => void;
  onImportGame: (importedState: GameState) => void;
  onResetGame: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  state,
  onSaveGame,
  onLoadGame,
  onImportGame,
  onResetGame,
  isMuted,
  onToggleMute
}) => {
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManualSave = (slot: number) => {
    sound.playGavel();
    onSaveGame(slot);
    setSaveStatus(`یارییەکە بە سەرکەوتوویی لە خانەی ${slot} پاشەکەوت کرا (وەرزی ${state.turn})!`);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleManualLoad = (slot: number) => {
    sound.playClick();
    onLoadGame(slot);
    setSaveStatus(`یارییەکە لە خانەی ${slot} بارکرایەوە!`);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleExport = () => {
    sound.playClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sovereign_table_save_turn_${state.turn}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setSaveStatus('فایلی پاشەکەوتی یاری دابەزێنرا!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.stats && json.countries && json.turn) {
          sound.playGavel();
          onImportGame(json);
          setSaveStatus('فایلی پاشەکەوت بە سەرکەوتوویی هاوردە کرا!');
        } else {
          alert('فایلەکە بەڵگەنامەی ڕێگەپێدراوی یارییەکە نییە!');
        }
      } catch (err) {
        alert('هەڵە لە خوێندنەوەی فایلی JSON روویدا!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <span className="text-amber-400 text-xs font-mono uppercase tracking-wider">
          سیستەمی دەوڵەت و پاشەکەوتکردن
        </span>
        <h2 className="text-2xl lg:text-3xl font-display font-bold text-slate-100">
          ڕێکخستنەکان و پاراستنی دۆخی یاری
        </h2>
        <p className="text-slate-300 text-xs lg:text-sm mt-1">
          پاشەکەوتکردنی دەستی و ئۆتۆماتیک، هاوردە و هەناردەی فایلەکانی یاری، و دەستکاریکردنی دەنگ.
        </p>
      </div>

      {saveStatus && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-200 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Save Slots & Export Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manual Save & Load Slots */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Save className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-sm">
              خانەکانی پاشەکەوتکردنی ناوخۆیی (Save Slots)
            </h3>
          </div>

          <div className="space-y-3">
            {[1, 2, 3].map((slot) => {
              const savedItem = localStorage.getItem(`sovereign_table_slot_${slot}`);
              let slotInfo = 'خاڵی و بەتاڵە';
              if (savedItem) {
                try {
                  const parsed = JSON.parse(savedItem);
                  slotInfo = `وەرزی ${parsed.turn} · خەزێنە: $${parsed.stats?.treasuryBillion}B`;
                } catch {
                  slotInfo = 'پاشەکەوتکراو';
                }
              }

              return (
                <div
                  key={slot}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-200 block">خانەی {slot}</span>
                    <span className="text-[11px] text-slate-400">{slotInfo}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleManualSave(slot)}
                      className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors"
                    >
                      پاشەکەوت
                    </button>
                    {savedItem && (
                      <button
                        onClick={() => handleManualLoad(slot)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors border border-slate-700"
                      >
                        بارکردنەوە
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Export & Import JSON */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Download className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-slate-100 text-sm">
              هەناردە و هاوردەکردنی فایل (JSON Import/Export)
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            دەتوانن هەموو دۆخی پێشکەوتنی یارییەکەتان وەک فایلی سەربەخۆ دابەزێنن بۆ ئامێرەکەتان یان فایلی کۆن باربکەنەوە.
          </p>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleExport}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-teal-400" />
              <span>دابەزاندنی فایلی پاشەکەوتی ئەم وەرزە (JSON)</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>بارکردنەوەی فایلی یاری لە ئامێرەکەتەوە</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Audio Controls & Reset Game */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Volume2 className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-sm">دەنگ و کاریگەرییە ژینگەییەکان</h3>
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-300">دەنگی چەکوچی پەرلەمان، واژۆی پەیمان و بروسکەی بەپەلە</span>
            <button
              onClick={() => {
                onToggleMute();
                sound.playClick();
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-teal-400" />}
              <span>{isMuted ? 'دەنگ بێدەنگە' : 'دەنگ چالاکە'}</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <RotateCcw className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-slate-100 text-sm">دەستپێکردنەوەی سیناریۆ (Restart)</h3>
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400">گەڕانەوە بۆ وەرزی یەکەم و دەستبەکاربوونی نوێی سەرۆک</span>
            <button
              onClick={() => {
                if (confirm('دڵنیایت لە دەستپێکردنەوەی سیناریۆ لە وەرزی یەکەمەوە؟ هەموو بڕیارەکان دەسڕدرێنەوە.')) {
                  sound.playGavel();
                  onResetGame();
                }
              }}
              className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-colors"
            >
              دەستپێکردنەوە لە سەرەتا
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
