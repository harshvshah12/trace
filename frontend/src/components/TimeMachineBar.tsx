import React, { useState, useEffect } from 'react';
import { CheckpointKey } from '../types';
import { Play, Pause, FastForward, Clock } from 'lucide-react';

interface TimeMachineBarProps {
  activeCheckpoint: CheckpointKey;
  onSetCheckpoint: (cp: CheckpointKey) => void;
  isReplaying: boolean;
  onToggleReplay: () => void;
}

export const TimeMachineBar: React.FC<TimeMachineBarProps> = ({
  activeCheckpoint,
  onSetCheckpoint,
  isReplaying,
  onToggleReplay
}) => {
  const steps: { key: CheckpointKey; label: string; desc: string; features: string }[] = [
    {
      key: 'entry',
      label: 'CHECKPOINT 01',
      desc: 'ENTRY PROFILE',
      features: '24 baseline features (demographics, prior schooling, macroeconomics)'
    },
    {
      key: 'sem1',
      label: 'CHECKPOINT 02',
      desc: 'SEMESTER 1',
      features: '+6 features arrived (approved credits, evaluations, 1st sem grade)'
    },
    {
      key: 'sem2',
      label: 'CHECKPOINT 03',
      desc: 'SEMESTER 2',
      features: '+6 features arrived (cumulative 2nd sem credits & velocity)'
    }
  ];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-[640px] max-w-[calc(100vw-48px)]">
      <div className="bg-obsidian-900/90 backdrop-blur-xl border border-obsidian-700/70 rounded-2xl p-4 shadow-2xl space-y-3">
        {/* Top Header & Replay Control */}
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-signal-cyan" />
            <span className="font-bold text-signal-cyan">TEMPORAL TIME MACHINE</span>
            <span className="text-[10px] text-slate-400">| Evidence Arrival Scrubber</span>
          </div>

          <button
            onClick={onToggleReplay}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
              isReplaying
                ? 'bg-signal-cyan text-obsidian-950 shadow-md shadow-signal-cyan/30'
                : 'bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 border border-obsidian-700'
            }`}
          >
            {isReplaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
            <span>{isReplaying ? 'PAUSE' : 'REPLAY TRAJECTORY'}</span>
          </button>
        </div>

        {/* 3 Step Interactive Nodes */}
        <div className="grid grid-cols-3 gap-2">
          {steps.map((st) => {
            const isSelected = activeCheckpoint === st.key;
            return (
              <button
                key={st.key}
                onClick={() => onSetCheckpoint(st.key)}
                className={`p-2.5 rounded-xl border text-left font-mono transition-all ${
                  isSelected
                    ? 'bg-signal-cyan/20 border-signal-cyan text-slate-100 shadow-lg shadow-signal-cyan/15 ring-1 ring-signal-cyan/40'
                    : 'bg-obsidian-950/60 border-obsidian-800 text-slate-400 hover:border-obsidian-700 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-bold ${isSelected ? 'text-signal-cyan' : 'text-slate-500'}`}>
                    {st.label}
                  </span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-signal-cyan animate-ping" />}
                </div>
                <div className="text-xs font-bold mt-0.5 text-slate-200">{st.desc}</div>
                <div className="text-[9px] text-slate-400 mt-1 truncate">{st.features}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
