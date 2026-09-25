import React from 'react';
import { X, HelpCircle, User, Sparkles, GitBranch, ArrowRight, Lightbulb, Clock } from 'lucide-react';

interface PlainEnglishGuideModalProps {
  onClose: () => void;
}

export const PlainEnglishGuideModal: React.FC<PlainEnglishGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/85 backdrop-blur-md">
      <div className="bg-obsidian-900 border border-signal-cyan/40 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl ring-1 ring-signal-cyan/20 font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-800 bg-obsidian-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-signal-cyan/20 border border-signal-cyan/40 flex items-center justify-center text-signal-cyan">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 tracking-wide">
                WHAT AM I LOOKING AT? (PLAIN ENGLISH GUIDE)
              </h2>
              <p className="text-[11px] text-slate-400">
                A simple guide explaining what every visual object and interaction actually means
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

        {/* 2-Sentence Core Summary Callout */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-300">
          <div className="p-4 rounded-xl bg-signal-cyan/10 border border-signal-cyan/30 text-slate-100 space-y-1">
            <span className="text-[10px] text-signal-cyan font-bold uppercase tracking-wider">
              THE BIG PICTURE IN TWO SENTENCES:
            </span>
            <p className="text-xs font-semibold leading-relaxed">
              Every floating dot in this 3D space is a real college student, and the curving line shows their journey over time.
              As their semester grades arrive, the AI updates its prediction of whether they will graduate or drop out—and you literally watch their path bend toward that outcome in 3D space.
            </p>
          </div>

          {/* 4 Core Concepts Explained Simply */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. The Dots */}
            <div className="p-4 rounded-xl bg-obsidian-950/70 border border-obsidian-800 space-y-2">
              <div className="flex items-center space-x-2 text-signal-graduate font-bold text-xs">
                <span className="w-3 h-3 rounded-full bg-signal-graduate inline-block" />
                <span>1. The 4,424 Floating Dots</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Each dot is a real student from the university dataset.
              </p>
              <ul className="text-[10px] text-slate-400 space-y-1 list-disc list-inside">
                <li><strong className="text-signal-graduate">Green dots:</strong> Students who are on track to graduate.</li>
                <li><strong className="text-signal-enrolled">Yellow dots:</strong> Students who are still enrolled.</li>
                <li><strong className="text-signal-dropout">Red dots:</strong> Students at high risk of dropping out.</li>
              </ul>
              <p className="text-[10px] text-slate-500">
                Students with similar grades and backgrounds naturally group together in the same neighborhood.
              </p>
            </div>

            {/* 2. The Line */}
            <div className="p-4 rounded-xl bg-obsidian-950/70 border border-obsidian-800 space-y-2">
              <div className="flex items-center space-x-2 text-signal-cyan font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>2. The Curving Line (The Journey)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                When you click a student, you see a glowing line with 3 stops:
              </p>
              <ul className="text-[10px] text-slate-400 space-y-1 list-disc list-inside">
                <li><strong>Stop 01 (Entry - Day 1):</strong> Starting point based on high school grades.</li>
                <li><strong>Stop 02 (Semester 1):</strong> 1st report card arrives! Watch the line bend.</li>
                <li><strong>Stop 03 (Semester 2):</strong> 2nd report card arrives; path locks into final outcome.</li>
              </ul>
              <p className="text-[10px] text-slate-500">
                The line proves: your high school grades do not lock you in—passing classes bends your destiny.
              </p>
            </div>

            {/* 3. The Glowing Bubbles */}
            <div className="p-4 rounded-xl bg-obsidian-950/70 border border-obsidian-800 space-y-2">
              <div className="flex items-center space-x-2 text-signal-enrolled font-bold text-xs">
                <span className="w-3 h-3 rounded-full border-2 border-signal-enrolled inline-block" />
                <span>3. The 3 Glowing Bubbles</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                These are the AI's real-time confidence meters:
              </p>
              <ul className="text-[10px] text-slate-400 space-y-1 list-disc list-inside">
                <li>If the <strong>Green bubble</strong> expands, the AI is confident the student will graduate.</li>
                <li>If the <strong>Red bubble</strong> suddenly blows up after Semester 1, the AI saw failed classes or fee debt.</li>
              </ul>
              <p className="text-[10px] text-slate-500">
                The size of the bubble shows how sure the AI is about that outcome.
              </p>
            </div>

            {/* 4. The Counterfactual Simulator */}
            <div className="p-4 rounded-xl bg-obsidian-950/70 border border-signal-cyan/40 space-y-2">
              <div className="flex items-center space-x-2 text-signal-cyan font-bold text-xs">
                <GitBranch className="w-3.5 h-3.5" />
                <span>4. "Simulate Another Path" (What If?)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                This is a "What If?" time machine:
              </p>
              <p className="text-[11px] text-slate-300">
                Take a student failing their classes. What if they got tutoring and passed 6 classes instead?
              </p>
              <p className="text-[10px] text-slate-400">
                Move the sliders, click <strong>Branch Path</strong>, and watch a brand new bright blue line branch off their past and curve straight towards graduation!
              </p>
            </div>
          </div>

          {/* Quick Click Guide */}
          <div className="p-4 rounded-xl bg-obsidian-950/80 border border-obsidian-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-signal-cyan" />
              <span>Quick Cheat-Sheet: What Happens When You Click Things?</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px]">
              <div className="p-2 rounded bg-obsidian-900 border border-obsidian-800">
                <strong className="text-signal-cyan">Click Any Dot:</strong>
                <p className="text-slate-400 mt-0.5">Camera flies to that student and reveals their 3D trajectory line.</p>
              </div>
              <div className="p-2 rounded bg-obsidian-900 border border-obsidian-800">
                <strong className="text-signal-cyan">Click Guided Tour:</strong>
                <p className="text-slate-400 mt-0.5">Automated 25-second walkthrough of 3 real students with very different lives.</p>
              </div>
              <div className="p-2 rounded bg-obsidian-900 border border-obsidian-800">
                <strong className="text-signal-cyan">Click 3D / 2D Button:</strong>
                <p className="text-slate-400 mt-0.5">Instantly switches between the 3D space and a high-contrast accessible table.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-obsidian-800 bg-obsidian-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-signal-cyan text-obsidian-950 font-bold text-xs hover:bg-cyan-400 transition-colors shadow-md"
          >
            GOT IT, TAKE ME TO THE DATA
          </button>
        </div>
      </div>
    </div>
  );
};
