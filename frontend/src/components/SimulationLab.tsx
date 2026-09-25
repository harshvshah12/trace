import React, { useState } from 'react';
import { StudentDetail, SimulationBranch } from '../types';
import { GitBranch, RotateCcw, Plus, AlertCircle, CheckCircle, ChevronRight, X } from 'lucide-react';

interface SimulationLabProps {
  student: StudentDetail;
  branches: SimulationBranch[];
  onAddBranch: (changes: Record<string, any>, name: string) => Promise<void>;
  onResetBranches: () => void;
  onClose: () => void;
  activeBranchId: string | null;
  onSelectBranch: (id: string) => void;
}

export const SimulationLab: React.FC<SimulationLabProps> = ({
  student,
  branches,
  onAddBranch,
  onResetBranches,
  onClose,
  activeBranchId,
  onSelectBranch
}) => {
  const [sem1Approved, setSem1Approved] = useState<number>(student.metadata.sem1_approved);
  const [sem2Approved, setSem2Approved] = useState<number>(student.metadata.sem2_approved);
  const [tuitionOk, setTuitionOk] = useState<boolean>(student.metadata.tuition_ok);
  const [scholarship, setScholarship] = useState<boolean>(student.metadata.scholarship);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const handleSimulate = async () => {
    setIsSimulating(true);
    const branchLetter = String.fromCharCode(65 + branches.length);
    const branchName = `Path ${branchLetter}`;

    await onAddBranch(
      {
        sem1_approved: sem1Approved,
        sem2_approved: sem2Approved,
        tuition_ok: tuitionOk,
        scholarship: scholarship
      },
      branchName
    );
    setIsSimulating(false);
  };

  return (
    <aside className="absolute top-20 left-4 w-[420px] z-40 bg-obsidian-900/90 backdrop-blur-xl border border-obsidian-700/70 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[calc(100vh-160px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-obsidian-700/50 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-signal-cyan" />
            <span className="font-mono text-xs text-signal-cyan font-bold">COUNTERFACTUAL LAB</span>
          </div>
          <h2 className="text-xs font-semibold text-slate-200 mt-1">
            Simulate Another Path for Student #{student.id}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-obsidian-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Plain-English Educational Callout */}
      <div className="bg-signal-cyan/10 border border-signal-cyan/30 rounded-xl p-3 space-y-1.5 font-mono">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-signal-cyan uppercase tracking-wider flex items-center space-x-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>WHAT IS THIS EXPERIMENT DOING?</span>
          </span>
        </div>
        <p className="text-[11px] text-slate-200 leading-relaxed font-sans">
          This is a <strong>"What-If" time machine</strong>. In real life, if a struggling student receives academic tutoring and passes more classes, or gets financial help to pay their tuition, their future trajectory changes.
        </p>
        <p className="text-[10px] text-slate-300 font-sans border-t border-signal-cyan/20 pt-1.5">
          Move the sliders below to change their grades or tuition status, then click <strong className="text-signal-cyan">BRANCH PATH</strong>. TRACE will calculate the new probabilities and draw an alternate cyan path curving through space!
        </p>
      </div>

      {/* Dynamic Scenario Readout */}
      <div className="bg-obsidian-950/70 border border-obsidian-800 rounded-xl p-2.5 text-[11px] text-slate-300 font-mono">
        <span className="text-[9px] text-slate-400 uppercase tracking-wide block mb-0.5">CURRENT TEST SCENARIO:</span>
        Passing <strong className="text-signal-cyan">{sem1Approved} classes</strong> in Sem 1 & <strong className="text-signal-cyan">{sem2Approved} classes</strong> in Sem 2 with tuition <strong className={tuitionOk ? 'text-signal-graduate' : 'text-signal-dropout'}>{tuitionOk ? 'Paid' : 'Unpaid'}</strong> and <strong className={scholarship ? 'text-signal-cyan' : 'text-slate-400'}>{scholarship ? 'Scholarship' : 'No Scholarship'}</strong>.
      </div>

      {/* Variable Adjustments */}
      <div className="space-y-3.5 bg-obsidian-950/50 border border-obsidian-800 rounded-xl p-3.5 font-mono text-xs">
        {/* Sem 1 Approved Units */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-300">1st Sem Approved Credits</span>
            <span className="text-signal-cyan font-bold">{sem1Approved} units</span>
          </div>
          <input
            type="range"
            min={0}
            max={8}
            step={1}
            value={sem1Approved}
            onChange={(e) => setSem1Approved(Number(e.target.value))}
            className="w-full accent-signal-cyan cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>0 units</span>
            <span>Observed: {student.metadata.sem1_approved}</span>
            <span>8 units</span>
          </div>
        </div>

        {/* Sem 2 Approved Units */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-300">2nd Sem Approved Credits</span>
            <span className="text-signal-cyan font-bold">{sem2Approved} units</span>
          </div>
          <input
            type="range"
            min={0}
            max={8}
            step={1}
            value={sem2Approved}
            onChange={(e) => setSem2Approved(Number(e.target.value))}
            className="w-full accent-signal-cyan cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>0 units</span>
            <span>Observed: {student.metadata.sem2_approved}</span>
            <span>8 units</span>
          </div>
        </div>

        {/* Tuition Fees Up to Date */}
        <div className="flex items-center justify-between pt-1 border-t border-obsidian-800/80">
          <span className="text-slate-300 text-[11px]">Tuition Fees In Good Standing</span>
          <button
            onClick={() => setTuitionOk(!tuitionOk)}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${
              tuitionOk
                ? 'bg-signal-graduate/20 border-signal-graduate text-signal-graduate'
                : 'bg-signal-dropout/20 border-signal-dropout text-signal-dropout'
            }`}
          >
            {tuitionOk ? 'PAID / CURRENT' : 'DELINQUENT'}
          </button>
        </div>

        {/* Scholarship Holder */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-slate-300 text-[11px]">Scholarship Support</span>
          <button
            onClick={() => setScholarship(!scholarship)}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${
              scholarship
                ? 'bg-signal-cyan/20 border-signal-cyan text-signal-cyan'
                : 'bg-obsidian-800 border-obsidian-700 text-slate-400'
            }`}
          >
            {scholarship ? 'ACTIVE RECIPIENT' : 'NONE'}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2 font-mono text-xs">
        <button
          onClick={handleSimulate}
          disabled={isSimulating || branches.length >= 3}
          className="flex-1 py-2.5 px-3 rounded-xl bg-signal-cyan hover:bg-cyan-400 text-obsidian-950 font-bold flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50 shadow-lg shadow-signal-cyan/25"
        >
          <Plus className="w-4 h-4" />
          <span>{isSimulating ? 'SIMULATING...' : `BRANCH PATH (${branches.length}/3)`}</span>
        </button>

        <button
          onClick={onResetBranches}
          title="Reset to Observed Trajectory"
          className="py-2.5 px-3 rounded-xl bg-obsidian-800/80 hover:bg-obsidian-700 text-slate-300 border border-obsidian-700 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Branch Comparison Cards */}
      {branches.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-obsidian-700/50 font-mono">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Generated Branch Universes</span>
          <div className="space-y-2">
            {branches.map((b) => {
              const isSelected = activeBranchId === b.id;
              const dGrad = b.deltas.delta_graduate;
              const isPos = dGrad >= 0;

              return (
                <div
                  key={b.id}
                  onClick={() => onSelectBranch(b.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-signal-cyan/15 border-signal-cyan shadow-md'
                      : 'bg-obsidian-950/60 border-obsidian-800 hover:border-obsidian-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-signal-cyan">{b.branch_name}</span>
                    <span className="text-slate-200 uppercase">{b.predicted_class}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 mt-2 text-[10px]">
                    <div className="text-center p-1 rounded bg-obsidian-900 border border-obsidian-800">
                      <div className="text-slate-400">Δ Grad</div>
                      <div className={isPos ? 'text-signal-graduate font-bold' : 'text-signal-dropout font-bold'}>
                        {isPos ? '+' : ''}{(dGrad * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-center p-1 rounded bg-obsidian-900 border border-obsidian-800">
                      <div className="text-slate-400">Δ Drop</div>
                      <div className={b.deltas.delta_dropout <= 0 ? 'text-signal-graduate font-bold' : 'text-signal-dropout font-bold'}>
                        {b.deltas.delta_dropout > 0 ? '+' : ''}{(b.deltas.delta_dropout * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-center p-1 rounded bg-obsidian-900 border border-obsidian-800">
                      <div className="text-slate-400">P(Grad)</div>
                      <div className="text-slate-200 font-bold">{(b.simulated_probas.graduate * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};
