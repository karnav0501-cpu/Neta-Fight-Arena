/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CharacterId, AIDifficulty, GameStats, GameScreen } from './game/types';
import { FightingEngine, InputState } from './game/engine';
import { soundEngine } from './game/audio';
import { TitleScreen } from './components/TitleScreen';
import { FightHud } from './components/FightHud';
import { TouchControls } from './components/TouchControls';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('title');
  const [playerChar, setPlayerChar] = useState<CharacterId>('modi');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [showHelp, setShowHelp] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Match statistics and winner
  const [matchWinner, setMatchWinner] = useState<CharacterId | null>(null);
  const [matchStats, setMatchStats] = useState<GameStats | null>(null);

  // HUD sync states
  const [hudState, setHudState] = useState<{
    roundNumber: number;
    timeRemaining: number;
    p1Health: number;
    p1DisplayHealth: number;
    p1Super: number;
    p1MaxSuper: number;
    p1RoundsWon: number;
    p2Health: number;
    p2DisplayHealth: number;
    p2Super: number;
    p2MaxSuper: number;
    p2RoundsWon: number;
  }>({
    roundNumber: 1,
    timeRemaining: 99,
    p1Health: 100,
    p1DisplayHealth: 100,
    p1Super: 20,
    p1MaxSuper: 100,
    p1RoundsWon: 0,
    p2Health: 100,
    p2DisplayHealth: 100,
    p2Super: 20,
    p2MaxSuper: 100,
    p2RoundsWon: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<FightingEngine | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Input states ref (avoids re-triggering effects)
  const inputStateRef = useRef<InputState>({
    left: false,
    right: false,
    jump: false,
    crouch: false,
    block: false,
    punch: false,
    heavyPunch: false,
    kick: false,
    heavyKick: false,
    special: false,
  });

  // Detect touch device
  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  // Audio mute sync
  const handleToggleMute = useCallback(() => {
    const nextMuted = !soundEngine.getMuted();
    soundEngine.setMuted(nextMuted);
    setIsMuted(nextMuted);
  }, []);

  const handleChangeVolume = useCallback((vol: number) => {
    soundEngine.setVolume(vol);
    setVolume(vol);
    if (vol > 0 && soundEngine.getMuted()) {
      soundEngine.setMuted(false);
      setIsMuted(false);
    }
  }, []);

  // Start match
  const handleStartGame = useCallback(() => {
    soundEngine.ensureContext();
    const cpuChar: CharacterId = playerChar === 'modi' ? 'rahul' : 'modi';

    const engine = new FightingEngine(playerChar, cpuChar, difficulty, {
      onMatchOver: (winner, stats) => {
        setMatchWinner(winner);
        setMatchStats(stats);
        setScreen('game_over');
      },
    });

    engineRef.current = engine;
    setIsPaused(false);
    setScreen('playing');
    soundEngine.playRoundBell();
  }, [playerChar, difficulty]);

  // Rematch
  const handleRematch = useCallback(() => {
    if (engineRef.current) {
      const cpuChar: CharacterId = playerChar === 'modi' ? 'rahul' : 'modi';
      engineRef.current.resetMatch(playerChar, cpuChar);
      setScreen('playing');
    } else {
      handleStartGame();
    }
  }, [playerChar, handleStartGame]);

  // Touch Input updater
  const handleTouchInputUpdate = useCallback((key: keyof InputState, value: boolean) => {
    inputStateRef.current[key] = value;
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Audio unlock on user interaction
      soundEngine.ensureContext();

      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (screen === 'playing') {
          setIsPaused((prev) => !prev);
          return;
        }
      }

      // Enter/Space on title screen to start
      if (screen === 'title' && (e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        handleStartGame();
        return;
      }

      if (screen !== 'playing' || isPaused) return;

      switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
          inputStateRef.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          inputStateRef.current.right = true;
          break;
        case 'KeyW':
        case 'ArrowUp':
          inputStateRef.current.jump = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          inputStateRef.current.crouch = true;
          break;
        case 'KeyL':
          inputStateRef.current.block = true;
          break;
        case 'KeyJ':
          inputStateRef.current.punch = true;
          break;
        case 'KeyU':
          inputStateRef.current.heavyPunch = true;
          break;
        case 'KeyK':
          inputStateRef.current.kick = true;
          break;
        case 'KeyI':
          inputStateRef.current.heavyKick = true;
          break;
        case 'Space':
          e.preventDefault();
          inputStateRef.current.special = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
          inputStateRef.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          inputStateRef.current.right = false;
          break;
        case 'KeyW':
        case 'ArrowUp':
          inputStateRef.current.jump = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          inputStateRef.current.crouch = false;
          break;
        case 'KeyL':
          inputStateRef.current.block = false;
          break;
        case 'KeyJ':
          inputStateRef.current.punch = false;
          break;
        case 'KeyU':
          inputStateRef.current.heavyPunch = false;
          break;
        case 'KeyK':
          inputStateRef.current.kick = false;
          break;
        case 'KeyI':
          inputStateRef.current.heavyKick = false;
          break;
        case 'Space':
          inputStateRef.current.special = false;
          break;
      }
    };

    const handleBlur = () => {
      // Clear held keys on blur
      Object.keys(inputStateRef.current).forEach((k) => {
        inputStateRef.current[k as keyof InputState] = false;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [screen, isPaused, handleStartGame]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    if (screen !== 'playing') {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      return;
    }

    let hudSyncCounter = 0;

    const loop = (currentTime: number) => {
      animFrameIdRef.current = requestAnimationFrame(loop);

      const rawDt = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;
      // Clamp delta time to avoid large jumps
      const dt = Math.min(rawDt, 0.05);

      const engine = engineRef.current;
      const canvas = canvasRef.current;
      if (!engine || !canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Handle canvas resolution & resize
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      if (!isPaused) {
        // Step game engine physics
        engine.update(inputStateRef.current);
      }

      // Render world
      engine.render(ctx, displayWidth, displayHeight);
      ctx.restore();

      // Throttled HUD state sync (every 3 frames) to keep React lightweight
      hudSyncCounter++;
      if (hudSyncCounter >= 3) {
        hudSyncCounter = 0;
        setHudState({
          roundNumber: engine.roundNumber,
          timeRemaining: engine.roundTimeRemaining,
          p1Health: engine.player.health,
          p1DisplayHealth: engine.player.displayHealth,
          p1Super: engine.player.superMeter,
          p1MaxSuper: engine.player.maxSuperMeter,
          p1RoundsWon: engine.player.roundsWon,
          p2Health: engine.opponent.health,
          p2DisplayHealth: engine.opponent.displayHealth,
          p2Super: engine.opponent.superMeter,
          p2MaxSuper: engine.opponent.maxSuperMeter,
          p2RoundsWon: engine.opponent.roundsWon,
        });
      }
    };

    lastTimeRef.current = performance.now();
    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [screen, isPaused]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      
      {/* 1. TITLE SCREEN */}
      {screen === 'title' && (
        <TitleScreen
          selectedCharacter={playerChar}
          onSelectCharacter={setPlayerChar}
          difficulty={difficulty}
          onSelectDifficulty={setDifficulty}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onStartGame={handleStartGame}
        />
      )}

      {/* 2. PLAYING / ACTIVE MATCH VIEWPORT */}
      {screen === 'playing' && engineRef.current && (
        <div className="relative w-full h-full flex flex-col">
          {/* Main 2D Canvas Viewport */}
          <canvas
            ref={canvasRef}
            className="w-full h-full block touch-none"
          />

          {/* Low-Occlusion Fighting HUD */}
          <FightHud
            player={engineRef.current.player}
            opponent={engineRef.current.opponent}
            roundNumber={hudState.roundNumber}
            timeRemaining={hudState.timeRemaining}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onOpenPause={() => setIsPaused(true)}
            onOpenHelp={() => setShowHelp(true)}
          />

          {/* On-Screen Touch Controls (active on mobile/tablet or when touch detected) */}
          <TouchControls
            onInputUpdate={handleTouchInputUpdate}
            superReady={hudState.p1Super >= hudState.p1MaxSuper}
          />
        </div>
      )}

      {/* 3. GAME OVER MODAL */}
      {screen === 'game_over' && matchWinner && matchStats && (
        <GameOverModal
          playerCharId={playerChar}
          winnerCharId={matchWinner}
          stats={matchStats}
          onRematch={handleRematch}
          onChangeFighter={() => setScreen('title')}
          onMainMenu={() => setScreen('title')}
        />
      )}

      {/* 4. PAUSE / CONTROLS MODAL */}
      <PauseModal
        isOpen={isPaused || showHelp}
        isMuted={isMuted}
        volume={volume}
        onToggleMute={handleToggleMute}
        onChangeVolume={handleChangeVolume}
        onResume={() => {
          setIsPaused(false);
          setShowHelp(false);
        }}
        onRestart={() => {
          setIsPaused(false);
          setShowHelp(false);
          handleRematch();
        }}
        onMainMenu={() => {
          setIsPaused(false);
          setShowHelp(false);
          setScreen('title');
        }}
      />

    </div>
  );
}
