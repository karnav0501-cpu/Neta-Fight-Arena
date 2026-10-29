/**
 * Responsive On-Screen Touch Controls for Mobile and Tablet Devices
 * Supports multi-touch, directional D-Pad, combat buttons, and haptic feedback.
 */

import React, { useCallback } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Shield, Zap } from 'lucide-react';
import { InputState } from '../game/engine';

interface TouchControlsProps {
  onInputUpdate: (key: keyof InputState, value: boolean) => void;
  superReady: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onInputUpdate,
  superReady,
}) => {
  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // Ignore haptic error
      }
    }
  }, []);

  const createTouchHandler = (key: keyof InputState) => {
    return {
      onTouchStart: (e: React.TouchEvent) => {
        e.preventDefault();
        onInputUpdate(key, true);
        triggerHaptic();
      },
      onTouchEnd: (e: React.TouchEvent) => {
        e.preventDefault();
        onInputUpdate(key, false);
      },
      onTouchCancel: (e: React.TouchEvent) => {
        e.preventDefault();
        onInputUpdate(key, false);
      },
      onMouseDown: () => {
        onInputUpdate(key, true);
        triggerHaptic();
      },
      onMouseUp: () => {
        onInputUpdate(key, false);
      },
      onMouseLeave: () => {
        onInputUpdate(key, false);
      },
    };
  };

  return (
    <div className="absolute inset-x-0 bottom-0 pointer-events-none select-none z-20 pb-3 px-3 sm:px-6 flex items-end justify-between gap-2 touch-none">
      
      {/* LEFT SIDE: Directional Controls (Move Left, Right, Jump, Crouch) */}
      <div className="pointer-events-auto flex items-end gap-1.5 sm:gap-2">
        <div className="grid grid-cols-3 grid-rows-2 gap-1.5 w-36 sm:w-44 h-24 sm:h-28">
          {/* Jump Button (Up) */}
          <button
            {...createTouchHandler('jump')}
            className="col-start-2 row-start-1 bg-slate-900/85 hover:bg-slate-800 active:bg-amber-500/80 active:text-white border-2 border-slate-700/80 rounded-xl flex items-center justify-center text-slate-200 shadow-xl transition-all cursor-pointer"
            aria-label="Jump (W)"
          >
            <ArrowUp size={22} className="stroke-[3]" />
          </button>

          {/* Move Left Button */}
          <button
            {...createTouchHandler('left')}
            className="col-start-1 row-start-2 bg-slate-900/85 hover:bg-slate-800 active:bg-amber-500/80 active:text-white border-2 border-slate-700/80 rounded-xl flex items-center justify-center text-slate-200 shadow-xl transition-all cursor-pointer"
            aria-label="Move Left (A)"
          >
            <ArrowLeft size={22} className="stroke-[3]" />
          </button>

          {/* Crouch Button (Down) */}
          <button
            {...createTouchHandler('crouch')}
            className="col-start-2 row-start-2 bg-slate-900/85 hover:bg-slate-800 active:bg-amber-500/80 active:text-white border-2 border-slate-700/80 rounded-xl flex items-center justify-center text-slate-200 shadow-xl transition-all cursor-pointer"
            aria-label="Crouch (S)"
          >
            <ArrowDown size={22} className="stroke-[3]" />
          </button>

          {/* Move Right Button */}
          <button
            {...createTouchHandler('right')}
            className="col-start-3 row-start-2 bg-slate-900/85 hover:bg-slate-800 active:bg-amber-500/80 active:text-white border-2 border-slate-700/80 rounded-xl flex items-center justify-center text-slate-200 shadow-xl transition-all cursor-pointer"
            aria-label="Move Right (D)"
          >
            <ArrowRight size={22} className="stroke-[3]" />
          </button>
        </div>
      </div>

      {/* RIGHT SIDE: Action Buttons (Punch, Kick, Block, Super Attack) */}
      <div className="pointer-events-auto flex flex-col items-end gap-1.5 sm:gap-2">
        {/* Top Row: Special Move & Block */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Block Button */}
          <button
            {...createTouchHandler('block')}
            className="h-11 sm:h-12 px-3 sm:px-4 bg-sky-950/80 active:bg-sky-600 border-2 border-sky-600/70 rounded-xl flex items-center justify-center gap-1.5 text-sky-200 font-black text-xs sm:text-sm shadow-xl transition-all cursor-pointer"
            aria-label="Block (L)"
          >
            <Shield size={16} />
            <span>BLOCK</span>
          </button>

          {/* SUPER ATTACK BUTTON */}
          <button
            {...createTouchHandler('special')}
            disabled={!superReady}
            className={`h-11 sm:h-12 px-4 sm:px-5 rounded-xl flex items-center justify-center gap-1.5 font-black text-xs sm:text-sm shadow-xl transition-all cursor-pointer border-2 ${
              superReady
                ? 'bg-gradient-to-r from-amber-500 to-red-600 border-yellow-300 text-white animate-pulse shadow-[0_0_15px_#f59e0b]'
                : 'bg-slate-900/70 border-slate-700 text-slate-500 opacity-60 cursor-not-allowed'
            }`}
            aria-label="Super Move (Space)"
          >
            <Zap size={16} className={superReady ? 'fill-yellow-200 text-yellow-200' : ''} />
            <span>SUPER</span>
          </button>
        </div>

        {/* Bottom Cluster: Melee Attacks */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          {/* Light Punch */}
          <button
            {...createTouchHandler('punch')}
            className="w-16 sm:w-20 h-12 sm:h-14 bg-amber-950/80 hover:bg-amber-900 active:bg-amber-500 border-2 border-amber-600/80 rounded-xl flex flex-col items-center justify-center text-amber-200 font-black text-xs sm:text-sm shadow-xl cursor-pointer"
            aria-label="Punch (J)"
          >
            <span>PUNCH</span>
            <span className="text-[9px] text-amber-400 font-mono">J</span>
          </button>

          {/* Heavy Punch */}
          <button
            {...createTouchHandler('heavyPunch')}
            className="w-16 sm:w-20 h-12 sm:h-14 bg-orange-950/80 hover:bg-orange-900 active:bg-orange-500 border-2 border-orange-500/80 rounded-xl flex flex-col items-center justify-center text-orange-200 font-black text-xs sm:text-sm shadow-xl cursor-pointer"
            aria-label="Heavy Punch (U)"
          >
            <span>56&quot; FIST</span>
            <span className="text-[9px] text-orange-400 font-mono">U</span>
          </button>

          {/* Light Kick */}
          <button
            {...createTouchHandler('kick')}
            className="w-16 sm:w-20 h-12 sm:h-14 bg-emerald-950/80 hover:bg-emerald-900 active:bg-emerald-500 border-2 border-emerald-600/80 rounded-xl flex flex-col items-center justify-center text-emerald-200 font-black text-xs sm:text-sm shadow-xl cursor-pointer"
            aria-label="Kick (K)"
          >
            <span>KICK</span>
            <span className="text-[9px] text-emerald-400 font-mono">K</span>
          </button>

          {/* Heavy Kick */}
          <button
            {...createTouchHandler('heavyKick')}
            className="w-16 sm:w-20 h-12 sm:h-14 bg-teal-950/80 hover:bg-teal-900 active:bg-teal-500 border-2 border-teal-500/80 rounded-xl flex flex-col items-center justify-center text-teal-200 font-black text-xs sm:text-sm shadow-xl cursor-pointer"
            aria-label="Heavy Kick (I)"
          >
            <span>HI-KICK</span>
            <span className="text-[9px] text-teal-400 font-mono">I</span>
          </button>
        </div>
      </div>
    </div>
  );
};
