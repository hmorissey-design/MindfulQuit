/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SmokeLog, CessationPlan } from '../types';
import { URGE_TIPS } from '../data/healthMilestones';
import { Wind, Heart, ShieldAlert, Sparkles, AlertCircle, ArrowRight, BrainCircuit, Play } from 'lucide-react';

interface UrgeChamberProps {
  plan: CessationPlan;
  onLog: (log: Omit<SmokeLog, 'id'>) => void;
  onCancel: () => void;
}

type Stage = 'SETUP' | 'BREATHING' | 'DECISION' | 'SUCCESS' | 'SMOKED';

export default function UrgeChamber({ plan, onLog, onCancel }: UrgeChamberProps) {
  const [stage, setStage] = useState<Stage>('SETUP');
  const [intensity, setIntensity] = useState<number>(5);
  const [trigger, setTrigger] = useState<string>('stress');
  const [notes, setNotes] = useState<string>('');
  
  // Breathing state
  const [timer, setTimer] = useState<number>(15);
  const [breathePhase, setBreathePhase] = useState<'in' | 'hold' | 'out'>('in');
  
  // Selected motivation/tip
  const [activeReason, setActiveReason] = useState<string>('');
  const [activeTip, setActiveTip] = useState<{ text: string; action: string } | null>(null);

  useEffect(() => {
    // Select a random personal reason and a relevant tip when trigger changes
    if (plan.reasonsToQuit && plan.reasonsToQuit.length > 0) {
      const idx = Math.floor(Math.random() * plan.reasonsToQuit.length);
      setActiveReason(plan.reasonsToQuit[idx]);
    } else {
      setActiveReason('Reclaiming my physical health and mental freedom.');
    }

    const filteredTips = URGE_TIPS.filter(t => t.trigger === trigger);
    const generalTips = URGE_TIPS.filter(t => !t.trigger);
    const pool = filteredTips.length > 0 ? filteredTips : generalTips;
    const selectedTip = pool[Math.floor(Math.random() * pool.length)];
    setActiveTip(selectedTip);
  }, [trigger, plan.reasonsToQuit]);

  // Handle breathing timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (stage === 'BREATHING') {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setStage('DECISION');
            return 15;
          }
          
          // Toggle breathing instructions every 5 seconds
          const remaining = prev - 1;
          if (remaining > 10) {
            setBreathePhase('in');
          } else if (remaining > 5) {
            setBreathePhase('hold');
          } else {
            setBreathePhase('out');
          }
          
          return remaining;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stage]);

  const handleStartBreathing = () => {
    setStage('BREATHING');
    setTimer(15);
    setBreathePhase('in');
  };

  const handleResisted = () => {
    // Log a successful resistance
    onLog({
      timestamp: new Date().toISOString(),
      wasUrge: true,
      intensity,
      trigger,
      resisted: true,
      notes: notes.trim() || undefined
    });
    setStage('SUCCESS');
  };

  const handleSmoked = () => {
    // Log a cigarette smoked
    onLog({
      timestamp: new Date().toISOString(),
      wasUrge: true,
      intensity,
      trigger,
      resisted: false,
      notes: notes.trim() || undefined
    });
    setStage('SMOKED');
  };

  const triggerOptions = [
    { value: 'stress', label: 'Stress / Anxiety' },
    { value: 'routine', label: 'Routine / Habit' },
    { value: 'boredom', label: 'Boredom' },
    { value: 'social', label: 'Social Situation' },
    { value: 'after_meal', label: 'After Meal' },
    { value: 'other', label: 'Other Stimulus' }
  ];

  return (
    <div id="urge-chamber" className="max-w-md mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden my-4">
      {/* Dynamic Header based on stage */}
      <div className="bg-slate-900 text-white p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-radial from-slate-800 to-slate-950 opacity-40" />
        <div className="relative z-10 flex flex-col items-center">
          {stage === 'SETUP' && (
            <>
              <ShieldAlert className="w-8 h-8 text-amber-400 mb-2 animate-pulse" />
              <h2 className="text-xl font-bold">The Pause Chamber</h2>
              <p className="text-xs text-slate-400 mt-1">Create a physical buffer before you decide</p>
            </>
          )}
          {stage === 'BREATHING' && (
            <>
              <Wind className="w-8 h-8 text-emerald-400 mb-2 animate-spin" style={{ animationDuration: '6s' }} />
              <h2 className="text-xl font-bold">Mindful Breathing</h2>
              <p className="text-xs text-slate-400 mt-1">Your nervous system is resetting...</p>
            </>
          )}
          {stage === 'DECISION' && (
            <>
              <BrainCircuit className="w-8 h-8 text-purple-400 mb-2" />
              <h2 className="text-xl font-bold">The Choice is Yours</h2>
              <p className="text-xs text-slate-400 mt-1">Conscious action beats unconscious routine</p>
            </>
          )}
          {stage === 'SUCCESS' && (
            <>
              <Sparkles className="w-8 h-8 text-yellow-400 mb-2 animate-bounce" />
              <h2 className="text-xl font-bold">Freedom Claimed!</h2>
              <p className="text-xs text-emerald-400 mt-1 font-semibold">You chose yourself over the urge</p>
            </>
          )}
          {stage === 'SMOKED' && (
            <>
              <Heart className="w-8 h-8 text-rose-400 mb-2" />
              <h2 className="text-xl font-bold">A Step of the Journey</h2>
              <p className="text-xs text-slate-400 mt-1">Acknowledged and recorded, without judgement</p>
            </>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* STAGE 1: SETUP/TRIGGER ENTRY */}
        {stage === 'SETUP' && (
          <div className="space-y-6 animate-fade-in" id="stage-setup">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-800">
                1. What triggered this urge?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {triggerOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    id={`trigger-${opt.value}`}
                    onClick={() => setTrigger(opt.value)}
                    className={`px-4 py-3 text-xs font-semibold rounded-xl border text-left transition-all cursor-pointer ${
                      trigger === opt.value
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-gray-800">
                  2. Craving Intensity
                </label>
                <span className="px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                  Level {intensity}/10
                </span>
              </div>
              <input
                id="intensity-slider"
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-semibold px-1">
                <span>Mild</span>
                <span>Uncomfortable</span>
                <span>Severe</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                3. Optional Note (How do you feel?)
              </label>
              <input
                id="urge-notes-input"
                type="text"
                placeholder="e.g. stressed about deadline, just finished lunch"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                id="cancel-urge-btn"
                onClick={onCancel}
                className="flex-1 py-3 text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors cursor-pointer text-center"
              >
                Back to Dashboard
              </button>
              <button
                type="button"
                id="start-pause-btn"
                onClick={handleStartBreathing}
                className="flex-1 py-3 text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Take a Mindful Pause <Play className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: MANDATORY BREATHING */}
        {stage === 'BREATHING' && (
          <div className="flex flex-col items-center justify-center py-6 space-y-8 animate-fade-in text-center" id="stage-breathing">
            {/* Animated breathing circle */}
            <div className="relative flex items-center justify-center">
              {/* Outer wave ring */}
              <div
                className={`absolute rounded-full bg-emerald-500/10 transition-all duration-1000 ${
                  breathePhase === 'in' ? 'w-48 h-48 scale-110' : breathePhase === 'hold' ? 'w-48 h-48 scale-100' : 'w-32 h-32 scale-75'
                }`}
              />
              {/* Inner bubble */}
              <div
                className={`flex flex-col items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold transition-all duration-1000 shadow-xl shadow-emerald-500/20 ${
                  breathePhase === 'in' ? 'w-36 h-36 scale-115' : breathePhase === 'hold' ? 'w-36 h-36 scale-100' : 'w-28 h-28 scale-85'
                }`}
              >
                <span className="text-3xl tracking-wider">{timer}s</span>
                <span className="text-xs uppercase font-semibold mt-1 tracking-widest text-emerald-100">
                  {breathePhase === 'in' && 'Inhale'}
                  {breathePhase === 'hold' && 'Hold'}
                  {breathePhase === 'out' && 'Exhale'}
                </span>
              </div>
            </div>

            {/* Scientific explanation or Trigger tip */}
            <div className="max-w-xs bg-slate-50 border border-slate-100 p-4 rounded-2xl">
              <span className="text-[10px] font-bold tracking-wider text-emerald-600 uppercase">Trigger Insight</span>
              <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1.5">
                "{activeTip?.text}"
              </p>
              <p className="text-[11px] text-slate-500 italic mt-2">
                Action: {activeTip?.action}
              </p>
            </div>

            <p className="text-xs text-gray-500 animate-pulse">
              Slowly follow the expanding circle. Creating space is key to conquering urges.
            </p>
          </div>
        )}

        {/* STAGE 3: SELF-AGENCY DECISION */}
        {stage === 'DECISION' && (
          <div className="space-y-6 animate-fade-in" id="stage-decision">
            <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-left">
                <h4 className="text-sm font-semibold text-amber-900">Your Mind is Clearer Now</h4>
                <p className="text-xs text-amber-800 leading-relaxed mt-1">
                  You successfully paused for 15 seconds. This buffer proves that smoking is an active choice, not an uncontrollable reflex. 
                </p>
              </div>
            </div>

            {/* Motivation recall */}
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-left">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Personal Core Motivation</h4>
              <p className="text-sm text-slate-800 font-semibold leading-relaxed mt-1.5 italic">
                "{activeReason}"
              </p>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-gray-900">It is entirely up to you.</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                No algorithm can make this decision. Will you let the urge melt away, or will you log a cigarette?
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                id="i-beat-it-btn"
                onClick={handleResisted}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/10 transition-all text-center flex items-center justify-center gap-2 cursor-pointer text-base hover:translate-y-[-1px] active:translate-y-0"
              >
                I resisted the urge! 🎉
              </button>
              <button
                type="button"
                id="i-smoked-btn"
                onClick={handleSmoked}
                className="w-full py-3.5 bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-700 border border-gray-200 hover:border-red-200 font-semibold rounded-2xl transition-all text-center text-xs cursor-pointer"
              >
                I chose to smoke a cigarette
              </button>
            </div>
          </div>
        )}

        {/* STAGE 4: SUCCESS MESSAGE */}
        {stage === 'SUCCESS' && (
          <div className="text-center py-6 space-y-6 animate-fade-in" id="stage-success">
            <div className="inline-flex p-4 bg-emerald-100 rounded-full text-emerald-600 mb-2">
              <Wind className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Incredible Self-Control!</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                You resisted an intensity {intensity}/10 urge. By choosing not to smoke, you have just rewritten a powerful neural loop in your brain.
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-left max-w-xs mx-auto">
              <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                <strong>💡 Every resistance counts:</strong> You didn't just save money and protect your lungs; you proved that you hold the keys to your freedom.
              </p>
            </div>

            <button
              type="button"
              id="back-home-success-btn"
              onClick={onCancel}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all shadow-md cursor-pointer"
            >
              Continue to Dashboard
            </button>
          </div>
        )}

        {/* STAGE 5: SMOKED STATEMENT */}
        {stage === 'SMOKED' && (
          <div className="text-center py-6 space-y-6 animate-fade-in" id="stage-smoked">
            <div className="inline-flex p-4 bg-slate-100 rounded-full text-slate-600 mb-2">
              <AlertCircle className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Logged. Let's move forward.</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                No guilt, no shame. Relapse and friction are natural parts of learning how to quit. The important thing is that you logged it honestly.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left max-w-xs mx-auto">
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                <strong>📝 Reduction Strategy:</strong> Remember, you are on a gradual 3-month glide slope. One cigarette doesn't break the plan. Use the next urge as another chance to pause.
              </p>
            </div>

            <button
              type="button"
              id="back-home-smoked-btn"
              onClick={onCancel}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all shadow-md cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
