import React from 'react';
import { GameMode } from '../types/game';
import { X, Target, Zap, Activity, Eye, ShieldAlert } from 'lucide-react';

interface ModeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
}

export const ModeSelectorModal: React.FC<ModeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  onSelectMode,
}) => {
  if (!isOpen) return null;

  const modes: {
    id: GameMode;
    title: string;
    badge: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'CLASSIC_DEMO',
      title: 'Classic FF Demo (Original)',
      badge: 'KOTLIN PORT',
      description: 'The exact original training zone: 6 targets, moving columns, 100pt headshots, 25pt body hits, and infinite practice.',
      icon: Target,
    },
    {
      id: 'REFLEX_DRILL',
      title: '60s Reflex Challenge',
      badge: 'RANKED',
      description: 'Test your reaction speed, combo streaks, and flick precision within a 60-second timed competitive session.',
      icon: Zap,
    },
    {
      id: 'MOVING_TARGETS',
      title: 'Moving Rails Tracking',
      badge: 'TRACKING',
      description: 'ESP dummy targets patrol dynamically on lateral training rails at variable speeds to sharpen tracking mechanics.',
      icon: Activity,
    },
    {
      id: 'SNIPER_RANGE',
      title: 'Long Distance Sniper Range',
      badge: 'PRECISION',
      description: 'Distant targets from 35m to 100m. Utilize the 8x sniper optical scope to land surgical long-range eliminations.',
      icon: Eye,
    },
    {
      id: 'ONE_TAP_HEADSHOT',
      title: 'One-Tap Headshot Only',
      badge: 'HARDCORE',
      description: 'Body shots ricochet harmlessly off Kevlar armor. Only crisp red headshots register scores and eliminate targets.',
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold font-['Teko'] uppercase tracking-wider text-white">
              Select Training Routine
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Choose your practice scenario for the training zone
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode List */}
        <div className="flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {modes.map((m) => {
            const Icon = m.icon;
            const isSelected = m.id === currentMode;
            return (
              <div
                key={m.id}
                onClick={() => {
                  onSelectMode(m.id);
                  onClose();
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                  isSelected
                    ? 'bg-emerald-950/30 border-emerald-400/80 shadow-lg shadow-emerald-950/40'
                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div
                  className={`p-2.5 rounded-lg mt-0.5 ${
                    isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-['Rajdhani'] font-bold text-lg text-white">
                      {m.title}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {m.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="self-center text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-400/30">
                    ACTIVE
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
