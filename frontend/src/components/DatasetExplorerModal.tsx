import React from 'react';
import { X, Database, ShieldCheck, CheckCircle2, FileText } from 'lucide-react';

interface DatasetExplorerModalProps {
  onClose: () => void;
}

export const DatasetExplorerModal: React.FC<DatasetExplorerModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-obsidian-950/80 backdrop-blur-md">
      <div className="bg-obsidian-900 border border-obsidian-700/80 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-signal-cyan/20 border border-signal-cyan/40 flex items-center justify-center text-signal-cyan">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 tracking-wide">
                UCI DATASET ID 697 AUDIT & SCHEMA EXPLORER
              </h2>
              <p className="text-[11px] text-slate-400">
                Predict Students' Dropout and Academic Success (Polytechnic Institute of Portalegre)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-obsidian-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-300">
          {/* Quick Metrics */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-obsidian-950/80 border border-obsidian-800">
              <div className="text-[10px] text-slate-400 uppercase">Records</div>
              <div className="text-base font-bold text-signal-cyan mt-0.5">4,424</div>
            </div>
            <div className="p-3 rounded-xl bg-obsidian-950/80 border border-obsidian-800">
              <div className="text-[10px] text-slate-400 uppercase">Predictors</div>
              <div className="text-base font-bold text-slate-100 mt-0.5">36</div>
            </div>
            <div className="p-3 rounded-xl bg-obsidian-950/80 border border-obsidian-800">
              <div className="text-[10px] text-slate-400 uppercase">Classes</div>
              <div className="text-base font-bold text-signal-graduate mt-0.5">3</div>
            </div>
            <div className="p-3 rounded-xl bg-obsidian-950/80 border border-obsidian-800">
              <div className="text-[10px] text-slate-400 uppercase">Missing Values</div>
              <div className="text-base font-bold text-signal-graduate mt-0.5">0</div>
            </div>
          </div>

          {/* Temporal Checkpoint Partitions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-signal-cyan" />
              <span>Temporal Checkpoint Partitions (Zero Data Leakage)</span>
            </h4>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-obsidian-950/60 border border-obsidian-800 space-y-1">
                <div className="flex justify-between font-bold text-slate-200">
                  <span className="text-signal-cyan">CHECKPOINT 01: ENTRY (24 Features)</span>
                  <span className="text-slate-400 text-[10px]">Enrollment Baseline</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Demographic profiles, admission grades, previous schooling, displaced status, debtor status, tuition standing, and macroeconomic context (unemployment rate, inflation, GDP).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-obsidian-950/60 border border-obsidian-800 space-y-1">
                <div className="flex justify-between font-bold text-slate-200">
                  <span className="text-signal-cyan">CHECKPOINT 02: SEMESTER 1 (30 Features)</span>
                  <span className="text-slate-400 text-[10px]">+6 First-Semester Academics</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Entry + Curricular units 1st sem (credited, enrolled, evaluations, approved, grade, without evaluations). Future 2nd semester data is strictly quarantined.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-obsidian-950/60 border border-obsidian-800 space-y-1">
                <div className="flex justify-between font-bold text-slate-200">
                  <span className="text-signal-cyan">CHECKPOINT 03: SEMESTER 2 (36 Features)</span>
                  <span className="text-slate-400 text-[10px]">+6 Second-Semester Velocity</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Full academic trajectory: 2nd sem credits, evaluations, approved units, and GPA.
                </p>
              </div>
            </div>
          </div>

          {/* Academic Citation */}
          <div className="p-3 rounded-xl bg-obsidian-950/80 border border-obsidian-800 text-[10px] text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Dataset Citation:</strong> Realinho, V., Machado, J., Baptista, L., & Rocha, M. (2021). <em>Predict Students' Dropout and Academic Success</em> [Dataset]. UCI Machine Learning Repository. https://doi.org/10.24432/C5MC89.
          </div>
        </div>
      </div>
    </div>
  );
};
