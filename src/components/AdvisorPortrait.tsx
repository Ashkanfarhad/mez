import React from 'react';
import { AdvisorId } from '../types/game';

interface AdvisorPortraitProps {
  id: AdvisorId;
  nameKu?: string;
  roleKu?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  loyalty?: number;
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32'
};

const SPRITE_POSITIONS: Record<AdvisorId, string> = {
  rayan: 'advisor-crop-rayan',
  lina: 'advisor-crop-lina',
  nara: 'advisor-crop-nara',
  sami: 'advisor-crop-sami',
  darok: 'advisor-crop-darok',
  mira: 'advisor-crop-mira'
};

export const AdvisorPortrait: React.FC<AdvisorPortraitProps> = ({
  id,
  nameKu,
  roleKu,
  size = 'md',
  showBadge = false,
  loyalty,
  className = ''
}) => {
  const spriteClass = SPRITE_POSITIONS[id] || 'advisor-crop-rayan';

  return (
    <div className={`relative inline-flex flex-col items-center group ${className}`}>
      <div
        className={`${SIZE_CLASSES[size]} rounded-xl border border-slate-700/80 shadow-lg advisor-crop ${spriteClass} overflow-hidden transition-transform duration-200 group-hover:scale-105`}
        title={nameKu}
      >
        {/* Subtle inner gold vignette overlay */}
        <div className="w-full h-full bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
      </div>

      {showBadge && loyalty !== undefined && (
        <div className="mt-1 flex items-center gap-1 text-[11px] font-mono tabular-nums text-slate-400">
          <span className="text-slate-400">دڵسۆزی:</span>
          <span className={loyalty > 65 ? 'text-emerald-400' : loyalty > 40 ? 'text-amber-400' : 'text-rose-400'}>
            {loyalty}%
          </span>
        </div>
      )}

      {nameKu && (
        <span className="mt-1 text-xs font-semibold text-slate-200 text-center truncate max-w-[120px]">
          {nameKu}
        </span>
      )}
      {roleKu && (
        <span className="text-[10px] text-slate-400 text-center truncate max-w-[120px]">
          {roleKu}
        </span>
      )}
    </div>
  );
};
