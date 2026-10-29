/**
 * Title & Character Selection Screen for NETA FIGHT ARENA
 * Featuring developer credit "Developed by Arnav Kharche", character select,
 * difficulty tuning, controls cheat sheet, and start button.
 */

import React from 'react';
import { Play, Volume2, VolumeX, Shield, Swords, Sparkles, Flame } from 'lucide-react';
import { CharacterId, AIDifficulty } from '../game/types';
import { CHARACTERS } from '../game/characters';

interface TitleScreenProps {
  selectedCharacter: CharacterId;
  onSelectCharacter: (id: CharacterId) => void;
  difficulty: AIDifficulty;
  onSelectDifficulty: (diff: AIDifficulty) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onStartGame: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  selectedCharacter,
  onSelectCharacter,
  difficulty,
  onSelectDifficulty,
  isMuted,
  onToggleMute,
  onStartGame,
}) => {
  const modi = CHARACTERS.modi;
  const rahul = CHARACTERS.rahul;

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 flex flex-col items-center justify-between p-4 sm:p-6 overflow-y-auto overflow-x-hidden text-slate-100 select-none">
      
      {/* Background Decorative Lighting Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-sky-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-slate-900 to-transparent" />
      </div>

      {/* Top Bar: Developer Credit & Audio Toggle */}
      <div className="relative w-full max-w-5xl flex items-center justify-between z-10 pt-2">
        {/* Developer Credit - Prominently Displayed */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <div className="text-xs sm:text-sm font-semibold tracking-wider text-amber-300 drop-shadow">
            Developed by <span className="font-bold text-white underline decoration-amber-400 decoration-2 underline-offset-4">Arnav Kharche</span>
          </div>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={onToggleMute}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-300 transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          <span>{isMuted ? 'Sound Off' : 'Sound On'}</span>
        </button>
      </div>

      {/* Main Center Content: Title Lockup & Character Selection */}
      <div className="relative w-full max-w-5xl flex flex-col items-center my-auto py-6 z-10">
        
        {/* Bespoke Arcade Title Lockup */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-amber-500/40 text-[11px] sm:text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mb-3">
            <Swords size={13} className="text-amber-400" />
            Satirical 2D Political Shadow Fighter
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300">
              NETA
            </span>{' '}
            <span className="text-white">FIGHT</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600">
              ARENA
            </span>
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-lg mx-auto font-medium">
            Step onto the rally stage. Saffron Titans vs Yatra Strikers in the ultimate democratic showdown!
          </p>
        </div>

        {/* Fighter Selection Cards (Modi vs Rahul) */}
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
          
          {/* Narendra Modi Card */}
          <div
            onClick={() => onSelectCharacter('modi')}
            className={`relative rounded-2xl p-4 sm:p-5 border-2 transition-all cursor-pointer flex flex-col justify-between overflow-hidden group ${
              selectedCharacter === 'modi'
                ? 'bg-gradient-to-b from-orange-950/70 to-slate-900/90 border-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.35)] scale-[1.02]'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
            }`}
          >
            {/* Background Saffron Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all" />

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded border border-orange-800/80">
                  {modi.partyName}
                </span>
                {selectedCharacter === 'modi' && (
                  <span className="text-[10px] font-black tracking-widest text-amber-300 uppercase flex items-center gap-1">
                    <Sparkles size={12} /> PLAYER 1
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-orange-300 transition-colors">
                {modi.name}
              </h2>
              <p className="text-xs text-amber-200/80 font-medium mb-3">
                {modi.title}
              </p>

              {/* Character Visual Silhouette Preview & Outfit Badge */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 mb-3">
                <div className="text-[11px] text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span><strong>Costume:</strong> White Kurta-Pajama & Saffron Nehru Jacket</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span><strong>Traits:</strong> Silver Beard, Specs, 56-Inch Stance</span>
                  </div>
                </div>
              </div>

              {/* Special Move */}
              <div className="rounded-lg bg-orange-950/40 border border-orange-900/50 p-2.5">
                <div className="text-[10px] font-mono font-bold text-orange-300 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                  <Flame size={12} /> SPECIAL: {modi.specialName}
                </div>
                <div className="text-xs text-slate-300">
                  {modi.specialDescription}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Power: <strong className="text-white">95/100</strong></span>
              <span className="text-slate-400">Speed: <strong className="text-white">82/100</strong></span>
              <span className="text-slate-400">Range: <strong className="text-white">90/100</strong></span>
            </div>
          </div>

          {/* Rahul Gandhi Card */}
          <div
            onClick={() => onSelectCharacter('rahul')}
            className={`relative rounded-2xl p-4 sm:p-5 border-2 transition-all cursor-pointer flex flex-col justify-between overflow-hidden group ${
              selectedCharacter === 'rahul'
                ? 'bg-gradient-to-b from-sky-950/70 to-slate-900/90 border-sky-500 shadow-[0_0_25px_rgba(2,132,199,0.35)] scale-[1.02]'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
            }`}
          >
            {/* Background Cyan Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all" />

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/80">
                  {rahul.partyName}
                </span>
                {selectedCharacter === 'rahul' && (
                  <span className="text-[10px] font-black tracking-widest text-cyan-300 uppercase flex items-center gap-1">
                    <Sparkles size={12} /> PLAYER 1
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-sky-300 transition-colors">
                {rahul.name}
              </h2>
              <p className="text-xs text-sky-200/80 font-medium mb-3">
                {rahul.title}
              </p>

              {/* Character Visual Silhouette Preview & Outfit Badge */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 mb-3">
                <div className="text-[11px] text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span><strong>Costume:</strong> White Polo T-Shirt & Blue Denim Jeans</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span><strong>Traits:</strong> Athletic Boxer Stance, Wavy Hair, Stubble</span>
                  </div>
                </div>
              </div>

              {/* Special Move */}
              <div className="rounded-lg bg-sky-950/40 border border-sky-900/50 p-2.5">
                <div className="text-[10px] font-mono font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                  <Flame size={12} /> SPECIAL: {rahul.specialName}
                </div>
                <div className="text-xs text-slate-300">
                  {rahul.specialDescription}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Power: <strong className="text-white">88/100</strong></span>
              <span className="text-slate-400">Speed: <strong className="text-white">96/100</strong></span>
              <span className="text-slate-400">Range: <strong className="text-white">88/100</strong></span>
            </div>
          </div>
        </div>

        {/* AI Opponent Difficulty Selector */}
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl p-1.5 mb-6">
          <span className="text-xs text-slate-400 font-medium px-2">AI Level:</span>
          {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((level) => (
            <button
              key={level}
              onClick={() => onSelectDifficulty(level)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                difficulty === level
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {level === 'easy' ? 'Casual Rally' : level === 'medium' ? 'Heated Debate' : 'Election Royale'}
            </button>
          ))}
        </div>

        {/* Big Start Fight CTA Button */}
        <button
          onClick={onStartGame}
          className="group relative px-10 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-black text-lg sm:text-xl tracking-wider uppercase shadow-[0_0_30px_rgba(245,158,11,0.45)] hover:shadow-[0_0_40px_rgba(245,158,11,0.65)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-3"
        >
          <Play size={24} className="fill-white" />
          <span>ENTER ARENA</span>
        </button>

        {/* Controls Quick Reference Footer */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] sm:text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-bold">A / D</span>
            <span>Move</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-bold">W</span>
            <span>Jump</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-bold">J</span>
            <span>Punch</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-bold">K</span>
            <span>Kick</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-bold">L</span>
            <span>Block</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-bold">SPACE</span>
            <span>Super Attack</span>
          </div>
          <div className="text-slate-500 italic">
            · Touch controls active on phones & tablets
          </div>
        </div>

      </div>

      {/* Bottom Footer Attribution */}
      <div className="w-full max-w-5xl flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80 pt-3 z-10">
        <span>A satirical 2D fighting game parody for entertainment purposes.</span>
        <span>Developed by Arnav Kharche</span>
      </div>

    </div>
  );
};
