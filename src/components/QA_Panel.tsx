/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CessationPlan, SmokeLog } from '../types';
import { getDailyAllowance } from '../utils/cessationCalc';
import { Settings, RefreshCw, Database, Play, Trash2, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface QAPanelProps {
  plan: CessationPlan;
  logs: SmokeLog[];
  simulatedDayIndex: number;
  setSimulatedDayIndex: (day: number) => void;
  onInjectMockData: () => void;
  onResetAllData: () => void;
  showAdMock: boolean;
  setShowAdMock: (val: boolean) => void;
}

export default function QAPanel({
  plan,
  logs,
  simulatedDayIndex,
  setSimulatedDayIndex,
  onInjectMockData,
  onResetAllData,
  showAdMock,
  setShowAdMock
}: QAPanelProps) {
  
  const handleFastForward = (days: number) => {
    setSimulatedDayIndex(days);
  };

  const calculatedAllowance = getDailyAllowance(plan.initialDailyCount, simulatedDayIndex);

  return (
    <div className="space-y-6 max-w-md mx-auto" id="qa-panel-view">
      {/* QA Header */}
      <div className="bg-slate-800 text-white rounded-3xl p-6 border border-slate-700/60 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
          <h3 className="text-sm font-bold tracking-wider uppercase text-amber-400">Spec & QA Playground</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          As a spec analyst & QA tester, you can use these developer tools to test the 3-month mathematical reductions, unlock milestones, populate realistic graphs, and view raw states instantly.
        </p>
      </div>

      {/* 1. Time Passage Simulator */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
        <div>
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
            1. Passage of Time Simulator
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Shift the calendar day index of your plan (0 - 90 days) to test the gradual linear reduction calculations.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-semibold text-slate-700">Simulated Progress:</span>
            <span className="text-sm font-bold text-slate-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg">
              Day {simulatedDayIndex + 1} of 90 (Day Index {simulatedDayIndex})
            </span>
          </div>

          <input
            id="qa-day-slider"
            type="range"
            min="0"
            max="95"
            value={simulatedDayIndex}
            onChange={(e) => setSimulatedDayIndex(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />

          <div className="grid grid-cols-4 gap-1.5 pt-1">
            <button
              type="button"
              id="ff-day-0"
              onClick={() => handleFastForward(0)}
              className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold rounded-lg border border-gray-100 cursor-pointer"
            >
              Day 1 (Start)
            </button>
            <button
              type="button"
              id="ff-day-15"
              onClick={() => handleFastForward(15)}
              className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold rounded-lg border border-gray-100 cursor-pointer"
            >
              Day 16
            </button>
            <button
              type="button"
              id="ff-day-45"
              onClick={() => handleFastForward(45)}
              className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold rounded-lg border border-gray-100 cursor-pointer"
            >
              Day 46 (Mid)
            </button>
            <button
              type="button"
              id="ff-day-90"
              onClick={() => handleFastForward(90)}
              className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold rounded-lg border border-gray-100 cursor-pointer"
            >
              Day 91 (Done)
            </button>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/60 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-500">Starting baseline:</span>
              <span className="font-semibold text-slate-800">{plan.initialDailyCount} cigarettes/day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Calculated Daily Allowance:</span>
              <span className="font-bold text-emerald-600">{calculatedAllowance} cigarettes/day</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Mock Data Injector */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
        <div>
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
            2. QA Test Data & States
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Quickly load sample data to verify the graph and the savings modules without manual data entry.
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            id="inject-mock-data-btn"
            onClick={onInjectMockData}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Database className="w-4 h-4 text-emerald-400" /> Inject Realistic 30-Day Cessation Logs
          </button>
          <p className="text-[10px] text-gray-400 text-center font-medium">
            Note: Injecting mock logs will overwrite current logs with a beautiful, declining trend and multiple urge-resisted events.
          </p>
        </div>
      </div>

      {/* 3. Monetization & AdSense Simulation */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
        <div>
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
            3. Monetization (TWA / AdSense Integration)
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Since the app is a TWA monetized via Google AdSense, toggle the mock ad banner to test visual layout and spacing constraints.
          </p>
        </div>

        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div>
            <span className="text-xs font-bold text-slate-800">Mock Google AdSense Banner</span>
            <p className="text-[10px] text-gray-400">Positioned at bottom for TWA app</p>
          </div>
          <button
            type="button"
            id="toggle-ad-btn"
            onClick={() => setShowAdMock(!showAdMock)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              showAdMock
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {showAdMock ? 'Banner ON' : 'Banner OFF'}
          </button>
        </div>
      </div>

      {/* 4. Raw JSON Inspection & Factory Reset */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
        <div>
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
            4. State Inspection & Reset
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Verify the exact JSON structure saved to local storage, or perform a complete wipe.
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-slate-900 text-slate-300 p-3 rounded-2xl text-[10px] font-mono max-h-36 overflow-y-auto border border-slate-800 leading-normal">
            <div>
              <strong>Cessation Plan State:</strong>
              <pre>{JSON.stringify(plan, null, 2)}</pre>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800">
              <strong>Total Logs Saved:</strong> {logs.length} entries
            </div>
          </div>

          <button
            type="button"
            id="reset-all-data-btn"
            onClick={onResetAllData}
            className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 hover:border-red-300 font-semibold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-red-600" /> Wipe All Data & Restart Onboarding
          </button>
        </div>
      </div>
    </div>
  );
}
