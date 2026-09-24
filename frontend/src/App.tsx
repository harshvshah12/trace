import React, { useState, useEffect, useRef } from 'react';
import {
  StudentDetail,
  CohortPoint,
  ArchetypeProfile,
  CheckpointKey,
  ViewMode,
  TerrainData,
  TerrainMode,
  SimulationBranch,
  DemoArchetype
} from './types';
import {
  fetchCohortData,
  fetchStudentById,
  fetchTerrainData,
  fetchModelMetrics,
  fetchFairnessAudit,
  fetchDemoArchetypes,
  runSimulation
} from './api/client';
import { TrajectoryCanvas } from './scenes/TrajectoryCanvas';
import { NavigationHUD } from './components/NavigationHUD';
import { StudentDetailPanel } from './components/StudentDetailPanel';
import { SimulationLab } from './components/SimulationLab';
import { TimeMachineBar } from './components/TimeMachineBar';
import { DemoOverlay } from './components/DemoOverlay';
import { ModelLabModal } from './components/ModelLabModal';
import { DatasetExplorerModal } from './components/DatasetExplorerModal';
import { AccessibleCohortView } from './components/AccessibleCohortView';
import { Sparkles, ArrowRight, Compass, ShieldAlert } from 'lucide-react';

export function App() {
  // Application State
  const [introDismissed, setIntroDismissed] = useState<boolean>(false);
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [currentMode, setCurrentMode] = useState<ViewMode>('observe');
  const [activeCheckpoint, setActiveCheckpoint] = useState<CheckpointKey>('sem2');
  const [terrainMode, setTerrainMode] = useState<TerrainMode>('density');

  // Data State
  const [points, setPoints] = useState<CohortPoint[]>([]);
  const [archetypes, setArchetypes] = useState<ArchetypeProfile[]>([]);
  const [allStudents, setAllStudents] = useState<StudentDetail[]>([]);
  const [terrainData, setTerrainData] = useState<TerrainData | null>(null);
  const [metricsData, setMetricsData] = useState<any>(null);
  const [fairnessData, setFairnessData] = useState<any>(null);
  const [demoArchetypes, setDemoArchetypes] = useState<DemoArchetype[]>([]);

  // Selection & Interactions
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [hoveredStudentId, setHoveredStudentId] = useState<number | null>(null);
  const [showConstellation, setShowConstellation] = useState<boolean>(false);
  const [showGravities, setShowGravities] = useState<boolean>(false);
  const [resetViewTrigger, setResetViewTrigger] = useState<number>(0);

  // Counterfactual Lab State
  const [branches, setBranches] = useState<SimulationBranch[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);

  // Demo Tour State
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);
  const [currentDemoIndex, setCurrentDemoIndex] = useState<number>(0);

  // Replay State
  const [isReplaying, setIsReplaying] = useState<boolean>(false);
  const replayTimerRef = useRef<any>(null);

  // Initial Data Load
  useEffect(() => {
    async function init() {
      const cohortRes = await fetchCohortData();
      setPoints(cohortRes.points);
      setArchetypes(cohortRes.archetypes);
      setAllStudents(cohortRes.allStudents);

      const terr = await fetchTerrainData();
      setTerrainData(terr);

      const met = await fetchModelMetrics();
      setMetricsData(met);

      const fair = await fetchFairnessAudit();
      setFairnessData(fair);

      const demos = await fetchDemoArchetypes();
      setDemoArchetypes(demos);
    }
    init();
  }, []);

  // Handle Student Selection
  const handleSelectStudent = async (id: number) => {
    const s = await fetchStudentById(id);
    if (s) {
      setSelectedStudent(s);
      setActiveCheckpoint('sem2');
      setBranches([]);
      setActiveBranchId(null);
    }
  };

  // Replay Trajectory Loop
  useEffect(() => {
    if (!isReplaying || !selectedStudent) return;

    const sequence: CheckpointKey[] = ['entry', 'sem1', 'sem2'];
    let idx = 0;

    replayTimerRef.current = setInterval(() => {
      setActiveCheckpoint(sequence[idx]);
      idx = (idx + 1) % sequence.length;
    }, 2400);

    return () => clearInterval(replayTimerRef.current);
  }, [isReplaying, selectedStudent]);

  // Demo Tour Progression
  const handleStartDemo = async () => {
    if (demoArchetypes.length === 0) return;
    setIsDemoActive(true);
    setCurrentDemoIndex(0);
    const firstDemo = demoArchetypes[0];
    await handleSelectStudent(firstDemo.student_id);
    setActiveCheckpoint('entry');
  };

  const handleSelectDemoCase = async (index: number) => {
    setCurrentDemoIndex(index);
    const demo = demoArchetypes[index];
    await handleSelectStudent(demo.student_id);
    setActiveCheckpoint('sem1');
  };

  // Counterfactual Branch Addition
  const handleAddBranch = async (changes: Record<string, any>, name: string) => {
    if (!selectedStudent) return;
    const res = await runSimulation(selectedStudent.id, changes, name, selectedStudent);
    setBranches((prev) => [...prev, res]);
    setActiveBranchId(res.id);
  };

  const handleResetBranches = () => {
    setBranches([]);
    setActiveBranchId(null);
  };

  return (
    <main className="w-screen h-screen relative bg-obsidian-950 overflow-hidden font-sans">
      {/* Opening Intro Experience (WOW 01) */}
      {!introDismissed && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-obsidian-950/90 backdrop-blur-2xl p-6 transition-all duration-700">
          <div className="max-w-xl text-center space-y-6">
            <div className="inline-block px-3 py-1 rounded-full bg-signal-cyan/10 border border-signal-cyan/30 text-signal-cyan font-mono text-xs tracking-wider">
              UCI DATASET 697 | 4,424 STUDENT RECORDS
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100 font-mono">
              STUDENTS DON'T BECOME OUTCOMES ALL AT ONCE.
            </h1>

            <div className="flex items-center justify-center space-x-3 text-xs font-mono text-slate-400">
              <span className="text-slate-200">ENTRY</span>
              <span className="text-signal-cyan">→</span>
              <span className="text-slate-200">SEMESTER 1</span>
              <span className="text-signal-cyan">→</span>
              <span className="text-slate-200">SEMESTER 2</span>
              <span className="text-signal-cyan">→</span>
              <span className="text-signal-graduate">GRADUATION</span>
            </div>

            <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-mono">
              <strong className="text-slate-200">TRACE</strong> is an interactive scientific instrument for exploring how
              a machine learning model's understanding evolves as empirical evidence arrives progressively.
            </p>

            <div className="pt-4 flex items-center justify-center space-x-4">
              <button
                onClick={() => setIntroDismissed(true)}
                className="px-6 py-3 rounded-xl bg-signal-cyan hover:bg-cyan-400 text-obsidian-950 font-mono font-bold text-xs flex items-center space-x-2 transition-all shadow-xl shadow-signal-cyan/25"
              >
                <span>ENTER TRAJECTORY SPACE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top HUD */}
      <NavigationHUD
        currentMode={currentMode}
        onSetMode={(m) => {
          setCurrentMode(m);
          if (m === 'simulate' && !selectedStudent && points.length > 0) {
            handleSelectStudent(points[0].id);
          }
        }}
        onResetView={() => {
          setSelectedStudent(null);
          setResetViewTrigger((t) => t + 1);
        }}
        onStartDemo={handleStartDemo}
        isDemoActive={isDemoActive}
        is3DMode={is3DMode}
        onToggle3D={() => setIs3DMode(!is3DMode)}
        selectedStudentId={selectedStudent ? selectedStudent.id : null}
        totalStudents={points.length}
      />

      {/* 3D WebGL Scene or 2D Accessible Fallback */}
      {is3DMode ? (
        <TrajectoryCanvas
          points={points}
          selectedStudent={selectedStudent}
          onSelectStudent={handleSelectStudent}
          hoveredStudentId={hoveredStudentId}
          onHoverStudent={setHoveredStudentId}
          activeCheckpoint={activeCheckpoint}
          onSelectCheckpoint={setActiveCheckpoint}
          showTerrain={currentMode === 'cohort'}
          terrainData={terrainData}
          terrainMode={terrainMode}
          simulationBranches={branches}
          activeBranchId={activeBranchId}
          showConstellation={showConstellation}
          showGravities={showGravities}
          filterOutcome={null}
          filterCluster={null}
          resetViewTrigger={resetViewTrigger}
        />
      ) : (
        <AccessibleCohortView
          points={points}
          allStudents={allStudents}
          archetypes={archetypes}
          onSelectStudent={handleSelectStudent}
          selectedStudentId={selectedStudent ? selectedStudent.id : null}
        />
      )}

      {/* Selected Student Telemetry Panel */}
      {selectedStudent && currentMode !== 'simulate' && (
        <StudentDetailPanel
          student={selectedStudent}
          activeCheckpoint={activeCheckpoint}
          onClose={() => setSelectedStudent(null)}
          onOpenSimulate={() => setCurrentMode('simulate')}
          showConstellation={showConstellation}
          onToggleConstellation={() => setShowConstellation(!showConstellation)}
          showGravities={showGravities}
          onToggleGravities={() => setShowGravities(!showGravities)}
        />
      )}

      {/* Counterfactual Simulation Lab */}
      {selectedStudent && currentMode === 'simulate' && (
        <SimulationLab
          student={selectedStudent}
          branches={branches}
          onAddBranch={handleAddBranch}
          onResetBranches={handleResetBranches}
          onClose={() => setCurrentMode('observe')}
          activeBranchId={activeBranchId}
          onSelectBranch={setActiveBranchId}
        />
      )}

      {/* Cohort Terrain Mode Switcher Floating Bar */}
      {currentMode === 'cohort' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-obsidian-900/90 backdrop-blur-xl border border-obsidian-700/80 rounded-xl p-1.5 flex items-center space-x-1 font-mono text-xs shadow-2xl">
          <span className="text-[10px] text-slate-400 px-2.5">TERRAIN METRIC:</span>
          {(['density', 'uncertainty', 'dropout', 'graduate'] as TerrainMode[]).map((tm) => (
            <button
              key={tm}
              onClick={() => setTerrainMode(tm)}
              className={`px-3 py-1.5 rounded-lg uppercase text-[11px] font-bold transition-all ${
                terrainMode === tm
                  ? 'bg-signal-cyan/20 border border-signal-cyan/40 text-signal-cyan'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-800'
              }`}
            >
              {tm}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Temporal Time Machine Scrubber */}
      {selectedStudent && (
        <TimeMachineBar
          activeCheckpoint={activeCheckpoint}
          onSetCheckpoint={setActiveCheckpoint}
          isReplaying={isReplaying}
          onToggleReplay={() => setIsReplaying(!isReplaying)}
        />
      )}

      {/* Guided Demo Tour Overlay */}
      {isDemoActive && (
        <DemoOverlay
          demoCases={demoArchetypes}
          currentCaseIndex={currentDemoIndex}
          onSelectCaseIndex={handleSelectDemoCase}
          activeCheckpoint={activeCheckpoint}
          onSetCheckpoint={setActiveCheckpoint}
          onClose={() => setIsDemoActive(false)}
        />
      )}

      {/* Model Lab Modal */}
      {currentMode === 'model' && (
        <ModelLabModal
          metrics={metricsData}
          fairness={fairnessData}
          onClose={() => setCurrentMode('observe')}
        />
      )}

      {/* Dataset Explorer Modal */}
      {currentMode === 'data' && (
        <DatasetExplorerModal onClose={() => setCurrentMode('observe')} />
      )}
    </main>
  );
}
