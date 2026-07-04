/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CessationPlan, SmokeLog } from '../types';
import { HEALTH_MILESTONES } from '../data/healthMilestones';
import {
  getPlanDayIndex,
  getDailyAllowance,
  calculateSavings,
  getSecondsSinceLastSmoked,
  formatDuration
} from '../utils/cessationCalc';
import {
  Coins,
  Shield,
  Clock,
  Sparkles,
  Zap,
  Activity,
  CheckCircle2,
  Lock,
  Plus,
  Flame,
  MessageCircle,
  HelpCircle
} from 'lucide-react';

interface DashboardProps {
  plan: CessationPlan;
  logs: SmokeLog[];
  onLaunchUrgeChamber: () => void;
  onQuickLogSmoke: () => void;
  simulatedDayIndex?: number;
}

export default function Dashboard({
  plan,
  logs,
  onLaunchUrgeChamber,
  onQuickLogSmoke,
  simulatedDayIndex
}: DashboardProps) {
  // Current plan day calculation
  const dayIndex = simulatedDayIndex !== undefined ? simulatedDayIndex : getPlanDayIndex(plan.startDate);
  const dailyAllowance = getDailyAllowance(plan.initialDailyCount, dayIndex);
  
  // Calculate today's smoked count
  const todayStartStr = new Date().toISOString().split('T')[0];
  const todaySmokedCount = logs.filter(log => {
    if (log.resisted) return false;
    
    // Check if on same day
    const logDayStr = new Date(log.timestamp).toISOString().split('T')[0];
    if (simulatedDayIndex !== undefined) {
      // In simulation mode, check if the log belongs to our simulated active day
      const start = new Date(plan.startDate);
      start.setDate(start.getDate() + simulatedDayIndex);
      const simulatedDayStr = start.toISOString().split('T')[0];
      return logDayStr === simulatedDayStr;
    }
    return logDayStr === todayStartStr;
  }).length;

  const todayResistedCount = logs.filter(log => {
    if (!log.resisted) return false;
    const logDayStr = new Date(log.timestamp).toISOString().split('T')[0];
    if (simulatedDayIndex !== undefined) {
      const start = new Date(plan.startDate);
      start.setDate(start.getDate() + simulatedDayIndex);
      const simulatedDayStr = start.toISOString().split('T')[0];
      return logDayStr === simulatedDayStr;
    }
    return logDayStr === todayStartStr;
  }).length;

  // Streak timer state
  const [secondsSinceLastSmoked, setSecondsSinceLastSmoked] = useState<number | null>(null);

  useEffect(() => {
    // Initial calculation
    setSecondsSinceLastSmoked(getSecondsSinceLastSmoked(logs));

    // Update streak every second
    const interval = setInterval(() => {
      setSecondsSinceLastSmoked(getSecondsSinceLastSmoked(logs));
    }, 1000);

    return () => clearInterval(interval);
  }, [logs]);

  // Financial statistics
  const { cigarettesAvoided, moneySaved } = calculateSavings(plan, logs, simulatedDayIndex);

  // Compute ring percentage
  const smokedRatio = dailyAllowance > 0 ? todaySmokedCount / dailyAllowance : 0;
  const strokeDashoffset = 251.2 - (251.2 * Math.min(1, smokedRatio));

  return (
    <div className="space-y-6 max-w-md mx-auto" id="dashboard-view">
      {/* Plan Progress Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-radial from-slate-800 to-slate-950 opacity-50" />
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
              Cessation Journey
            </span>
            <h2 className="text-2xl font-bold tracking-tight mt-1">Day {dayIndex + 1} of 90</h2>
            <p className="text-xs text-slate-400 mt-1">
              3-Month reduction plan started {new Date(plan.startDate).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold">
            {dayIndex >= 90 ? 'Complete' : `${Math.round((dayIndex / 90) * 100)}% Done`}
          </div>
        </div>

        {/* Real-time Smoke-Free Streak Banner */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-300 font-medium">Active Smoke-Free Streak</span>
          </div>
          <span className="text-sm font-bold text-emerald-400 font-mono">
            {secondsSinceLastSmoked !== null ? formatDuration(secondsSinceLastSmoked) : 'Not started'}
          </span>
        </div>
      </div>

      {/* Main Rings Section */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center relative">
        <div className="text-center mb-4">
          <h3 className="text-xs uppercase font-bold tracking-wider text-gray-400">Daily Intake Allowance</h3>
          <p className="text-sm text-gray-500 mt-0.5">Keep today's count within your calculated target</p>
        </div>

        <div className="relative w-44 h-44 flex items-center justify-center">
          {/* Circular Progress Bar */}
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="88"
              cy="88"
              r="80"
              className="stroke-gray-100 fill-none"
              strokeWidth="12"
            />
            <circle
              cx="88"
              cy="88"
              r="80"
              className={`fill-none transition-all duration-1000 ${
                todaySmokedCount > dailyAllowance ? 'stroke-rose-500' : 'stroke-emerald-600'
              }`}
              strokeWidth="12"
              strokeDasharray="502.6"
              strokeDashoffset={251.3 + (251.3 * (1 - Math.min(1, smokedRatio)))}
              strokeLinecap="round"
            />
          </svg>

          {/* Central content */}
          <div className="absolute flex flex-col items-center">
            <span className={`text-4xl font-extrabold ${todaySmokedCount > dailyAllowance ? 'text-rose-600' : 'text-slate-900'}`}>
              {todaySmokedCount}
            </span>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-0.5">
              Smoked
            </span>
            <div className="border-t border-gray-100 w-12 my-1" />
            <span className="text-xs font-bold text-slate-500">
              Target: {dailyAllowance}
            </span>
          </div>
        </div>

        {/* Message on Allowance status */}
        <div className="mt-5 text-center px-4">
          {todaySmokedCount < dailyAllowance ? (
            <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl">
              Excellent! You have {dailyAllowance - todaySmokedCount} remaining available allowance cigarettes today.
            </p>
          ) : todaySmokedCount === dailyAllowance ? (
            <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl">
              You've hit today's absolute target limit. Do your best to stay right here!
            </p>
          ) : (
            <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 px-4 py-2 rounded-xl">
              You are {todaySmokedCount - dailyAllowance} over today's calculated target. Reset and prioritize the Urge Chamber next time.
            </p>
          )}
        </div>
      </div>

      {/* CORE CTA: "I HAVE AN URGE" */}
      <div className="space-y-3">
        <button
          type="button"
          id="urge-chamber-trigger-btn"
          onClick={onLaunchUrgeChamber}
          className="w-full py-5 bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-3xl shadow-lg shadow-emerald-700/20 flex flex-col items-center justify-center transition-all cursor-pointer border border-emerald-500/20 active:scale-[0.99]"
        >
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-6 h-6 text-yellow-300 animate-pulse fill-current" />
            <span className="text-lg font-bold tracking-tight">I have an Urge to Smoke</span>
          </div>
          <span className="text-xs text-emerald-100/80">Pause for 15 seconds to empower your self-control</span>
        </button>

        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Today: {todayResistedCount} urges resisted</span>
          </div>
          <button
            type="button"
            id="quick-log-smoke-btn"
            onClick={onQuickLogSmoke}
            className="text-xs text-gray-400 hover:text-gray-600 underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Quick Log Smoked (No Pause)
          </button>
        </div>
      </div>

      {/* Financial & Habit Milestone Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-start gap-3">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Money Saved</span>
            <h4 className="text-lg font-bold text-slate-800 mt-0.5">
              {plan.currency}{moneySaved.toFixed(2)}
            </h4>
            <p className="text-[10px] text-gray-500">Based on baseline</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-start gap-3">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avoided Baseline</span>
            <h4 className="text-lg font-bold text-slate-800 mt-0.5">
              {cigarettesAvoided} cigs
            </h4>
            <p className="text-[10px] text-gray-500">Unsmoked cigarettes</p>
          </div>
        </div>
      </div>

      {/* Health Milestones Progress List */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" /> Your Health Restoration
          </h3>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            Chronological progress
          </span>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {HEALTH_MILESTONES.map((milestone) => {
            const unlocked = secondsSinceLastSmoked !== null && secondsSinceLastSmoked >= milestone.secondsRequired;
            const progressPct = secondsSinceLastSmoked !== null
              ? Math.min(100, Math.round((secondsSinceLastSmoked / milestone.secondsRequired) * 100))
              : 0;

            return (
              <div
                key={milestone.id}
                className={`p-3 rounded-2xl border transition-all flex gap-3 items-start ${
                  unlocked
                    ? 'bg-emerald-50/50 border-emerald-100 text-slate-900'
                    : 'bg-gray-50/50 border-gray-100 text-gray-500'
                }`}
              >
                <div className={`p-1.5 rounded-xl shrink-0 mt-0.5 ${unlocked ? 'bg-emerald-500/10 text-emerald-600' : 'bg-gray-200 text-gray-400'}`}>
                  {unlocked ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-1">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{milestone.title}</h4>
                    <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{milestone.timeLabel}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed mt-1">{milestone.description}</p>
                  
                  {/* Progress Line */}
                  {!unlocked && secondsSinceLastSmoked !== null && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-[9px] font-bold">
                        <span>Restoration Progress</span>
                        <span>{progressPct}%</span>
                      </div>
                      <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
