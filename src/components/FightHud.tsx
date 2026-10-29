/**
 * Fighting HUD Component for NETA FIGHT ARENA
 * Top health bars, round counters, timer, super meters, and audio controls.
 */

import React from 'react';
import { Volume2, VolumeX, Pause, HelpCircle } from 'lucide-react';
import { FighterEntity, CharacterId } from '../game/types';
import { CHARACTERS } from '../game/characters';

interface FightHudProps {
  player: FighterEntity;
  opponent: FighterEntity;
  roundNumber: number;
  timeRemaining: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenPause: () => void;
  onOpenHelp: () => void;
}

export const FightHud: React.FC<FightHudProps> = ({
  player,
  opponent,
  roundNumber,
  timeRemaining,
  isMuted,
  onToggleMute,
  onOpenPause,
  onOpenHelp,
}) => {
  const p1Config = CHARACTERS[player.id];
  const p2Config = CHARACTERS[opponent.id];

  const p1HealthPct = Math.max(0, Math.min(100, (player.health / player.maxHealth) * 100));
  const p1DisplayHealthPct = Math.max(0, Math.min(100, (player.displayHealth / player.maxHealth) * 100));

  const p2HealthPct = Math.max(0, Math.min(100, (opponent.health / opponent.maxHealth) * 100));
  const p2DisplayHealthPct = Math.max(0, Math.min(100, (opponent.displayHealth / opponent.maxHealth) * 100));

  const p1SuperPct = Math.max(0, Math.min(100, (player.superMeter / player.maxSuperMeter) * 100));
  const p2SuperPct = Math.max(0, Math.min(100, (opponent.superMeter / opponent.maxSuperMeter) * 100));

  const p1SuperReady = player.superMeter >= player.maxSuperMeter;
  const p2SuperReady = opponent.superMeter >= opponent.maxSuperMeter;

  return (
    <div className="absolute inset-x-0 top-0 pointer-events-none p-3 sm:p-5 flex flex-col justify-between select-none z-10">
      {/* Top HUD: Health Bars, Timer, Round Points, Utility Buttons */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* PLAYER 1 (Left) */}
        <div className="flex-1 flex flex-col items-start min-w-0">
          <div className="flex items-center gap-2 mb-1 w-full justify-start">
            {/* Fighter Badge */}
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded border-2 flex items-center justify-center font-black text-xs sm:text-sm shadow-md"
              style={{
                backgroundColor: p1Config.primaryColor,
                borderColor: p1Config.secondaryColor,
                color: '#ffffff',
              }}
            >
              {player.id === 'modi' ? 'NM' : 'RG'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs sm:text-base tracking-wide text-white drop-shadow truncate">
                  {p1Config.name}
                </span>
                <span className="text-[10px] text-amber-300 font-bold hidden md:inline">
                  (P1)
                </span>
              </div>
              {/* Round Wins */}
              <div className="flex items-center gap-1">
                {[0, 1].map((idx) => (
                  <div
                    key={idx}
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-black/60 transition-colors ${
                      player.roundsWon > idx
                        ? player.id === 'modi'
                          ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                          : 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]'
                        : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Health Bar Frame */}
          <div className="w-full h-5 sm:h-6 bg-slate-950/90 border-2 border-slate-700/80 rounded relative overflow-hidden shadow-lg">
            {/* Trailing Damage Bar (Red) */}
            <div
              className="absolute inset-y-0 left-0 bg-red-600 transition-all duration-300 ease-out"
              style={{ width: `${p1DisplayHealthPct}%` }}
            />
            {/* Active Health Bar */}
            <div
              className={`absolute inset-y-0 left-0 transition-all duration-75 ${
                p1HealthPct > 40
                  ? player.id === 'modi'
                    ? 'bg-gradient-to-r from-amber-600 via-orange-500 to-amber-300'
                    : 'bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400'
                  : 'bg-gradient-to-r from-red-700 via-red-500 to-amber-500'
              }`}
              style={{ width: `${p1HealthPct}%` }}
            />
            {/* Health readout */}
            <span className="absolute inset-0 flex items-center justify-start pl-2 font-mono text-[10px] sm:text-xs font-bold text-white drop-shadow">
              {Math.ceil(player.health)} HP
            </span>
          </div>
        </div>

        {/* CENTER: Round Timer & Round Counter */}
        <div className="flex flex-col items-center justify-center px-2">
          <div className="text-[10px] sm:text-xs font-black tracking-widest text-amber-400 uppercase drop-shadow">
            ROUND {roundNumber}
          </div>
          <div className="bg-slate-900/90 border-2 border-amber-500/80 rounded-md px-3 py-0.5 sm:px-4 sm:py-1 shadow-2xl min-w-[50px] sm:min-w-[68px] text-center">
            <span
              className={`font-mono font-black text-xl sm:text-3xl tabular-nums ${
                timeRemaining <= 15 ? 'text-red-500 animate-pulse' : 'text-white'
              }`}
            >
              {timeRemaining.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* OPPONENT (Right) */}
        <div className="flex-1 flex flex-col items-end min-w-0">
          <div className="flex items-center gap-2 mb-1 w-full justify-end">
            <div className="min-w-0 text-right">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-[10px] text-red-400 font-bold hidden md:inline">
                  (AI)
                </span>
                <span className="font-black text-xs sm:text-base tracking-wide text-white drop-shadow truncate">
                  {p2Config.name}
                </span>
              </div>
              {/* Round Wins */}
              <div className="flex items-center justify-end gap-1">
                {[0, 1].map((idx) => (
                  <div
                    key={idx}
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-black/60 transition-colors ${
                      opponent.roundsWon > idx
                        ? opponent.id === 'modi'
                          ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                          : 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]'
                        : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
            {/* Fighter Badge */}
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded border-2 flex items-center justify-center font-black text-xs sm:text-sm shadow-md"
              style={{
                backgroundColor: p2Config.primaryColor,
                borderColor: p2Config.secondaryColor,
                color: '#ffffff',
              }}
            >
              {opponent.id === 'modi' ? 'NM' : 'RG'}
            </div>
          </div>

          {/* Health Bar Frame */}
          <div className="w-full h-5 sm:h-6 bg-slate-950/90 border-2 border-slate-700/80 rounded relative overflow-hidden shadow-lg">
            {/* Trailing Damage Bar (Red) */}
            <div
              className="absolute inset-y-0 right-0 bg-red-600 transition-all duration-300 ease-out"
              style={{ width: `${p2DisplayHealthPct}%` }}
            />
            {/* Active Health Bar */}
            <div
              className={`absolute inset-y-0 right-0 transition-all duration-75 ${
                p2HealthPct > 40
                  ? opponent.id === 'modi'
                    ? 'bg-gradient-to-l from-amber-600 via-orange-500 to-amber-300'
                    : 'bg-gradient-to-l from-blue-600 via-cyan-500 to-emerald-400'
                  : 'bg-gradient-to-l from-red-700 via-red-500 to-amber-500'
              }`}
              style={{ width: `${p2HealthPct}%` }}
            />
            {/* Health readout */}
            <span className="absolute inset-0 flex items-center justify-end pr-2 font-mono text-[10px] sm:text-xs font-bold text-white drop-shadow">
              {Math.ceil(opponent.health)} HP
            </span>
          </div>
        </div>

        {/* Quick Utilities (Pointer events enabled) */}
        <div className="flex items-center gap-1.5 ml-1 pointer-events-auto">
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="p-1.5 sm:p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded cursor-pointer transition-colors active:scale-95"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button
            onClick={onOpenPause}
            aria-label="Pause Game"
            className="p-1.5 sm:p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded cursor-pointer transition-colors active:scale-95"
          >
            <Pause size={16} />
          </button>
          <button
            onClick={onOpenHelp}
            aria-label="Controls Guide"
            className="p-1.5 sm:p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded cursor-pointer transition-colors active:scale-95 hidden sm:flex"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </div>

      {/* Bottom Super Meters */}
      <div className="w-full max-w-6xl mx-auto flex items-end justify-between gap-4 mt-auto pb-1">
        {/* Player Super Meter */}
        <div className="flex flex-col items-start w-44 sm:w-64">
          <div className="flex items-center justify-between w-full mb-0.5">
            <span
              className={`text-[10px] sm:text-xs font-black tracking-wider uppercase drop-shadow ${
                p1SuperReady ? 'text-amber-400 animate-pulse' : 'text-slate-400'
              }`}
            >
              {p1SuperReady ? '★ SUPER READY (SPACE) ★' : 'SUPER METER'}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {Math.floor(p1SuperPct)}%
            </span>
          </div>
          <div className="w-full h-3 sm:h-3.5 bg-slate-950/80 border border-slate-700 rounded relative overflow-hidden">
            <div
              className={`h-full transition-all duration-100 ${
                p1SuperReady
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_12px_#fbbf24]'
                  : 'bg-gradient-to-r from-indigo-600 to-cyan-500'
              }`}
              style={{ width: `${p1SuperPct}%` }}
            />
          </div>
        </div>

        {/* Opponent Super Meter */}
        <div className="flex flex-col items-end w-44 sm:w-64">
          <div className="flex items-center justify-between w-full mb-0.5">
            <span className="text-[10px] font-mono text-slate-400">
              {Math.floor(p2SuperPct)}%
            </span>
            <span
              className={`text-[10px] sm:text-xs font-black tracking-wider uppercase drop-shadow ${
                p2SuperReady ? 'text-red-400 animate-pulse' : 'text-slate-400'
              }`}
            >
              {p2SuperReady ? '★ AI SUPER CHARGED ★' : 'AI SUPER'}
            </span>
          </div>
          <div className="w-full h-3 sm:h-3.5 bg-slate-950/80 border border-slate-700 rounded relative overflow-hidden">
            <div
              className={`h-full ml-auto transition-all duration-100 ${
                p2SuperReady
                  ? 'bg-gradient-to-l from-red-500 via-amber-400 to-red-600 shadow-[0_0_12px_#ef4444]'
                  : 'bg-gradient-to-l from-slate-700 to-slate-500'
              }`}
              style={{ width: `${p2SuperPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
