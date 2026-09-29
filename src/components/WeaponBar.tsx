import React from 'react';
import { Weapon } from '../types/game';
import { WEAPONS } from '../utils/weapons';

interface WeaponBarProps {
  currentWeapon: Weapon;
  onSelectWeapon: (weapon: Weapon) => void;
}

export const WeaponBar: React.FC<WeaponBarProps> = ({ currentWeapon, onSelectWeapon }) => {
  return (
    <div className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 md:gap-2 bg-slate-950/80 border border-slate-800/80 p-1.5 rounded-xl backdrop-blur-md shadow-2xl z-20">
      {WEAPONS.map((wpn, idx) => {
        const isSelected = wpn.id === currentWeapon.id;
        return (
          <button
            key={wpn.id}
            onClick={() => onSelectWeapon(wpn)}
            className={`group relative flex flex-col items-center justify-between px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer min-w-[70px] md:min-w-[84px] ${
              isSelected
                ? 'bg-emerald-950/50 border-emerald-400/80 text-white shadow-md shadow-emerald-900/20'
                : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            {/* Slot hotkey number */}
            <span className="absolute top-1 left-1.5 text-[9px] font-mono font-bold text-slate-500 group-hover:text-slate-300">
              [{idx + 1}]
            </span>

            {/* Weapon Preview thumbnail */}
            <div className="w-9 h-7 flex items-center justify-center my-0.5">
              {wpn.image ? (
                <img
                  src={wpn.image}
                  alt={wpn.name}
                  className="max-h-full max-w-full object-contain filter drop-shadow group-hover:scale-105 transition-transform"
                />
              ) : (
                <span className="text-xs font-mono">{wpn.type}</span>
              )}
            </div>

            {/* Name label */}
            <span className="text-[10px] md:text-[11px] font-bold tracking-tight truncate max-w-[70px] font-['Rajdhani']">
              {wpn.name.split(' ')[0]}
            </span>
          </button>
        );
      })}
    </div>
  );
};
