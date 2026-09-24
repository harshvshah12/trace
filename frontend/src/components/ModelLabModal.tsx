import React, { useState } from 'react';
import { X, Activity, Scale, CheckCircle2, TrendingUp, Layers } from 'lucide-react';

interface ModelLabModalProps {
  metrics: any;
  fairness: any;
  onClose: () => void;
}

export const ModelLabModal: React.FC<ModelLabModalProps> = ({ metrics, fairness, onClose }) => {
  const [activeTab, setActiveTab] = useState<'progression' | 'comparison' | 'calibration' | 'fairness'>('progression');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-obsidian-950/80 backdrop-blur-md">
      <div className="bg-obsidian-900 border border-obsidian-700/80 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-signal-cyan/20 border border-signal-cyan/40 flex items-center justify-center text-signal-cyan">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 font-mono tracking-wide">
                MODEL PERFORMANCE & FAIRNESS LABORATORY
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Rigorous multi-checkpoint evaluation, probability calibration, and subgroup audit
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

        {/* Tab Navigation */}
        <div className="flex border-b border-obsidian-800 bg-obsidian-950/40 px-6 font-mono text-xs">
          {[
            { id: 'progression', label: 'EVIDENCE PROGRESSION' },
            { id: 'comparison', label: 'MODEL COMPARISON' },
            { id: 'calibration', label: 'PROBABILITY CALIBRATION' },
            { id: 'fairness', label: 'SUBGROUP FAIRNESS AUDIT' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 border-b-2 font-bold transition-all ${
                activeTab === tab.id
                  ? 'border-signal-cyan text-signal-cyan bg-signal-cyan/5'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 font-mono text-xs">
          {activeTab === 'progression' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-obsidian-950/70 border border-obsidian-800">
                  <span className="text-[10px] text-slate-400 uppercase">CHECKPOINT 01</span>
                  <h4 className="text-sm font-bold text-slate-200 mt-1">Entry Profile</h4>
                  <div className="text-[11px] text-slate-400 mt-1">24 Features</div>
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Accuracy</span>
                      <span className="text-signal-cyan font-bold">59.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Macro F1</span>
                      <span className="text-slate-200 font-bold">0.544</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Balanced Acc</span>
                      <span className="text-slate-200 font-bold">54.6%</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-obsidian-950/70 border border-signal-cyan/30 bg-signal-cyan/5">
                  <span className="text-[10px] text-signal-cyan uppercase font-bold">CHECKPOINT 02 (+12.3%)</span>
                  <h4 className="text-sm font-bold text-slate-200 mt-1">Semester 1 Evidence</h4>
                  <div className="text-[11px] text-slate-400 mt-1">30 Features (+6 Academics)</div>
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Accuracy</span>
                      <span className="text-signal-cyan font-bold">71.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Macro F1</span>
                      <span className="text-slate-200 font-bold">0.662</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Balanced Acc</span>
                      <span className="text-slate-200 font-bold">66.3%</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-obsidian-950/70 border border-signal-graduate/30 bg-signal-graduate/5">
                  <span className="text-[10px] text-signal-graduate uppercase font-bold">CHECKPOINT 03 (+3.6%)</span>
                  <h4 className="text-sm font-bold text-slate-200 mt-1">Semester 2 Trajectory</h4>
                  <div className="text-[11px] text-slate-400 mt-1">36 Features (+6 Velocity)</div>
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Accuracy</span>
                      <span className="text-signal-graduate font-bold">75.1%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Macro F1</span>
                      <span className="text-slate-200 font-bold">0.706</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Balanced Acc</span>
                      <span className="text-slate-200 font-bold">70.9%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-obsidian-950/50 border border-obsidian-800 text-slate-300 leading-relaxed text-xs">
                <strong className="text-signal-cyan">Key Empirical Finding:</strong> Baseline entry attributes only account
                for 59.2% accuracy. When first-semester academic evaluations and approved credits arrive, predictive power
                surges by +12.3 percentage points to 71.5% accuracy (Macro F1: 0.54 to 0.66). Second semester completion
                solidifies trajectory certainty at 75.1% accuracy.
              </div>
            </div>
          )}

          {activeTab === 'comparison' && (
            <div className="space-y-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-obsidian-800 text-slate-400 text-[11px]">
                    <th className="py-2.5 px-3">Model Architecture</th>
                    <th className="py-2.5 px-3">Checkpoint</th>
                    <th className="py-2.5 px-3">Accuracy</th>
                    <th className="py-2.5 px-3">Macro F1</th>
                    <th className="py-2.5 px-3">Balanced Acc</th>
                    <th className="py-2.5 px-3">Log Loss</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-obsidian-800/60">
                  <tr className="hover:bg-obsidian-850">
                    <td className="py-2.5 px-3 font-bold text-slate-200">Calibrated HistGradientBoosting</td>
                    <td className="py-2.5 px-3 text-signal-cyan">Semester 2</td>
                    <td className="py-2.5 px-3 font-bold text-signal-graduate">75.1%</td>
                    <td className="py-2.5 px-3 text-slate-200">0.706</td>
                    <td className="py-2.5 px-3 text-slate-200">70.9%</td>
                    <td className="py-2.5 px-3 text-signal-cyan">0.614</td>
                  </tr>
                  <tr className="hover:bg-obsidian-850">
                    <td className="py-2.5 px-3 text-slate-300">Random Forest Classifier (150 trees)</td>
                    <td className="py-2.5 px-3 text-slate-400">Semester 2</td>
                    <td className="py-2.5 px-3 text-slate-300">75.1%</td>
                    <td className="py-2.5 px-3 text-slate-300">0.706</td>
                    <td className="py-2.5 px-3 text-slate-300">70.9%</td>
                    <td className="py-2.5 px-3 text-slate-300">0.615</td>
                  </tr>
                  <tr className="hover:bg-obsidian-850">
                    <td className="py-2.5 px-3 text-slate-300">Logistic Regression (L2 Balanced)</td>
                    <td className="py-2.5 px-3 text-slate-400">Semester 2</td>
                    <td className="py-2.5 px-3 text-slate-300">72.9%</td>
                    <td className="py-2.5 px-3 text-slate-300">0.693</td>
                    <td className="py-2.5 px-3 text-slate-300">70.5%</td>
                    <td className="py-2.5 px-3 text-slate-300">0.646</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'calibration' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-obsidian-950/70 border border-obsidian-800">
                <h4 className="text-xs font-bold text-slate-200 mb-2">Probability Calibration Verification</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed mb-4">
                  TRACE visualizes dynamic 3D probability fields (P_Graduate, P_Dropout, P_Enrolled).
                  To prevent deceptive overconfidence, models are calibrated using Sigmoid Platt scaling via 3-fold cross-validation.
                </p>

                {metrics?.sem2?.['Calibrated HistGB']?.calibration_curve && (
                  <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                    {metrics.sem2['Calibrated HistGB'].calibration_curve.prob_pred.map((pred: number, i: number) => {
                      const trueProb = metrics.sem2['Calibrated HistGB'].calibration_curve.prob_true[i];
                      return (
                        <div key={i} className="p-2 rounded bg-obsidian-900 border border-obsidian-800">
                          <div className="text-slate-500">Bin #{i + 1}</div>
                          <div className="text-signal-cyan font-bold">Pred: {(pred * 100).toFixed(0)}%</div>
                          <div className="text-signal-graduate">True: {(trueProb * 100).toFixed(0)}%</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'fairness' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {fairness &&
                  Object.entries(fairness).map(([attr, groups]: [string, any]) => (
                    <div key={attr} className="p-4 rounded-xl bg-obsidian-950/70 border border-obsidian-800 space-y-2">
                      <h4 className="text-xs font-bold text-signal-cyan">{attr} Subgroup Audit</h4>
                      <div className="space-y-2">
                        {groups.map((g: any) => (
                          <div key={g.label} className="p-2 rounded bg-obsidian-900/60 border border-obsidian-800 text-[11px]">
                            <div className="flex justify-between font-bold text-slate-200">
                              <span>{g.label}</span>
                              <span>n = {g.sample_size}</span>
                            </div>
                            <div className="flex justify-between mt-1 text-slate-400 text-[10px]">
                              <span>Accuracy: {(g.accuracy * 100).toFixed(1)}%</span>
                              <span>Macro F1: {g.macro_f1.toFixed(3)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
