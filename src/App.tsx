/**
 * FF Tactical Range - ESP Aim Trainer & Simulator
 * Ported and elevated from Kotlin Android DemoView:
 * Fullscreen training zone with moving background columns, ESP dummy targets,
 * headshot mechanics (+100), body hits (+25), weapon arsenal, and reflex drills.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Target, GameMode, GameScoreState, Weapon, EspSettings } from './types/game';
import { WEAPONS } from './utils/weapons';
import { sound } from './utils/audio';
import { TrainingCanvas } from './components/TrainingCanvas';
import { GameHUD } from './components/GameHUD';
import { WeaponBar } from './components/WeaponBar';
import { ModeSelectorModal } from './components/ModeSelectorModal';
import { SettingsModal } from './components/SettingsModal';
import { StatsModal } from './components/StatsModal';

export default function App() {
  // Game Mode
  const [gameMode, setGameMode] = useState<GameMode>('CLASSIC_DEMO');
  const [isModeModalOpen, setIsModeModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Weapon State
  const [currentWeapon, setCurrentWeapon] = useState<Weapon>(WEAPONS[0]);
  const [currentAmmo, setCurrentAmmo] = useState<number>(WEAPONS[0].magSize);
  const [isReloading, setIsReloading] = useState<boolean>(false);

  // ESP & Visual Settings
  const [espSettings, setEspSettings] = useState<EspSettings>({
    showBox: true,
    boxStyle: 'classic_stroke',
    showHeadCircle: true,
    showBody: true,
    showName: true,
    showDistance: true,
    showHealthBar: true,
    showSnaplines: false,
    espColor: '#00ff66',
    showColumns: true,
    columnSpeed: 1.0,
    soundEnabled: true,
    volume: 0.7,
    crosshairStyle: 'crosshair',
    crosshairColor: '#00ff66',
    scopeActive: false,
    recoilEnabled: true,
  });

  // Score & Session State (Matching Kotlin score and headshots tracking)
  const [scoreState, setScoreState] = useState<GameScoreState>({
    score: 0,
    headshots: 0,
    bodyshots: 0,
    totalShots: 0,
    hits: 0,
    streak: 0,
    bestStreak: 0,
    lastReactionTimeMs: null,
    reactionHistory: [],
    startTime: Date.now(),
    timeRemaining: 60,
    isGameOver: false,
  });

  // Helper to generate a dummy target
  const createTarget = useCallback((index: number, mode: GameMode): Target => {
    let dist = 20 + Math.random() * 50;
    if (mode === 'SNIPER_RANGE') {
      dist = 50 + Math.random() * 65; // longer range
    }

    const y = 0.25 + Math.random() * 0.55; // Exact Kotlin formula: 0.25f + Random.nextFloat() * 0.55f

    return {
      id: `target-${index}-${Math.random()}`,
      x: Math.random() * 0.85 + 0.07,
      y,
      baseY: y,
      distance: Math.round(dist),
      speedX: (Math.random() * 0.002 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
      speedY: 0,
      direction: Math.random() > 0.5 ? 1 : -1,
      name: `TARGET #${index + 1}`,
      health: 100,
      maxHealth: 100,
      isHit: false,
      hitTimestamp: 0,
      lastHeadshot: false,
      spawnTime: performance.now(),
    };
  }, []);

  // Initialize targets: Exactly 6 targets matching Kotlin repeat(6)
  const [targets, setTargets] = useState<Target[]>(() => {
    const initialTargets: Target[] = [];
    for (let i = 0; i < 6; i++) {
      initialTargets.push({
        id: `target-${i}`,
        x: Math.random() * 0.85 + 0.07,
        y: 0.25 + Math.random() * 0.55,
        baseY: 0.25 + Math.random() * 0.55,
        distance: Math.round(25 + Math.random() * 45),
        speedX: (Math.random() * 0.002 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
        speedY: 0,
        direction: Math.random() > 0.5 ? 1 : -1,
        name: `TARGET`,
        health: 100,
        maxHealth: 100,
        isHit: false,
        hitTimestamp: 0,
        lastHeadshot: false,
        spawnTime: performance.now(),
      });
    }
    return initialTargets;
  });

  // Reset a specific target when shot (Exact Kotlin target.reset() logic)
  const handleResetTarget = useCallback((targetId: string) => {
    setTargets((prev) =>
      prev.map((t) => {
        if (t.id === targetId) {
          const newY = 0.25 + Math.random() * 0.55;
          let newDist = 20 + Math.random() * 50;
          if (gameMode === 'SNIPER_RANGE') {
            newDist = 50 + Math.random() * 65;
          }
          return {
            ...t,
            x: Math.random() * 0.85 + 0.07,
            y: newY,
            baseY: newY,
            distance: Math.round(newDist),
            health: 100,
            isHit: false,
            spawnTime: performance.now(),
          };
        }
        return t;
      })
    );
  }, [gameMode]);

  // Reset entire round / practice
  const handleResetRound = useCallback(() => {
    setScoreState({
      score: 0,
      headshots: 0,
      bodyshots: 0,
      totalShots: 0,
      hits: 0,
      streak: 0,
      bestStreak: 0,
      lastReactionTimeMs: null,
      reactionHistory: [],
      startTime: Date.now(),
      timeRemaining: 60,
      isGameOver: false,
    });
    setCurrentAmmo(currentWeapon.magSize);
    setIsReloading(false);

    // Re-initialize 6 targets
    const newTargets: Target[] = [];
    for (let i = 0; i < 6; i++) {
      newTargets.push(createTarget(i, gameMode));
    }
    setTargets(newTargets);
  }, [currentWeapon.magSize, gameMode, createTarget]);

  // Mode change handler
  const handleSelectMode = (newMode: GameMode) => {
    setGameMode(newMode);
    // If switching to sniper mode, suggest AWM weapon
    if (newMode === 'SNIPER_RANGE') {
      const awm = WEAPONS.find((w) => w.id === 'awm') || WEAPONS[0];
      setCurrentWeapon(awm);
      setCurrentAmmo(awm.magSize);
      setEspSettings((prev) => ({ ...prev, scopeActive: true }));
    } else {
      setEspSettings((prev) => ({ ...prev, scopeActive: false }));
    }
    handleResetRound();
  };

  // Weapon switch handler
  const handleSelectWeapon = (weapon: Weapon) => {
    setCurrentWeapon(weapon);
    setCurrentAmmo(weapon.magSize);
    setIsReloading(false);
    if (!weapon.hasScope && espSettings.scopeActive) {
      setEspSettings((prev) => ({ ...prev, scopeActive: false }));
    }
  };

  // Reload action
  const handleReload = useCallback(() => {
    if (isReloading || currentAmmo === currentWeapon.magSize) return;

    setIsReloading(true);
    sound.playReload();

    setTimeout(() => {
      setCurrentAmmo(currentWeapon.magSize);
      setIsReloading(false);
    }, currentWeapon.reloadTimeMs);
  }, [isReloading, currentAmmo, currentWeapon]);

  // Scope toggle
  const handleToggleScope = useCallback(() => {
    if (!currentWeapon.hasScope) return;
    setEspSettings((prev) => {
      const nextScope = !prev.scopeActive;
      sound.playScopeZoom(nextScope);
      return { ...prev, scopeActive: nextScope };
    });
  }, [currentWeapon.hasScope]);

  // Sound toggle
  const handleToggleSound = () => {
    setEspSettings((prev) => {
      const nextSound = !prev.soundEnabled;
      sound.setMuted(!nextSound);
      return { ...prev, soundEnabled: nextSound };
    });
  };

  // Shoot trigger
  const handleShoot = useCallback((): boolean => {
    if (isReloading || currentAmmo <= 0) return false;

    setCurrentAmmo((prev) => {
      const next = prev - 1;
      if (next === 0) {
        // Auto reload after slight delay
        setTimeout(() => {
          handleReload();
        }, 150);
      }
      return next;
    });

    setScoreState((prev) => ({
      ...prev,
      totalShots: prev.totalShots + 1,
    }));

    return true;
  }, [isReloading, currentAmmo, handleReload]);

  // Hit target handler: exact Kotlin score += 100 for headshot, score += 25 for body
  const handleHit = useCallback(
    (isHeadshot: boolean, targetId: string, damage: number, _hitX: number, _hitY: number) => {
      const target = targets.find((t) => t.id === targetId);
      const reactionTime = target ? performance.now() - target.spawnTime : 300;

      setScoreState((prev) => {
        const nextHits = prev.hits + 1;
        const nextStreak = prev.streak + 1;
        const nextBestStreak = Math.max(prev.bestStreak, nextStreak);

        if (nextStreak > 0 && nextStreak % 5 === 0) {
          sound.playStreakChime();
        }

        return {
          ...prev,
          score: prev.score + (isHeadshot ? 100 : 25),
          headshots: isHeadshot ? prev.headshots + 1 : prev.headshots,
          bodyshots: !isHeadshot ? prev.bodyshots + 1 : prev.bodyshots,
          hits: nextHits,
          streak: nextStreak,
          bestStreak: nextBestStreak,
          lastReactionTimeMs: Math.round(reactionTime),
          reactionHistory: [...prev.reactionHistory.slice(-15), Math.round(reactionTime)],
        };
      });
    },
    [targets]
  );

  // Miss handler: breaks streak
  const handleMiss = useCallback((_x: number, _y: number) => {
    setScoreState((prev) => ({
      ...prev,
      streak: 0,
    }));
  }, []);

  // Moving Targets lateral patrol loop (for MOVING_TARGETS mode)
  useEffect(() => {
    if (gameMode !== 'MOVING_TARGETS' || isPaused) return;

    let animId: number;
    const moveTargets = () => {
      setTargets((prev) =>
        prev.map((t) => {
          let nextX = t.x + t.speedX * t.direction;
          let nextDir = t.direction;

          // Bounce off left/right bounds
          if (nextX <= 0.08) {
            nextX = 0.08;
            nextDir = 1;
          } else if (nextX >= 0.92) {
            nextX = 0.92;
            nextDir = -1;
          }

          return {
            ...t,
            x: nextX,
            direction: nextDir,
          };
        })
      );
      animId = requestAnimationFrame(moveTargets);
    };

    animId = requestAnimationFrame(moveTargets);
    return () => cancelAnimationFrame(animId);
  }, [gameMode, isPaused]);

  // Timer loop for REFLEX_DRILL mode (60-second challenge)
  useEffect(() => {
    if (gameMode !== 'REFLEX_DRILL' || isPaused || scoreState.isGameOver) return;

    const interval = setInterval(() => {
      setScoreState((prev) => {
        if (prev.timeRemaining <= 1) {
          sound.playRoundOver();
          setIsStatsModalOpen(true);
          return {
            ...prev,
            timeRemaining: 0,
            isGameOver: true,
          };
        }
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameMode, isPaused, scoreState.isGameOver]);

  // Keyboard Shortcuts (1..5 for weapons, R for reload, E or Right Click for scope)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleReload();
      } else if (e.key === '1') {
        handleSelectWeapon(WEAPONS[0]);
      } else if (e.key === '2') {
        handleSelectWeapon(WEAPONS[1]);
      } else if (e.key === '3') {
        handleSelectWeapon(WEAPONS[2]);
      } else if (e.key === '4') {
        handleSelectWeapon(WEAPONS[3]);
      } else if (e.key === '5') {
        handleSelectWeapon(WEAPONS[4]);
      } else if (e.key === 'e' || e.key === 'E') {
        handleToggleScope();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleReload, handleToggleScope]);

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0c131a] select-none font-['Rajdhani']">
      {/* 2D Canvas Training Simulator */}
      <TrainingCanvas
        targets={targets}
        weapon={currentWeapon}
        espSettings={espSettings}
        gameMode={gameMode}
        currentAmmo={currentAmmo}
        isReloading={isReloading}
        onShoot={handleShoot}
        onHit={handleHit}
        onMiss={handleMiss}
        onResetTarget={handleResetTarget}
        isPaused={isPaused}
      />

      {/* Primary Game HUD */}
      <GameHUD
        scoreState={scoreState}
        weapon={currentWeapon}
        currentAmmo={currentAmmo}
        isReloading={isReloading}
        gameMode={gameMode}
        espSettings={espSettings}
        onReload={handleReload}
        onToggleScope={handleToggleScope}
        onToggleSound={handleToggleSound}
        onReset={handleResetRound}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenModeSelector={() => setIsModeModalOpen(true)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Bottom Arsenal Dock */}
      <WeaponBar
        currentWeapon={currentWeapon}
        onSelectWeapon={handleSelectWeapon}
      />

      {/* Mode Selector Modal */}
      <ModeSelectorModal
        isOpen={isModeModalOpen}
        onClose={() => setIsModeModalOpen(false)}
        currentMode={gameMode}
        onSelectMode={handleSelectMode}
      />

      {/* ESP & Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={espSettings}
        onUpdateSettings={(newPartial) => setEspSettings((prev) => ({ ...prev, ...newPartial }))}
      />

      {/* Stats & Rank Recap Modal */}
      <StatsModal
        isOpen={isStatsModalOpen}
        scoreState={scoreState}
        gameMode={gameMode}
        onRestart={() => {
          setIsStatsModalOpen(false);
          handleResetRound();
        }}
        onClose={() => setIsStatsModalOpen(false)}
      />
    </main>
  );
}
