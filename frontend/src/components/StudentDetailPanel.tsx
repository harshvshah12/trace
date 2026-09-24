import React from 'react';
import { StudentDetail, CheckpointKey } from '../types';
import { Sparkles, Compass, GitBranch, X, Award, ShieldAlert, BookOpen, Layers } from 'lucide-react';

interface StudentDetailPanelProps {
  student: StudentDetail;
  activeCheckpoint: CheckpointKey;
  onClose: () => void;
  onOpenSimulate: () => void;
  showConstellation: boolean;
  onToggleConstellation: () => void;
  showGravities: boolean;
  onToggleGravities: () => void;
}

export const StudentDetailPanel: React.FC<StudentDetailPanelProps> = ({
  student,
  activeCheckpoint,
  onClose,
  onOpenSimulate,
  showConstellation,
  onToggleConstellation,
  showGravities,
  onToggleGravities
}) => {
  const currentCP = student.checkpoints[activeCheckpoint];
  const { probas, pred } = currentCP;

  const targetColor =
    student.target === 'Graduate'
      ? 'text-signal-graduate border-signal-graduate/30 bg-signal-graduate/10'
      : student.target === 'Dropout'
      ? 'text-signal-dropout border-signal-dropout/30 bg-signal-dropout/10'
      : 'text-signal-enrolled border-signal-enrolled/30 bg-signal-enrolled/10';

  return (
    <aside className="absolute top-20 right-4 w-96 z-40 bg-obsidian-900/90 backdrop-blur-xl border border-obsidian-700/70 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[calc(100vh-160px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-obsidian-700/50 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs text-signal-cyan font-semibold">STUDENT #{student.id}</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${targetColor}`}>
              ACTUAL: {student.target}
            </span>
          </div>
          <h2 className="text-xs font-medium text-slate-300 mt-1 leading-snug">
            {student.cluster_title}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-obsidian-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Model Predicted Probability at Active Checkpoint */}
      <div className="bg-obsidian-950/70 border border-obsidian-800 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400">CHECKPOINT PREDICTION</span>
          <span className="font-bold text-slate-200 uppercase">{pred}</span>
        </div>

        {/* Probability Bars */}
        <div className="space-y-1.5">
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-signal-graduate">Graduate</span>
              <span className="text-slate-200">{(probas.graduate * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full h-1.5 bg-obsidian-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-signal-graduate transition-all duration-500 rounded-full shadow-sm shadow-signal-graduate/50"
                style={{ width: `${probas.graduate * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-signal-enrolled">Enrolled</span>
              <span className="text-slate-200">{(probas.enrolled * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full h-1.5 bg-obsidian-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-signal-enrolled transition-all duration-500 rounded-full shadow-sm shadow-signal-enrolled/50"
                style={{ width: `${probas.enrolled * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-signal-dropout">Dropout</span>
              <span className="text-slate-200">{(probas.dropout * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full h-1.5 bg-obsidian-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-signal-dropout transition-all duration-500 rounded-full shadow-sm shadow-signal-dropout/50"
                style={{ width: `${probas.dropout * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-slate-400 border-t border-obsidian-800/60">
          <span>Model Entropy Uncertainty</span>
          <span className="text-slate-300">{(student.uncertainty * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Trajectory Checkpoint Stepper */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Trajectory Checkpoint</span>
        <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[10px]">
          {(['entry', 'sem1', 'sem2'] as CheckpointKey[]).map((cp) => {
            const isCurrent = activeCheckpoint === cp;
            const p = student.checkpoints[cp].probas.graduate;
            return (
              <div
                key={cp}
                className={`py-2 px-1 rounded-lg border transition-all ${
                  isCurrent
                    ? 'border-signal-cyan bg-signal-cyan/15 text-signal-cyan font-bold shadow-sm'
                    : 'border-obsidian-800 bg-obsidian-950/40 text-slate-400'
                }`}
              >
                <div className="uppercase">{cp}</div>
                <div className="text-[9px] text-slate-300 mt-0.5">{(p * 100).toFixed(0)}% Grad</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Predictive Contributors */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span className="uppercase tracking-wider">Top Driving Signals</span>
          <span>Deviation</span>
        </div>
        <div className="space-y-1.5">
          {student.top_features.map((feat) => {
            const isPos = feat.contrib >= 0;
            return (
              <div
                key={feat.name}
                className="flex items-center justify-between text-[11px] font-mono bg-obsidian-950/40 border border-obsidian-800/80 px-2.5 py-1.5 rounded-lg"
              >
                <span className="text-slate-300 text-xs truncate max-w-[190px]">{feat.name}</span>
                <span className={`text-xs font-semibold ${isPos ? 'text-signal-graduate' : 'text-signal-dropout'}`}>
                  {isPos ? '+' : ''}{feat.contrib.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3D Action Tools */}
      <div className="space-y-2 pt-2 border-t border-obsidian-700/50 font-mono">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={onToggleConstellation}
            className={`py-2 px-2.5 rounded-xl border flex items-center justify-center space-x-1.5 transition-all ${
              showConstellation
                ? 'bg-signal-cyan/20 border-signal-cyan text-signal-cyan'
                : 'bg-obsidian-800/60 border-obsidian-700 text-slate-300 hover:bg-obsidian-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>3D STARS</span>
          </button>

          <button
            onClick={onToggleGravities}
            className={`py-2 px-2.5 rounded-xl border flex items-center justify-center space-x-1.5 transition-all ${
              showGravities
                ? 'bg-signal-graduate/20 border-signal-graduate text-signal-graduate'
                : 'bg-obsidian-800/60 border-obsidian-700 text-slate-300 hover:bg-obsidian-700'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>GRAVITIES</span>
          </button>
        </div>

        <button
          onClick={onOpenSimulate}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-signal-cyan/25 to-signal-violet/25 hover:from-signal-cyan/40 hover:to-signal-violet/40 border border-signal-cyan/40 text-signal-cyan font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg"
        >
          <GitBranch className="w-4 h-4" />
          <span>SIMULATE ANOTHER PATH</span>
        </button>
      </div>
    </aside>
  );
};
