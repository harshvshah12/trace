import React from 'react';
import { DemoArchetype, CheckpointKey } from '../types';
import { Sparkles, ArrowRight, ArrowLeft, X, Play, Award, RotateCw } from 'lucide-react';

interface DemoOverlayProps {
  demoCases: DemoArchetype[];
  currentCaseIndex: number;
  onSelectCaseIndex: (index: number) => void;
  activeCheckpoint: CheckpointKey;
  onSetCheckpoint: (cp: CheckpointKey) => void;
  onClose: () => void;
}

export const DemoOverlay: React.FC<DemoOverlayProps> = ({
  demoCases,
  currentCaseIndex,
  onSelectCaseIndex,
  activeCheckpoint,
  onSetCheckpoint,
  onClose
}) => {
  if (demoCases.length === 0) return null;
  const currentDemo = demoCases[currentCaseIndex];

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 w-[580px] max-w-[calc(100vw-32px)]">
      <div className="bg-obsidian-900/95 backdrop-blur-2xl border border-signal-cyan/40 rounded-2xl p-5 shadow-2xl space-y-4 ring-1 ring-signal-cyan/20">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-signal-cyan/20 border border-signal-cyan/40 flex items-center justify-center text-signal-cyan">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-signal-cyan font-bold">
                EVALUATOR GUIDED DEMONSTRATION TOUR
              </span>
              <h3 className="text-sm font-bold text-slate-100">{currentDemo.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-obsidian-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Narrative Description */}
        <p className="text-xs text-slate-300 font-mono leading-relaxed bg-obsidian-950/60 border border-obsidian-800 p-3 rounded-xl">
          {currentDemo.narrative}
        </p>

        {/* 3 Archetype Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 font-mono text-xs">
          {demoCases.map((d, idx) => {
            const isSelected = currentCaseIndex === idx;
            return (
              <button
                key={d.demo_case}
                onClick={() => onSelectCaseIndex(idx)}
                className={`p-2 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-signal-cyan/20 border-signal-cyan text-signal-cyan font-bold shadow-md shadow-signal-cyan/15'
                    : 'bg-obsidian-950/40 border-obsidian-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div>CASE {d.demo_case}</div>
                <div className="text-[10px] text-slate-400">Student #{d.student_id}</div>
              </button>
            );
          })}
        </div>

        {/* Checkpoint Stepper Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-obsidian-800 font-mono text-xs">
          <div className="flex items-center space-x-1">
            {(['entry', 'sem1', 'sem2'] as CheckpointKey[]).map((cp) => (
              <button
                key={cp}
                onClick={() => onSetCheckpoint(cp)}
                className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold border transition-all ${
                  activeCheckpoint === cp
                    ? 'bg-signal-cyan text-obsidian-950 border-signal-cyan'
                    : 'bg-obsidian-800 text-slate-400 border-obsidian-700 hover:text-slate-200'
                }`}
              >
                {cp}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onSelectCaseIndex((currentCaseIndex - 1 + demoCases.length) % demoCases.length)}
              className="p-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 border border-obsidian-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] text-slate-400">
              {currentCaseIndex + 1} / {demoCases.length}
            </span>
            <button
              onClick={() => onSelectCaseIndex((currentCaseIndex + 1) % demoCases.length)}
              className="p-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 border border-obsidian-700 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
