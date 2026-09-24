import React, { useState } from 'react';
import { CohortPoint, StudentDetail, CheckpointKey, ArchetypeProfile } from '../types';
import { Search, Filter, Compass, Award, AlertTriangle, Users } from 'lucide-react';

interface AccessibleCohortViewProps {
  points: CohortPoint[];
  allStudents: StudentDetail[];
  archetypes: ArchetypeProfile[];
  onSelectStudent: (id: number) => void;
  selectedStudentId: number | null;
}

export const AccessibleCohortView: React.FC<AccessibleCohortViewProps> = ({
  points,
  allStudents,
  archetypes,
  onSelectStudent,
  selectedStudentId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [clusterFilter, setClusterFilter] = useState<string>('all');

  const filtered = points.filter((p) => {
    if (searchTerm && !p.id.toString().includes(searchTerm)) return false;
    if (outcomeFilter !== 'all' && p.t.toLowerCase() !== outcomeFilter.toLowerCase()) return false;
    if (clusterFilter !== 'all' && p.c.toString() !== clusterFilter) return false;
    return true;
  });

  return (
    <div className="w-full h-full p-8 pt-24 bg-obsidian-950 overflow-y-auto space-y-6 font-mono text-xs text-slate-200">
      {/* Top Banner */}
      <div className="max-w-6xl mx-auto space-y-2">
        <div className="flex items-center space-x-2 text-signal-cyan font-bold text-sm">
          <Users className="w-4 h-4" />
          <span>ACCESSIBLE 2D COHORT ANALYTICS</span>
        </div>
        <p className="text-slate-400 text-xs">
          High-contrast structured representation of all 4,424 student records with full screen-reader accessibility and low-power support.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 p-4 rounded-xl bg-obsidian-900 border border-obsidian-800">
        <div className="flex items-center space-x-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student by ID (e.g. 390)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-obsidian-950 border border-obsidian-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-signal-cyan"
          />
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 text-[11px]">Outcome:</span>
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              className="bg-obsidian-950 border border-obsidian-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
            >
              <option value="all">All Outcomes</option>
              <option value="graduate">Graduate</option>
              <option value="dropout">Dropout</option>
              <option value="enrolled">Enrolled</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 text-[11px]">Archetype:</span>
            <select
              value={clusterFilter}
              onChange={(e) => setClusterFilter(e.target.value)}
              className="bg-obsidian-950 border border-obsidian-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
            >
              <option value="all">All Archetypes</option>
              {archetypes.map((a) => (
                <option key={a.cluster_id} value={a.cluster_id}>
                  Cluster #{a.cluster_id}: {a.title.slice(0, 30)}...
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Structured Student List Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.slice(0, 48).map((p) => {
          const isSelected = selectedStudentId === p.id;
          const targetColor =
            p.t === 'Graduate'
              ? 'text-signal-graduate border-signal-graduate/30 bg-signal-graduate/10'
              : p.t === 'Dropout'
              ? 'text-signal-dropout border-signal-dropout/30 bg-signal-dropout/10'
              : 'text-signal-enrolled border-signal-enrolled/30 bg-signal-enrolled/10';

          return (
            <button
              key={p.id}
              onClick={() => onSelectStudent(p.id)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-signal-cyan bg-signal-cyan/15 ring-1 ring-signal-cyan shadow-lg'
                  : 'border-obsidian-800 bg-obsidian-900/60 hover:border-obsidian-700 hover:bg-obsidian-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-signal-cyan">STUDENT #{p.id}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full border ${targetColor}`}>{p.t}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 text-[10px]">
                <div>
                  <div className="text-slate-400">P(Graduate)</div>
                  <div className="text-signal-graduate font-bold mt-0.5">{(p.pg * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-slate-400">P(Dropout)</div>
                  <div className="text-signal-dropout font-bold mt-0.5">{(p.pd * 100).toFixed(1)}%</div>
                </div>
              </div>

              <div className="mt-2 text-[10px] text-slate-400 border-t border-obsidian-800 pt-1.5 flex justify-between">
                <span>Cluster #{p.c}</span>
                <span>Uncertainty: {(p.u * 100).toFixed(0)}%</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="max-w-6xl mx-auto text-center text-slate-500 text-[11px] py-4">
        Showing top 48 of {filtered.length} filtered records. Use search by ID to find any of the 4,424 students.
      </div>
    </div>
  );
};
