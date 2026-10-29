/**
 * Game Over & Victory/Defeat Modal for NETA FIGHT ARENA
 * Displays round results, match statistics, satirical quotes, and rematch button.
 */

import React from 'react';
import { RotateCcw, Users, Home, Trophy, Swords, Zap, Timer } from 'lucide-react';
import { CharacterId, GameStats } from '../game/types';
import { CHARACTERS } from '../game/characters';

interface GameOverModalProps {
  playerCharId: CharacterId;
  winnerCharId: CharacterId;
  stats: GameStats;
  onRematch: () => void;
  onChangeFighter: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  playerCharId,
  winnerCharId,
  stats,
  onRematch,
  onChangeFighter,
  onMainMenu,
}) => {
  const isPlayerWinner = playerCharId === winnerCharId;
  const winnerConfig = CHARACTERS[winnerCharId];
  const quote = winnerConfig.quotes.win[Math.floor(Math.random() * winnerConfig.quotes.win.length)];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-100 flex flex-col items-center">
        
        {/* Glow Header */}
        <div
          className="absolute -top-24 inset-x-0 h-44 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: isPlayerWinner ? '#f59e0b' : '#ef4444' }}
        />

        {/* Victory/Defeat Banner */}
        <div className="flex items-center gap-2 mb-1">
          <Trophy
            size={24}
            className={isPlayerWinner ? 'text-amber-400' : 'text-slate-500'}
          />
          <h2
            className={`text-3xl sm:text-4xl font-black uppercase tracking-wider drop-shadow-md ${
              isPlayerWinner
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200'
                : 'text-red-500'
            }`}
          >
            {isPlayerWinner ? 'VICTORY!' : 'DEFEATED!'}
          </h2>
        </div>

        {/* Winner Tagline */}
        <div className="text-center mb-4">
          <div className="text-base sm:text-lg font-bold text-white">
            {winnerConfig.name} Claims the Arena!
          </div>
          <div className="text-xs text-slate-400">
            {winnerConfig.title}
          </div>
        </div>

        {/* Satirical Winner Speech Bubble */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 mb-5 relative">
          <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 mb-1 font-bold">
            {winnerConfig.name} says:
          </div>
          <p className="text-xs sm:text-sm italic text-slate-200 font-medium">
            &ldquo;{quote}&rdquo;
          </p>
        </div>

        {/* Match Statistics Grid */}
        <div className="w-full grid grid-cols-2 gap-2.5 mb-6 text-xs">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 flex items-center gap-2.5">
            <Swords size={18} className="text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Damage Dealt</div>
              <div className="font-mono font-bold text-sm text-white">
                {Math.round(stats.damageDealt)}
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 flex items-center gap-2.5">
            <Zap size={18} className="text-cyan-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Max Combo</div>
              <div className="font-mono font-bold text-sm text-white">
                {stats.maxCombo} Hits
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 flex items-center gap-2.5">
            <Zap size={18} className="text-red-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Supers Unleashed</div>
              <div className="font-mono font-bold text-sm text-white">
                {stats.supersUsed}
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 flex items-center gap-2.5">
            <Timer size={18} className="text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Match Time</div>
              <div className="font-mono font-bold text-sm text-white">
                {Math.round(stats.matchDurationSec)}s
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          {/* Rematch Button */}
          <button
            onClick={onRematch}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-sm tracking-wider uppercase shadow-lg shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={17} />
            <span>PLAY AGAIN / REMATCH</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            {/* Change Fighter */}
            <button
              onClick={onChangeFighter}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Users size={15} />
              <span>CHOOSE FIGHTER</span>
            </button>

            {/* Main Menu */}
            <button
              onClick={onMainMenu}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Home size={15} />
              <span>MAIN MENU</span>
            </button>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 text-center w-full">
          Neta Fight Arena · Developed by Arnav Kharche
        </div>

      </div>
    </div>
  );
};
