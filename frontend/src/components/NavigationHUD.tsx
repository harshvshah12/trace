import React from 'react';
import { ViewMode } from '../types';
import { Compass, GitBranch, Mountain, Activity, Database, Play, RotateCcw, Eye, Monitor } from 'lucide-react';

interface NavigationHUDProps {
  currentMode: ViewMode;
  onSetMode: (mode: ViewMode) => void;
  onResetView: () => void;
  onStartDemo: () => void;
  isDemoActive: boolean;
  is3DMode: boolean;
  onToggle3D: () => void;
  selectedStudentId: number | null;
  totalStudents: number;
}

export const NavigationHUD: React.FC<NavigationHUDProps> = ({
  currentMode,
  onSetMode,
  onResetView,
  onStartDemo,
  isDemoActive,
  is3DMode,
  onToggle3D,
  selectedStudentId,
  totalStudents
}) => {
  const navItems: { mode: ViewMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'observe', label: 'OBSERVE', icon: <Compass className="w-4 h-4" /> },
    { mode: 'simulate', label: 'SIMULATE', icon: <GitBranch className="w-4 h-4" /> },
    { mode: 'cohort', label: 'COHORT', icon: <Mountain className="w-4 h-4" /> },
    { mode: 'model', label: 'MODEL LAB', icon: <Activity className="w-4 h-4" /> },
    { mode: 'data', label: 'DATASET', icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <header className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
      {/* Brand & Subtitle */}
      <div className="flex items-center space-x-3 pointer-events-auto bg-obsidian-900/80 backdrop-blur-md border border-obsidian-700/60 rounded-xl px-4 py-2.5 shadow-2xl">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-signal-cyan to-signal-graduate flex items-center justify-center font-mono font-bold text-obsidian-950 text-xs shadow-lg shadow-signal-cyan/20">
          TR
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold tracking-wider text-sm text-slate-100">TRACE</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-signal-cyan/15 text-signal-cyan border border-signal-cyan/30">
              v1.0 UCI-697
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono tracking-tight">
            Trajectory & Risk Analysis for Continuity in Education
          </p>
        </div>
      </div>

      {/* Center Nav Modes */}
      <nav className="pointer-events-auto flex items-center space-x-1 bg-obsidian-900/85 backdrop-blur-md border border-obsidian-700/60 rounded-xl p-1 shadow-2xl">
        {navItems.map((item) => {
          const active = currentMode === item.mode;
          return (
            <button
              key={item.mode}
              onClick={() => onSetMode(item.mode)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-mono tracking-wide transition-all ${
                active
                  ? 'bg-signal-cyan/20 text-signal-cyan border border-signal-cyan/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-800/60'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Demo, Reset, 3D Toggle */}
      <div className="flex items-center space-x-2 pointer-events-auto">
        <button
          onClick={onStartDemo}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono tracking-wide transition-all shadow-lg ${
            isDemoActive
              ? 'bg-signal-graduate text-obsidian-950 font-semibold shadow-signal-graduate/30 animate-pulse'
              : 'bg-obsidian-900/85 hover:bg-signal-cyan/20 text-signal-cyan border border-signal-cyan/40'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isDemoActive ? 'PLAYING DEMO' : 'GUIDED TOUR'}</span>
        </button>

        <button
          onClick={onResetView}
          title="Reset Camera to Universe"
          className="p-2.5 rounded-xl bg-obsidian-900/85 hover:bg-obsidian-800 text-slate-400 hover:text-slate-200 border border-obsidian-700/60 transition-all shadow-lg"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onToggle3D}
          title={is3DMode ? 'Switch to 2D Accessible View' : 'Switch to 3D WebGL Scene'}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-obsidian-900/85 hover:bg-obsidian-800 text-slate-300 border border-obsidian-700/60 text-xs font-mono transition-all shadow-lg"
        >
          <Monitor className="w-3.5 h-3.5 text-signal-cyan" />
          <span>{is3DMode ? '3D' : '2D'}</span>
        </button>
      </div>
    </header>
  );
};
