import React, { useRef, useEffect, useCallback } from 'react';
import { Target, EspSettings, FloatingText, Particle, BulletTracer, Weapon, GameMode } from '../types/game';
import { sound } from '../utils/audio';

interface TrainingCanvasProps {
  targets: Target[];
  weapon: Weapon;
  espSettings: EspSettings;
  gameMode: GameMode;
  currentAmmo: number;
  isReloading: boolean;
  onShoot: () => boolean; // returns true if shot fired (ammo > 0)
  onHit: (isHeadshot: boolean, targetId: string, damage: number, hitX: number, hitY: number) => void;
  onMiss: (x: number, y: number) => void;
  onResetTarget: (targetId: string) => void;
  isPaused: boolean;
}

export const TrainingCanvas: React.FC<TrainingCanvasProps> = ({
  targets,
  weapon,
  espSettings,
  gameMode,
  currentAmmo,
  isReloading,
  onShoot,
  onHit,
  onMiss,
  onResetTarget,
  isPaused,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Animation & state refs to avoid React re-renders in the 60fps render loop
  const backgroundOffsetRef = useRef<number>(0);
  const crosshairPosRef = useRef<{ x: number; y: number; onScreen: boolean }>({ x: 0, y: 0, onScreen: false });
  const mousePosRef = useRef<{ x: number; y: number; onScreen: boolean }>({ x: 0, y: 0, onScreen: false });
  const isMouseDownRef = useRef<boolean>(false);
  const lastShotTimeRef = useRef<number>(0);
  const recoilOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const crosshairSpreadRef = useRef<number>(0);
  const hitMarkerRef = useRef<{ active: boolean; isHeadshot: boolean; timestamp: number }>({
    active: false,
    isHeadshot: false,
    timestamp: 0,
  });

  const floatingTextsRef = useRef<FloatingText[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const tracersRef = useRef<BulletTracer[]>([]);
  const muzzleFlashRef = useRef<number>(0);

  // Spawn visual hit effects
  const spawnHitEffects = useCallback((hitX: number, hitY: number, isHeadshot: boolean, damage: number) => {
    // 1. Floating text
    floatingTextsRef.current.push({
      id: Math.random().toString(),
      x: hitX + (Math.random() * 20 - 10),
      y: hitY - 15,
      text: isHeadshot ? `💥 HEADSHOT +${damage}` : `+${damage}`,
      color: isHeadshot ? '#ef4444' : '#f8fafc',
      isHeadshot,
      createdAt: performance.now(),
      lifetimeMs: isHeadshot ? 1100 : 800,
      vx: (Math.random() - 0.5) * 1.5,
      vy: isHeadshot ? -2.2 : -1.6,
    });

    // 2. Particles (red/gold sparks for headshot, tactical grey/orange for body)
    const particleCount = isHeadshot ? 24 : 12;
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * (isHeadshot ? 6 : 4) + 1;
      particlesRef.current.push({
        id: Math.random().toString(),
        x: hitX,
        y: hitY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * (isHeadshot ? 4 : 3) + 2,
        color: isHeadshot
          ? (Math.random() > 0.3 ? '#ef4444' : '#f59e0b')
          : (Math.random() > 0.5 ? '#e2e8f0' : '#38bdf8'),
        alpha: 1,
        decay: Math.random() * 0.02 + 0.02,
        gravity: 0.12,
      });
    }

    // 3. Hit marker
    hitMarkerRef.current = {
      active: true,
      isHeadshot,
      timestamp: performance.now(),
    };
  }, []);

  // Process shot event at screen (canvas) coordinates
  const triggerFire = useCallback((screenX: number, screenY: number) => {
    if (isPaused || isReloading) return;

    const now = performance.now();
    if (now - lastShotTimeRef.current < weapon.fireRate) return;

    if (currentAmmo <= 0) {
      sound.playEmptyClick();
      return;
    }

    const canFire = onShoot();
    if (!canFire) return;

    lastShotTimeRef.current = now;

    // Recoil kickback
    if (espSettings.recoilEnabled) {
      recoilOffsetRef.current = {
        x: (Math.random() - 0.5) * weapon.recoilAmount * 1.2,
        y: -weapon.recoilAmount * 2.2,
      };
      crosshairSpreadRef.current = weapon.recoilAmount * 3;
    }

    muzzleFlashRef.current = 1.0;

    // Sound
    sound.playGunshot(weapon.soundPreset);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const canvasW = canvas.width / dpr;
    const canvasH = canvas.height / dpr;

    // Add animated bullet tracer(s) from player's crosshair position toward clicked target coordinate
    const crosshair = crosshairPosRef.current;
    let startX = crosshair.onScreen ? crosshair.x : canvasW * 0.5;
    let startY = crosshair.onScreen ? crosshair.y : canvasH * 0.5;

    const distToTarget = Math.hypot(screenX - startX, screenY - startY);
    if (distToTarget < 25) {
      // If clicked right on top of the crosshair, animate along the weapon's barrel line into the target
      startX = screenX - 22;
      startY = screenY + 75;
    }

    // Configure distinct tracer aesthetic per weapon
    let tracerColor = '#fbbf24';
    let tracerGlow = '#f59e0b';
    let tracerWidth = 3.5;
    let tracerSpeed = 0.12;
    let tailLen = 65;

    if (weapon.soundPreset === 'awm') {
      tracerColor = '#38bdf8';
      tracerGlow = '#0284c7';
      tracerWidth = 5;
      tracerSpeed = 0.15;
      tailLen = 100;
    } else if (weapon.soundPreset === 'mp40') {
      tracerColor = '#fb923c';
      tracerGlow = '#ea580c';
      tracerWidth = 2.8;
      tracerSpeed = 0.16;
      tailLen = 45;
    } else if (weapon.soundPreset === 'shotgun') {
      tracerColor = '#fde047';
      tracerGlow = '#ca8a04';
      tracerWidth = 2.4;
      tracerSpeed = 0.14;
      tailLen = 40;
    } else if (weapon.soundPreset === 'rifle') {
      tracerColor = '#f87171';
      tracerGlow = '#dc2626';
      tracerWidth = 3.5;
      tracerSpeed = 0.14;
      tailLen = 60;
    }

    const pelletCount = weapon.pellets || 1;
    for (let p = 0; p < pelletCount; p++) {
      const spreadX = pelletCount > 1 ? (Math.random() - 0.5) * 35 : 0;
      const spreadY = pelletCount > 1 ? (Math.random() - 0.5) * 35 : 0;
      tracersRef.current.push({
        id: Math.random().toString(),
        startX,
        startY,
        endX: screenX + spreadX,
        endY: screenY + spreadY,
        progress: 0,
        speed: tracerSpeed + (Math.random() * 0.02 - 0.01),
        color: tracerColor,
        glowColor: tracerGlow,
        width: tracerWidth,
        tailLength: tailLen,
        alpha: 1.0,
        arrived: false,
      });
    }

    // Update crosshair position to the clicked target
    crosshairPosRef.current = { x: screenX, y: screenY, onScreen: true };
    mousePosRef.current = { x: screenX, y: screenY, onScreen: true };

    // Check hit against targets
    let hitSomething = false;

    // Zoom factor if scope is active
    const zoomScale = espSettings.scopeActive && weapon.hasScope ? weapon.scopeZoom : 1.0;

    // Loop through targets (front-to-back or in order)
    for (let i = targets.length - 1; i >= 0; i--) {
      const target = targets[i];
      let tx = target.x * canvasW;
      let ty = target.y * canvasH;

      if (zoomScale !== 1.0) {
        tx = canvasW / 2 + (tx - canvasW / 2) * zoomScale;
        ty = canvasH / 2 + (ty - canvasH / 2) * zoomScale;
      }

      // Exact Kotlin hypotenuse formulas:
      // Head center: y - 65f * scale
      // Head distance threshold: 35f * scale
      // Body distance threshold: 100f * scale
      const distScale = Math.max(0.6, 1.2 - (target.distance / 120)) * zoomScale;
      const headCenterY = ty - 65 * distScale;

      const headDist = Math.hypot(screenX - tx, screenY - headCenterY);
      const bodyDist = Math.hypot(screenX - tx, screenY - ty);

      const headThreshold = 35 * distScale;
      const bodyThreshold = 100 * distScale;

      if (headDist < headThreshold) {
        // Headshot hit!
        hitSomething = true;
        sound.playHeadshotDing();
        const damage = weapon.damageHead;
        spawnHitEffects(screenX, screenY, true, damage);
        onHit(true, target.id, damage, screenX, screenY);
        onResetTarget(target.id);
        break;
      } else if (bodyDist < bodyThreshold) {
        // Bodyshot hit!
        if (gameMode === 'ONE_TAP_HEADSHOT') {
          // Ricochet in One-Tap mode
          sound.playBodyHit();
          floatingTextsRef.current.push({
            id: Math.random().toString(),
            x: screenX,
            y: screenY - 15,
            text: 'ARMOR RICOCHET',
            color: '#94a3b8',
            isHeadshot: false,
            createdAt: performance.now(),
            lifetimeMs: 600,
            vx: 0,
            vy: -1.2,
          });
        } else {
          hitSomething = true;
          sound.playBodyHit();
          const damage = weapon.damageBody;
          spawnHitEffects(screenX, screenY, false, damage);
          onHit(false, target.id, damage, screenX, screenY);
          onResetTarget(target.id);
        }
        break;
      }
    }

    if (!hitSomething) {
      onMiss(screenX, screenY);
      // Spawn ricochet spark on background
      particlesRef.current.push({
        id: Math.random().toString(),
        x: screenX,
        y: screenY,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        size: 3,
        color: '#fbbf24',
        alpha: 0.9,
        decay: 0.08,
      });
    }
  }, [
    isPaused,
    isReloading,
    currentAmmo,
    weapon,
    onShoot,
    espSettings,
    targets,
    gameMode,
    spawnHitEffects,
    onHit,
    onResetTarget,
    onMiss,
  ]);

  // Main canvas animation and rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);

      // Handle recoil camera shake smoothly
      const rx = recoilOffsetRef.current.x;
      const ry = recoilOffsetRef.current.y;
      recoilOffsetRef.current.x *= 0.82;
      recoilOffsetRef.current.y *= 0.82;
      crosshairSpreadRef.current = Math.max(0, crosshairSpreadRef.current * 0.88);

      ctx.translate(rx, ry);

      // 1. Moving demo background (Exact Kotlin Color.rgb(25, 35, 45) -> #19232d)
      ctx.fillStyle = '#19232d';
      ctx.fillRect(-20, -20, width + 40, height + 40);

      // Ambient tactical training room details:
      // Distance grid floor lines
      ctx.strokeStyle = 'rgba(74, 96, 115, 0.25)';
      ctx.lineWidth = 1;
      const horizonY = height * 0.55;

      // Horizon line
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(width, horizonY);
      ctx.stroke();

      // Perspective floor lines
      for (let x = -width; x < width * 2; x += 120) {
        ctx.beginPath();
        ctx.moveTo(width / 2 + (x - width / 2) * 0.2, horizonY);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Moving pillars/columns (Exact Kotlin loop: for (i in -1..12) val x = i * 180f - backgroundOffset)
      if (espSettings.showColumns) {
        ctx.fillStyle = '#2d414b'; // Color.rgb(45, 65, 75)
        const colSpacing = 180;
        const colWidth = 90;
        const colCount = Math.ceil(width / colSpacing) + 3;

        for (let i = -1; i < colCount; i++) {
          const colX = i * colSpacing - backgroundOffsetRef.current;
          ctx.fillRect(colX, horizonY, colWidth, height - horizonY);

          // Subtle column edge highlight for depth
          ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
          ctx.fillRect(colX, horizonY, 4, height - horizonY);
          ctx.fillStyle = '#2d414b';
        }

        if (!isPaused) {
          backgroundOffsetRef.current += 1.5 * espSettings.columnSpeed;
          if (backgroundOffsetRef.current > colSpacing) {
            backgroundOffsetRef.current = 0;
          }
        }
      }

      // Distance markers on the range floor (15m, 30m, 45m, 60m)
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      const rangeDistances = [
        { label: '◄ 15M CLOSE RANGE ►', yRatio: 0.90 },
        { label: '◄ 30M MID RANGE ►', yRatio: 0.78 },
        { label: '◄ 45M LONG RANGE ►', yRatio: 0.68 },
        { label: '◄ 60M SNIPER ZONE ►', yRatio: 0.60 },
      ];
      rangeDistances.forEach((marker) => {
        const my = height * marker.yRatio;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.setLineDash([6, 6]);
        ctx.moveTo(20, my);
        ctx.lineTo(width - 20, my);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillText(marker.label, width - 35, my - 4);
      });

      // 2. Draw Targets (ESP style)
      const zoomScale = espSettings.scopeActive && weapon.hasScope ? weapon.scopeZoom : 1.0;

      targets.forEach((target) => {
        let x = target.x * width;
        let y = target.y * height;

        if (zoomScale !== 1.0) {
          x = width / 2 + (x - width / 2) * zoomScale;
          y = height / 2 + (y - height / 2) * zoomScale;
        }

        // Distance perspective scaling
        const distScale = Math.max(0.6, 1.2 - (target.distance / 120)) * zoomScale;
        const boxW = 100 * distScale;
        const boxH = 180 * distScale;

        // Snaplines (faint line from crosshair to target center)
        if (espSettings.showSnaplines && mousePosRef.current.onScreen) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(0, 255, 102, 0.2)';
          ctx.lineWidth = 1;
          ctx.moveTo(mousePosRef.current.x, mousePosRef.current.y);
          ctx.lineTo(x, y);
          ctx.stroke();
        }

        // ESP Box (Exact Kotlin: strokeWidth 5f, Color.GREEN)
        if (espSettings.showBox) {
          ctx.lineWidth = 4 * Math.min(1.2, distScale);
          ctx.strokeStyle = espSettings.espColor;

          if (espSettings.boxStyle === 'classic_stroke') {
            ctx.strokeRect(x - boxW / 2, y - boxH / 2, boxW, boxH);
          } else if (espSettings.boxStyle === 'corner_brackets') {
            // Tactical military corner brackets
            const cornerLen = boxW * 0.28;
            const left = x - boxW / 2;
            const right = x + boxW / 2;
            const top = y - boxH / 2;
            const bottom = y + boxH / 2;

            ctx.beginPath();
            // Top-left
            ctx.moveTo(left, top + cornerLen);
            ctx.lineTo(left, top);
            ctx.lineTo(left + cornerLen, top);
            // Top-right
            ctx.moveTo(right - cornerLen, top);
            ctx.lineTo(right, top);
            ctx.lineTo(right, top + cornerLen);
            // Bottom-left
            ctx.moveTo(left, bottom - cornerLen);
            ctx.lineTo(left, bottom);
            ctx.lineTo(left + cornerLen, bottom);
            // Bottom-right
            ctx.moveTo(right - cornerLen, bottom);
            ctx.lineTo(right, bottom);
            ctx.lineTo(right, bottom - cornerLen);
            ctx.stroke();
          } else {
            // Filled tactical box with transparent fill
            ctx.fillStyle = 'rgba(0, 255, 102, 0.08)';
            ctx.fillRect(x - boxW / 2, y - boxH / 2, boxW, boxH);
            ctx.strokeRect(x - boxW / 2, y - boxH / 2, boxW, boxH);
          }
        }

        // ESP Health Bar (on left side of box)
        if (espSettings.showHealthBar) {
          const barW = 4 * distScale;
          const barH = boxH;
          const barX = x - boxW / 2 - 8 * distScale;
          const barY = y - boxH / 2;

          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.fillRect(barX, barY, barW, barH);

          ctx.fillStyle = '#22c55e'; // Green health
          ctx.fillRect(barX, barY, barW, barH);
        }

        // Body Dummy (Exact Kotlin: Color.WHITE, rect x - 25f, y - 40f, x + 25f, y + 55f)
        if (espSettings.showBody) {
          ctx.fillStyle = '#ffffff';
          const bodyW = 50 * distScale;
          const bodyH = 95 * distScale;
          ctx.fillRect(x - bodyW / 2, y - 40 * distScale, bodyW, bodyH);

          // Subtle neck connector
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(x - 6 * distScale, y - 48 * distScale, 12 * distScale, 10 * distScale);
        }

        // Head Dummy (Exact Kotlin: Color.RED, circle at x, y - 65f, radius 22f)
        if (espSettings.showHeadCircle) {
          ctx.fillStyle = '#ff2222';
          ctx.beginPath();
          ctx.arc(x, y - 65 * distScale, 22 * distScale, 0, Math.PI * 2);
          ctx.fill();

          // Head bullseye center dot
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x, y - 65 * distScale, 4 * distScale, 0, Math.PI * 2);
          ctx.fill();
        }

        // Name tag (Exact Kotlin: Color.YELLOW, textSize 22f, "TARGET", x - 42f, y - 105f)
        if (espSettings.showName) {
          ctx.fillStyle = '#ffeb3b';
          const nameSize = Math.max(12, Math.round(22 * distScale));
          ctx.font = `bold ${nameSize}px "Rajdhani", sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(target.name || 'TARGET', x, y - (95 * distScale));
        }

        // Distance tag (Exact Kotlin: Color.CYAN, textSize 18f, "35m", x - 15f, y + 80f)
        if (espSettings.showDistance) {
          ctx.fillStyle = '#00e5ff';
          const distSize = Math.max(11, Math.round(18 * distScale));
          ctx.font = `600 ${distSize}px "JetBrains Mono", monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(`${Math.round(target.distance)}m`, x, y + (85 * distScale) + 18);
        }
      });

      // 3. Animated Bullet Tracers (traveling from player crosshair toward target)
      for (let i = tracersRef.current.length - 1; i >= 0; i--) {
        const tracer = tracersRef.current[i];
        tracer.progress += tracer.speed;

        const dx = tracer.endX - tracer.startX;
        const dy = tracer.endY - tracer.startY;
        const totalDist = Math.max(1, Math.hypot(dx, dy));

        // Leading head and trailing tail along trajectory
        const headProg = Math.min(1.0, tracer.progress);
        const tailProg = Math.max(0.0, tracer.progress - (tracer.tailLength / totalDist));

        const headX = tracer.startX + dx * headProg;
        const headY = tracer.startY + dy * headProg;
        const tailX = tracer.startX + dx * tailProg;
        const tailY = tracer.startY + dy * tailProg;

        ctx.save();
        ctx.globalAlpha = Math.max(0, tracer.alpha);

        // Outer glow streak
        ctx.beginPath();
        ctx.strokeStyle = tracer.glowColor;
        ctx.shadowColor = tracer.glowColor;
        ctx.shadowBlur = 10;
        ctx.lineWidth = tracer.width + 3.5;
        ctx.lineCap = 'round';
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(headX, headY);
        ctx.stroke();

        // Core bright beam
        ctx.beginPath();
        ctx.strokeStyle = '#ffffff';
        ctx.shadowBlur = 0;
        ctx.lineWidth = tracer.width;
        ctx.lineCap = 'round';
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(headX, headY);
        ctx.stroke();

        // Glowing bullet tip
        ctx.fillStyle = tracer.color;
        ctx.beginPath();
        ctx.arc(headX, headY, tracer.width * 0.9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(headX, headY, tracer.width * 0.45, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Spawn micro-particle smoke along the tracer path as it travels
        if (tracer.progress < 1.0 && Math.random() > 0.4) {
          particlesRef.current.push({
            id: Math.random().toString(),
            x: headX,
            y: headY,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            size: Math.random() * 2 + 1.2,
            color: tracer.glowColor,
            alpha: 0.6,
            decay: 0.05,
          });
        }

        // When the bullet arrives at the target coordinate, spawn impact spark burst
        if (tracer.progress >= 1.0 && !tracer.arrived) {
          tracer.arrived = true;
          for (let s = 0; s < 4; s++) {
            particlesRef.current.push({
              id: Math.random().toString(),
              x: tracer.endX,
              y: tracer.endY,
              vx: (Math.random() - 0.5) * 2.5,
              vy: (Math.random() - 0.5) * 2.5,
              size: 2.5,
              color: tracer.color,
              alpha: 0.9,
              decay: 0.07,
            });
          }
        }

        // Fade out
        if (tracer.progress >= 1.1) {
          tracer.alpha -= 0.16;
          if (tracer.alpha <= 0) {
            tracersRef.current.splice(i, 1);
          }
        }
      }

      // 4. Particles (Shards, sparks, blood/impact)
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        p.x += p.vx;
        p.y += p.vy;
        if (p.gravity) p.vy += p.gravity;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }

      // 5. Floating Damage Text ("+100 HEADSHOT", "+25")
      const now = performance.now();
      for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
        const ft = floatingTextsRef.current[i];
        const age = now - ft.createdAt;
        const progress = age / ft.lifetimeMs;

        if (progress >= 1) {
          floatingTextsRef.current.splice(i, 1);
          continue;
        }

        const currentAlpha = 1 - Math.pow(progress, 2);
        ft.x += ft.vx;
        ft.y += ft.vy;

        ctx.save();
        ctx.globalAlpha = Math.max(0, currentAlpha);
        ctx.font = ft.isHeadshot
          ? 'bold 24px "Teko", sans-serif'
          : 'bold 18px "Teko", sans-serif';
        ctx.textAlign = 'center';

        // Red glow for headshot
        if (ft.isHeadshot) {
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 12;
          ctx.fillStyle = '#fee2e2';
        } else {
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 4;
          ctx.fillStyle = ft.color;
        }

        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      // 6. Muzzle flash overlay pulse
      if (muzzleFlashRef.current > 0) {
        ctx.fillStyle = `rgba(255, 200, 100, ${muzzleFlashRef.current * 0.15})`;
        ctx.fillRect(0, 0, width, height);
        muzzleFlashRef.current -= 0.2;
      }

      // 7. Sniper Scope Overlay (if scope active)
      if (espSettings.scopeActive && weapon.hasScope) {
        const cx = width / 2;
        const cy = height / 2;
        const scopeRadius = Math.min(width, height) * 0.42;

        ctx.save();
        // Darkened vignette around scope
        ctx.fillStyle = 'rgba(5, 10, 15, 0.94)';
        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.arc(cx, cy, scopeRadius, 0, Math.PI * 2, true);
        ctx.fill();

        // Scope circular bezel
        ctx.strokeStyle = '#223344';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(cx, cy, scopeRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#00ffcc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, scopeRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Mil-dot Crosshair in scope
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        // Horizontal
        ctx.moveTo(cx - scopeRadius, cy);
        ctx.lineTo(cx + scopeRadius, cy);
        // Vertical
        ctx.moveTo(cx, cy - scopeRadius);
        ctx.lineTo(cx, cy + scopeRadius);
        ctx.stroke();

        // Center reticle dot
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();

        // Scope elevation marks
        for (let offset = -120; offset <= 120; offset += 30) {
          if (offset === 0) continue;
          ctx.beginPath();
          ctx.moveTo(cx - 8, cy + offset);
          ctx.lineTo(cx + 8, cy + offset);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(cx + offset, cy - 8);
          ctx.lineTo(cx + offset, cy + 8);
          ctx.stroke();
        }

        // Scope tactical readout
        ctx.fillStyle = '#00ffcc';
        ctx.font = '14px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`ZOOM: ${weapon.scopeZoom.toFixed(1)}X`, cx - scopeRadius + 30, cy - scopeRadius + 45);
        ctx.textAlign = 'right';
        ctx.fillText('FF-OPTIC 8X', cx + scopeRadius - 30, cy - scopeRadius + 45);

        ctx.restore();
      }

      // 8. Custom In-Canvas Crosshair & Hitmarker
      const chPos = crosshairPosRef.current.onScreen ? crosshairPosRef.current : mousePosRef.current;
      if (chPos.onScreen && (!espSettings.scopeActive || !weapon.hasScope)) {
        const mx = chPos.x;
        const my = chPos.y;
        const spread = crosshairSpreadRef.current;

        ctx.save();
        ctx.translate(mx, my);

        // Hitmarker X on hit
        const hmAge = now - hitMarkerRef.current.timestamp;
        if (hitMarkerRef.current.active && hmAge < 160) {
          const hmAlpha = 1 - hmAge / 160;
          ctx.strokeStyle = hitMarkerRef.current.isHeadshot ? '#ef4444' : '#ffffff';
          ctx.lineWidth = hitMarkerRef.current.isHeadshot ? 3.5 : 2.5;
          ctx.globalAlpha = hmAlpha;

          const hmLimit = hitMarkerRef.current.isHeadshot ? 14 : 10;
          ctx.beginPath();
          // Diagonal 1
          ctx.moveTo(-hmLimit, -hmLimit);
          ctx.lineTo(-4, -4);
          ctx.moveTo(4, 4);
          ctx.lineTo(hmLimit, hmLimit);
          // Diagonal 2
          ctx.moveTo(hmLimit, -hmLimit);
          ctx.lineTo(4, -4);
          ctx.moveTo(-4, 4);
          ctx.lineTo(-hmLimit, hmLimit);
          ctx.stroke();

          ctx.globalAlpha = 1.0;
        }

        // Standard Crosshair
        ctx.strokeStyle = espSettings.crosshairColor || '#00ff66';
        ctx.lineWidth = 2;

        if (espSettings.crosshairStyle === 'classic_dot') {
          ctx.fillStyle = espSettings.crosshairColor || '#00ff66';
          ctx.beginPath();
          ctx.arc(0, 0, 3 + spread * 0.2, 0, Math.PI * 2);
          ctx.fill();
        } else if (espSettings.crosshairStyle === 'tactical_circle') {
          ctx.beginPath();
          ctx.arc(0, 0, 10 + spread, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = espSettings.crosshairColor || '#00ff66';
          ctx.beginPath();
          ctx.arc(0, 0, 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Crosshair standard lines
          const gap = 5 + spread;
          const len = 9;

          ctx.beginPath();
          // Top
          ctx.moveTo(0, -gap - len);
          ctx.lineTo(0, -gap);
          // Bottom
          ctx.moveTo(0, gap);
          ctx.lineTo(0, gap + len);
          // Left
          ctx.moveTo(-gap - len, 0);
          ctx.lineTo(-gap, 0);
          // Right
          ctx.moveTo(gap, 0);
          ctx.lineTo(gap + len, 0);
          ctx.stroke();

          // Center dot
          ctx.fillStyle = espSettings.crosshairColor || '#00ff66';
          ctx.fillRect(-1.5, -1.5, 3, 3);
        }

        ctx.restore();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [targets, espSettings, weapon, isPaused, gameMode]);

  // Handle Resize for full crispness & devicePixelRatio
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // Set initial crosshair at center if not on screen yet
      if (!crosshairPosRef.current.onScreen) {
        crosshairPosRef.current = { x: rect.width / 2, y: rect.height / 2, onScreen: true };
        mousePosRef.current = { x: rect.width / 2, y: rect.height / 2, onScreen: true };
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Continuous auto-fire loop for SMG/Rifles while mouse/finger is held down
  useEffect(() => {
    let intervalId: number | undefined;

    if (weapon.fireRate < 200) {
      intervalId = window.setInterval(() => {
        if (isMouseDownRef.current && crosshairPosRef.current.onScreen && !isPaused && !isReloading) {
          triggerFire(crosshairPosRef.current.x, crosshairPosRef.current.y);
        }
      }, weapon.fireRate);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [weapon, isPaused, isReloading, triggerFire]);

  // Pointer / Touch Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isMouseDownRef.current = true;
    triggerFire(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mousePosRef.current = { x, y, onScreen: true };
    crosshairPosRef.current = { x, y, onScreen: true };
  };

  const handlePointerUp = () => {
    isMouseDownRef.current = false;
  };

  const handlePointerLeave = () => {
    isMouseDownRef.current = false;
    mousePosRef.current.onScreen = false;
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden select-none bg-[#0e1620] cursor-crosshair">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className="block w-full h-full touch-none"
      />
    </div>
  );
};
