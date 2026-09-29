import React from 'react';
import { GameScoreState, GameMode } from '../types/game';
import { Trophy, Target, Zap, RotateCcw, Flame, CheckCircle, Crosshair } from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  scoreState: GameScoreState;
  gameMode: GameMode;
  onRestart: () => void;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  scoreState,
  onRestart,
  onClose,
}) => {
  if (!isOpen) return null;

  const accuracy = scoreState.totalShots > 0
    ? Math.round((scoreState.hits / scoreState.totalShots) * 100)
    : 0;

  const headshotRate = scoreState.hits > 0
    ? Math.round((scoreState.headshots / scoreState.hits) * 100)
    : 0;

  const avgReaction = scoreState.reactionHistory.length > 0
    ? Math.round(
        scoreState.reactionHistory.reduce((a, b) => a + b, 0) /
          scoreState.reactionHistory.length
      )
    : 280;

  // Rank tier calculation
  let rankTier = 'DIAMOND';
  let rankColor = 'text-cyan-400 border-cyan-400 bg-cyan-950/40';
  let rankTitle = 'Tactical Marksman';

  if (scoreState.score >= 2500 && headshotRate >= 65) {
    rankTier = 'GRANDMASTER';
    rankColor = 'text-amber-300 border-amber-400 bg-amber-950/40 shadow-amber-500/20';
    rankTitle = 'Free Fire Legend';
  } else if (scoreState.score >= 1800 && headshotRate >= 50) {
    rankTier = 'HEROIC';
    rankColor = 'text-rose-400 border-rose-500 bg-rose-950/40 shadow-rose-500/20';
    rankTitle = 'Apex Headshot Hunter';
  } else if (scoreState.score >= 1000) {
    rankTier = 'MASTER';
    rankColor = 'text-purple-400 border-purple-400 bg-purple-950/40';
    rankTitle = 'Elite Sharpshooter';
  } else if (scoreState.score >= 500) {
    rankTier = 'DIAMOND';
    rankColor = 'text-cyan-400 border-cyan-400 bg-cyan-950/40';
    rankTitle = 'Combat Veteran';
  } else {
    rankTier = 'PLATINUM';
    rankColor = 'text-emerald-400 border-emerald-400 bg-emerald-950/40';
    rankTitle = 'Training Recruit';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 text-center">
        {/* Header Badge */}
        <div className="flex flex-col items-center">
          <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/40 text-amber-400 mb-2">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold font-['Teko'] uppercase tracking-wider text-white">
            Combat Drill Complete
          </h2>
          <span className="text-xs font-mono text-slate-400">
            60-Second Reflex Performance Report
          </span>
        </div>

        {/* Rank Tier Banner */}
        <div className={`p-4 rounded-xl border flex flex-col items-center shadow-lg ${rankColor}`}>
          <span className="text-xs font-bold font-mono tracking-widest uppercase">
            COMBAT RATING
          </span>
          <span className="text-4xl font-extrabold font-['Teko'] tracking-wider leading-none mt-1">
            {rankTier}
          </span>
          <span className="text-xs font-['Rajdhani'] font-semibold text-slate-300 mt-1">
            {rankTitle}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-left">
          {/* Final Score */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>FINAL SCORE</span>
            </div>
            <span className="text-2xl font-extrabold font-mono text-emerald-400 mt-1 tabular-nums">
              {scoreState.score}
            </span>
          </div>

          {/* Headshots */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Crosshair className="w-3.5 h-3.5 text-rose-400" />
              <span>HEADSHOTS</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-extrabold font-mono text-rose-400 tabular-nums">
                {scoreState.headshots}
              </span>
              <span className="text-xs text-rose-300/80 font-mono">({headshotRate}%)</span>
            </div>
          </div>

          {/* Accuracy */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>ACCURACY</span>
            </div>
            <span className="text-2xl font-extrabold font-mono text-cyan-400 mt-1 tabular-nums">
              {accuracy}%
            </span>
          </div>

          {/* Best Streak */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>BEST STREAK</span>
            </div>
            <span className="text-2xl font-extrabold font-mono text-orange-400 mt-1 tabular-nums">
              {scoreState.bestStreak}x
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onRestart}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold font-['Rajdhani'] uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Train Again</span>
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold font-['Rajdhani'] uppercase tracking-wider rounded-xl transition-colors cursor-pointer text-xs"
          >
            Back to Range
          </button>
        </div>
      </div>
    </div>
  );
};
