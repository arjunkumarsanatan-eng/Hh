import React from 'react';
import { GameMode, GameScoreState, Weapon, EspSettings } from '../types/game';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Sliders,
  Maximize2,
  Minimize2,
  Crosshair,
  Flame,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

interface GameHUDProps {
  scoreState: GameScoreState;
  weapon: Weapon;
  currentAmmo: number;
  isReloading: boolean;
  gameMode: GameMode;
  espSettings: EspSettings;
  onReload: () => void;
  onToggleScope: () => void;
  onToggleSound: () => void;
  onReset: () => void;
  onOpenSettings: () => void;
  onOpenModeSelector: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  scoreState,
  weapon,
  currentAmmo,
  isReloading,
  gameMode,
  espSettings,
  onReload,
  onToggleScope,
  onToggleSound,
  onReset,
  onOpenSettings,
  onOpenModeSelector,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const accuracy = scoreState.totalShots > 0
    ? Math.round((scoreState.hits / scoreState.totalShots) * 100)
    : 0;

  const headshotRate = scoreState.hits > 0
    ? Math.round((scoreState.headshots / scoreState.hits) * 100)
    : 0;

  const getModeLabel = (mode: GameMode) => {
    switch (mode) {
      case 'CLASSIC_DEMO': return 'CLASSIC DEMO (ORIGINAL)';
      case 'REFLEX_DRILL': return '60S REFLEX CHALLENGE';
      case 'MOVING_TARGETS': return 'MOVING TARGET RAILS';
      case 'SNIPER_RANGE': return 'SNIPER LONG-RANGE';
      case 'ONE_TAP_HEADSHOT': return 'ONE-TAP HEADSHOT ONLY';
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 md:p-6 overflow-hidden select-none">
      {/* Top Bar: Classic HUD on left, Controls on right */}
      <div className="flex items-start justify-between w-full">
        {/* Left Classic Kotlin HUD */}
        <div className="flex flex-col gap-1 tracking-wider drop-shadow-md">
          {/* Main Title - Exact Kotlin "FF DEMO" */}
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-['Teko'] uppercase leading-none">
              FF DEMO
            </h1>
            <button
              onClick={onOpenModeSelector}
              className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 rounded text-emerald-400 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{getModeLabel(gameMode)}</span>
            </button>
          </div>

          {/* Scores - Exact Kotlin Score & Headshots + Tactical Additions */}
          <div className="flex flex-col text-sm md:text-base font-semibold text-slate-100 font-['Rajdhani'] mt-0.5">
            <div className="flex items-center gap-2">
              <span className="text-slate-300">Score:</span>
              <span className="text-emerald-400 font-mono text-lg font-bold tabular-nums">
                {scoreState.score}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-300">Headshots:</span>
              <span className="text-rose-400 font-mono text-lg font-bold tabular-nums">
                {scoreState.headshots}
              </span>
              <span className="text-xs text-rose-300/80">({headshotRate}%)</span>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-400 font-mono">
              <span>Accuracy:</span>
              <span className="text-cyan-400 font-bold tabular-nums">{accuracy}%</span>
              <span className="text-slate-500">·</span>
              <span>Shots: {scoreState.totalShots}</span>
            </div>
          </div>

          {/* Streak indicator */}
          {scoreState.streak >= 3 && (
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold font-mono animate-bounce mt-1">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-400" />
              <span>{scoreState.streak}X COMBO STREAK!</span>
            </div>
          )}
        </div>

        {/* Center Timer (for Reflex Challenge mode) */}
        {gameMode === 'REFLEX_DRILL' && (
          <div className="flex flex-col items-center justify-center px-4 py-2 bg-slate-900/80 border border-slate-700/60 rounded-lg backdrop-blur-md">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-sm font-semibold">
              <Clock className="w-4 h-4" />
              <span>ROUND TIME</span>
            </div>
            <div className="text-3xl md:text-4xl font-extrabold font-mono text-white tabular-nums">
              {Math.max(0, Math.ceil(scoreState.timeRemaining))}s
            </div>
          </div>
        )}

        {/* Right Action Icons (Controls) */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Audio toggle */}
          <button
            onClick={onToggleSound}
            title={espSettings.soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            className="p-2.5 bg-slate-900/70 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-lg backdrop-blur-sm transition-colors cursor-pointer"
          >
            {espSettings.soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
          </button>

          {/* Settings / ESP Customizer */}
          <button
            onClick={onOpenSettings}
            title="ESP & Visual Config"
            className="p-2.5 bg-slate-900/70 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-lg backdrop-blur-sm transition-colors cursor-pointer"
          >
            <Sliders className="w-5 h-5 text-cyan-400" />
          </button>

          {/* Reset button */}
          <button
            onClick={onReset}
            title="Reset Targets & Score"
            className="p-2.5 bg-slate-900/70 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-lg backdrop-blur-sm transition-colors cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 text-slate-300 hover:rotate-180 transition-transform" />
          </button>

          {/* Fullscreen button */}
          <button
            onClick={onToggleFullscreen}
            title="Toggle Fullscreen"
            className="p-2.5 bg-slate-900/70 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-lg backdrop-blur-sm transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5 text-slate-300" /> : <Maximize2 className="w-5 h-5 text-slate-300" />}
          </button>
        </div>
      </div>

      {/* Bottom Area: Classic Location label on left, Weapon & Ammo on right */}
      <div className="flex items-end justify-between w-full">
        {/* Left Classic Kotlin Footer: DEMO LOCATION: TRAINING ZONE */}
        <div className="flex flex-col">
          <div className="text-xs md:text-sm font-bold tracking-widest text-slate-300 font-['Rajdhani'] uppercase bg-slate-950/60 px-3 py-1.5 rounded border-l-2 border-emerald-400 backdrop-blur-sm inline-block">
            DEMO LOCATION: TRAINING ZONE
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1 hidden md:block">
            Aim at Head (Red Circle) for +100 Headshot · Body for +25
          </div>
        </div>

        {/* Right: Weapon Info, Ammo Counter & Scope Button */}
        <div className="pointer-events-auto flex items-end gap-3">
          {/* Scope Toggle for Sniper/Rifle */}
          {weapon.hasScope && (
            <button
              onClick={onToggleScope}
              className={`px-3 py-2 rounded-lg border font-['Rajdhani'] font-bold text-sm flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer ${
                espSettings.scopeActive
                  ? 'bg-rose-600/80 border-rose-400 text-white shadow-lg shadow-rose-900/30'
                  : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              <Crosshair className="w-4 h-4" />
              <span>{espSettings.scopeActive ? 'SCOPE ACTIVE (8X)' : 'AIM SCOPE'}</span>
            </button>
          )}

          {/* Ammo & Reload Card */}
          <div
            onClick={onReload}
            className="group flex items-center gap-4 bg-slate-950/85 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-2.5 backdrop-blur-md cursor-pointer transition-all shadow-xl"
          >
            {weapon.image && (
              <img
                src={weapon.image}
                alt={weapon.name}
                className="w-12 h-12 object-contain filter drop-shadow hidden sm:block"
              />
            )}

            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-['Rajdhani']">
                {weapon.name}
              </span>
              <div className="flex items-baseline gap-1 font-mono">
                <span
                  className={`text-2xl md:text-3xl font-extrabold tabular-nums leading-none ${
                    currentAmmo === 0
                      ? 'text-rose-500 animate-pulse'
                      : currentAmmo <= Math.ceil(weapon.magSize * 0.25)
                      ? 'text-amber-400'
                      : 'text-white'
                  }`}
                >
                  {isReloading ? '--' : currentAmmo}
                </span>
                <span className="text-slate-500 text-sm">/ {weapon.magSize}</span>
              </div>
            </div>

            {/* Reload button badge */}
            <div className="flex flex-col items-center">
              <div
                className={`px-2 py-1 rounded text-[11px] font-bold tracking-wider uppercase font-mono ${
                  isReloading
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                    : currentAmmo === 0
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-bounce'
                    : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {isReloading ? 'RELOADING...' : 'RELOAD [R]'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
