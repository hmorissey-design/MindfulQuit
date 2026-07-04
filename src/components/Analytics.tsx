/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CessationPlan, SmokeLog } from '../types';
import { getDailyAllowance, getPlanDayIndex } from '../utils/cessationCalc';
import { TrendingDown, Award, Brain, BarChart2, ShieldCheck, ZapOff } from 'lucide-react';

interface AnalyticsProps {
  plan: CessationPlan;
  logs: SmokeLog[];
  simulatedDayIndex?: number;
}

export default function Analytics({ plan, logs, simulatedDayIndex }: AnalyticsProps) {
  const currentDayIndex = simulatedDayIndex !== undefined ? simulatedDayIndex : getPlanDayIndex(plan.startDate);
  
  // 1. Group logs by day index to calculate smoked and resisted counts
  const getDailyStats = () => {
    const stats: { [dayIndex: number]: { smoked: number; resisted: number } } = {};
    const start = new Date(plan.startDate);
    start.setHours(0, 0, 0, 0);

    logs.forEach((log) => {
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);
      const diffTime = logDate.getTime() - start.getTime();
      const dIndex = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (dIndex >= 0) {
        if (!stats[dIndex]) {
          stats[dIndex] = { smoked: 0, resisted: 0 };
        }
        if (log.resisted) {
          stats[dIndex].resisted += 1;
        } else {
          stats[dIndex].smoked += 1;
        }
      }
    });
    return stats;
  };

  const dailyStats = getDailyStats();

  // 2. Identify top triggers and cravings
  const triggerCounts: { [key: string]: number } = {};
  let totalIntensity = 0;
  let intensityCount = 0;
  let totalResisted = 0;

  logs.forEach((log) => {
    if (log.resisted) {
      totalResisted += 1;
    }
    if (log.intensity) {
      totalIntensity += log.intensity;
      intensityCount += 1;
    }
    if (log.trigger) {
      triggerCounts[log.trigger] = (triggerCounts[log.trigger] || 0) + 1;
    }
  });

  const avgIntensity = intensityCount > 0 ? (totalIntensity / intensityCount).toFixed(1) : 'N/A';
  
  // Find top trigger
  let topTrigger = 'None yet';
  let topTriggerCount = 0;
  const triggerLabels: { [key: string]: string } = {
    stress: 'Stress / Anxiety',
    routine: 'Routine / Habit',
    boredom: 'Boredom',
    social: 'Social Situations',
    after_meal: 'After Meals',
    other: 'Other stimulations'
  };

  Object.entries(triggerCounts).forEach(([trig, count]) => {
    if (count > topTriggerCount) {
      topTriggerCount = count;
      topTrigger = triggerLabels[trig] || trig;
    }
  });

  // 3. Render Custom SVG Line Chart plotting the 90 Days
  // To keep the chart clean, we will plot 7 checkpoints: Day 0, Day 15, Day 30, Day 45, Day 60, Day 75, Day 90
  const checkpoints = [0, 15, 30, 45, 60, 75, 90];
  const chartHeight = 160;
  const chartWidth = 320;
  const paddingX = 40;
  const paddingY = 25;

  const maxVal = Math.max(plan.initialDailyCount, 5);

  // Helper to map values to SVG coordinate space
  const getXCoord = (dayIdx: number) => {
    return paddingX + (dayIdx / 90) * (chartWidth - paddingX * 2);
  };

  const getYCoord = (val: number) => {
    return chartHeight - paddingY - (val / maxVal) * (chartHeight - paddingY * 2);
  };

  // Generate ideal curve path points
  const idealPoints = checkpoints.map((d) => ({
    x: getXCoord(d),
    y: getYCoord(getDailyAllowance(plan.initialDailyCount, d)),
    day: d,
    allowance: getDailyAllowance(plan.initialDailyCount, d)
  }));

  const idealPath = idealPoints.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  );

  // Generate actual logs path points up to the current day
  const maxPlottedDay = Math.min(90, Math.max(currentDayIndex, ...Object.keys(dailyStats).map(Number)));
  const actualPoints: { x: number; y: number; day: number; smoked: number }[] = [];

  for (let d = 0; d <= maxPlottedDay; d++) {
    const smokedCount = dailyStats[d]?.smoked !== undefined ? dailyStats[d].smoked : 0;
    // Only plot points if we have logs recorded OR if they are before or equal to current elapsed days
    // to give a clean linear graph
    if (d <= currentDayIndex || dailyStats[d] !== undefined) {
      actualPoints.push({
        x: getXCoord(d),
        y: getYCoord(smokedCount),
        day: d,
        smoked: smokedCount
      });
    }
  }

  const actualPath = actualPoints.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  );

  return (
    <div className="space-y-6 max-w-md mx-auto" id="analytics-view">
      {/* Title */}
      <div className="text-center px-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center justify-center gap-2">
          <TrendingDown className="text-emerald-600 w-5 h-5" /> Reduction Analytics
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Your 3-month gradual glide slope vs. actual daily cigarettes
        </p>
      </div>

      {/* SVG Graphical Chart */}
      <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm">
        <div className="flex justify-between items-center px-2 mb-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Progress Glide Slope
          </span>
          <div className="flex gap-3 text-[10px] font-semibold">
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2.5 h-0.5 bg-slate-300 inline-block border-t border-dashed" /> Plan Target
            </span>
            <span className="flex items-center gap-1 text-emerald-600">
              <span className="w-2.5 h-0.5 bg-emerald-600 inline-block" /> Your Actuals
            </span>
          </div>
        </div>

        {/* Responsive Container SVG */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto select-none"
            style={{ minWidth: '300px' }}
          >
            {/* Grid Lines */}
            <line
              x1={paddingX}
              y1={getYCoord(maxVal)}
              x2={chartWidth - paddingX}
              y2={getYCoord(maxVal)}
              className="stroke-gray-100"
              strokeWidth="1"
            />
            <line
              x1={paddingX}
              y1={getYCoord(maxVal / 2)}
              x2={chartWidth - paddingX}
              y2={getYCoord(maxVal / 2)}
              className="stroke-gray-100"
              strokeWidth="1"
            />
            <line
              x1={paddingX}
              y1={getYCoord(0)}
              x2={chartWidth - paddingX}
              y2={getYCoord(0)}
              className="stroke-gray-200"
              strokeWidth="1"
            />

            {/* Y Axis Labels */}
            <text x={paddingX - 10} y={getYCoord(maxVal) + 3} className="text-[9px] fill-gray-400 text-right font-medium" textAnchor="end">
              {maxVal}
            </text>
            <text x={paddingX - 10} y={getYCoord(maxVal / 2) + 3} className="text-[9px] fill-gray-400 text-right font-medium" textAnchor="end">
              {Math.round(maxVal / 2)}
            </text>
            <text x={paddingX - 10} y={getYCoord(0) + 3} className="text-[9px] fill-gray-400 text-right font-medium" textAnchor="end">
              0
            </text>

            {/* X Axis Checkpoints */}
            {checkpoints.map((d) => (
              <g key={d}>
                <line
                  x1={getXCoord(d)}
                  y1={chartHeight - paddingY}
                  x2={getXCoord(d)}
                  y2={chartHeight - paddingY + 4}
                  className="stroke-gray-200"
                  strokeWidth="1"
                />
                <text
                  x={getXCoord(d)}
                  y={chartHeight - paddingY + 14}
                  className="text-[9px] fill-gray-400 font-semibold"
                  textAnchor="middle"
                >
                  D{d}
                </text>
              </g>
            ))}

            {/* IDEAL LINE PATH */}
            <path
              d={idealPath}
              className="stroke-slate-300 fill-none"
              strokeWidth="1.5"
              strokeDasharray="4,4"
            />

            {/* ACTUAL LINE PATH */}
            {actualPoints.length > 0 && (
              <path
                d={actualPath}
                className="stroke-emerald-600 fill-none"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Active Day Indicator vertical bar */}
            <line
              x1={getXCoord(Math.min(90, currentDayIndex))}
              y1={paddingY}
              x2={getXCoord(Math.min(90, currentDayIndex))}
              y2={chartHeight - paddingY}
              className="stroke-slate-900/10"
              strokeWidth="1"
            />

            {/* Interactive Circles / Hover Points */}
            {actualPoints.map((p) => {
              const isOver = p.smoked > getDailyAllowance(plan.initialDailyCount, p.day);
              return (
                <circle
                  key={p.day}
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  className={`${isOver ? 'fill-rose-500 stroke-rose-200' : 'fill-emerald-600 stroke-emerald-100'} stroke-2 cursor-pointer`}
                />
              );
            })}
          </svg>
        </div>

        <p className="text-[10px] text-gray-400 text-center mt-2 font-medium">
          D0 represents your initial baseline ({plan.initialDailyCount}/day). Day 90 is your 100% smoke-free target date.
        </p>
      </div>

      {/* Psychological Trigger Feedback */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-600" /> Behavioral Insights
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-50/50 border border-purple-100 p-3.5 rounded-2xl">
            <span className="text-[9px] font-bold text-purple-600 uppercase tracking-widest">
              Top Stimulus Trigger
            </span>
            <h4 className="text-sm font-bold text-purple-950 mt-1 truncate">
              {topTrigger}
            </h4>
            <p className="text-[10px] text-purple-800/80 mt-0.5">
              {topTriggerCount > 0 ? `Logged ${topTriggerCount} cravings` : 'No cravings logged yet'}
            </p>
          </div>

          <div className="bg-amber-50/50 border border-amber-100 p-3.5 rounded-2xl">
            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">
              Avg Craving Power
            </span>
            <h4 className="text-sm font-bold text-amber-950 mt-1">
              {avgIntensity !== 'N/A' ? `${avgIntensity} / 10` : 'None'}
            </h4>
            <p className="text-[10px] text-amber-800/80 mt-0.5">
              Reflects stress intensity
            </p>
          </div>
        </div>

        <div className="bg-emerald-50/40 border border-emerald-100/60 p-4 rounded-2xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-left">
            <h4 className="text-xs font-bold text-emerald-950">Empowerment Rate</h4>
            <p className="text-[11px] text-emerald-800 leading-relaxed mt-1">
              You have successfully bypassed <strong>{totalResisted} cravings</strong> using the Urge Pause buffer. Each resisted craving is a direct blow to the mechanical routine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
