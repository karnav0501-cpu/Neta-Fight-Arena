/**
 * Pause & Controls Modal for NETA FIGHT ARENA
 */

import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Keyboard, Smartphone } from 'lucide-react';

interface PauseModalProps {
  isOpen: boolean;
  isMuted: boolean;
  volume: number;
  onToggleMute: () => void;
  onChangeVolume: (vol: number) => void;
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  isMuted,
  volume,
  onToggleMute,
  onChangeVolume,
  onResume,
  onRestart,
  onMainMenu,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col items-center">
        
        <h2 className="text-2xl font-black uppercase tracking-wider text-white mb-4">
          GAME PAUSED
        </h2>

        {/* Volume & Audio Settings */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300">Audio Volume</span>
            <button
              onClick={onToggleMute}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-medium"
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>{isMuted ? 'Muted' : 'Enabled'}</span>
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Controls Quick Cheatsheet */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 mb-5 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-2">
            <Keyboard size={15} />
            <span>PC KEYBOARD</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-mono">
            <div><span className="text-white font-bold">A / D</span>: Move Left / Right</div>
            <div><span className="text-white font-bold">W / S</span>: Jump / Duck</div>
            <div><span className="text-white font-bold">J</span>: Light Punch</div>
            <div><span className="text-white font-bold">U</span>: 56&quot; Heavy Punch</div>
            <div><span className="text-white font-bold">K</span>: Light Kick</div>
            <div><span className="text-white font-bold">I</span>: High Kick</div>
            <div><span className="text-white font-bold">L</span>: Block Guard</div>
            <div><span className="text-white font-bold">SPACE</span>: Special Move</div>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-sky-400 mt-3 mb-1">
            <Smartphone size={15} />
            <span>MOBILE / TABLET TOUCH</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Use the virtual D-Pad on the left and action buttons on the right. Tap SUPER when the golden meter fills.
          </p>
        </div>

        {/* Modal Buttons */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={onResume}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Play size={16} className="fill-slate-950" />
            <span>RESUME FIGHT</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={15} />
            <span>RESTART ROUND</span>
          </button>

          <button
            onClick={onMainMenu}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white font-bold text-xs uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home size={15} />
            <span>QUIT TO MAIN MENU</span>
          </button>
        </div>

        <div className="mt-4 text-[10px] text-slate-500">
          Developed by Arnav Kharche
        </div>

      </div>
    </div>
  );
};
