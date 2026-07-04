/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CessationPlan, SmokeLog } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import UrgeChamber from './components/UrgeChamber';
import Analytics from './components/Analytics';
import QAPanel from './components/QA_Panel';
import { getDailyAllowance } from './utils/cessationCalc';
import {
  Home,
  Flame,
  BarChart2,
  Settings,
  Sparkles,
  Smartphone,
  CheckCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

type Tab = 'DASHBOARD' | 'URGE' | 'ANALYTICS' | 'QA';

export default function App() {
  const [plan, setPlan] = useState<CessationPlan | null>(null);
  const [logs, setLogs] = useState<SmokeLog[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('DASHBOARD');
  
  // Simulated day index (QA Testing feature)
  const [simulatedDayIndex, setSimulatedDayIndex] = useState<number>(0);
  
  // Ad mock state (TWA Monetization feature)
  const [showAdMock, setShowAdMock] = useState<boolean>(true);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const storedPlan = localStorage.getItem('MINDFUL_QUIT_PLAN');
      const storedLogs = localStorage.getItem('MINDFUL_QUIT_LOGS');
      const storedSimDay = localStorage.getItem('MINDFUL_QUIT_SIM_DAY');
      const storedAdMock = localStorage.getItem('MINDFUL_QUIT_AD_MOCK');

      if (storedPlan) {
        const parsedPlan = JSON.parse(storedPlan) as CessationPlan;
        setPlan(parsedPlan);
        
        // Calculate original day index to initialize simulated day
        const start = new Date(parsedPlan.startDate);
        start.setHours(0,0,0,0);
        const current = new Date();
        current.setHours(0,0,0,0);
        const diffTime = current.getTime() - start.getTime();
        const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
        setSimulatedDayIndex(diffDays);
      }
      
      if (storedLogs) {
        setLogs(JSON.parse(storedLogs) as SmokeLog[]);
      }

      if (storedSimDay) {
        setSimulatedDayIndex(parseInt(storedSimDay, 10));
      }

      if (storedAdMock !== null) {
        setShowAdMock(storedAdMock === 'true');
      }
    } catch (e) {
      console.error('Failed to load local storage state:', e);
    }
  }, []);

  // Save Sim Day to storage when it changes
  useEffect(() => {
    localStorage.setItem('MINDFUL_QUIT_SIM_DAY', simulatedDayIndex.toString());
  }, [simulatedDayIndex]);

  // Save Ad Mock to storage when it changes
  useEffect(() => {
    localStorage.setItem('MINDFUL_QUIT_AD_MOCK', showAdMock.toString());
  }, [showAdMock]);

  const handleOnboardingComplete = (newPlan: CessationPlan) => {
    setPlan(newPlan);
    setLogs([]);
    setSimulatedDayIndex(0);
    localStorage.setItem('MINDFUL_QUIT_PLAN', JSON.stringify(newPlan));
    localStorage.setItem('MINDFUL_QUIT_LOGS', JSON.stringify([]));
    setActiveTab('DASHBOARD');
  };

  const handleLogEntry = (newEntry: Omit<SmokeLog, 'id'>) => {
    const entryWithId: SmokeLog = {
      ...newEntry,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    };

    // If we are in simulation mode, adjust the timestamp to match the simulated day index
    if (plan && simulatedDayIndex !== undefined) {
      const originalStart = new Date(plan.startDate);
      const simulatedDate = new Date(originalStart);
      simulatedDate.setDate(simulatedDate.getDate() + simulatedDayIndex);
      
      // Preserve hours and minutes from original timestamp but change date
      const sourceTime = new Date(newEntry.timestamp);
      simulatedDate.setHours(sourceTime.getHours(), sourceTime.getMinutes(), sourceTime.getSeconds(), 0);
      entryWithId.timestamp = simulatedDate.toISOString();
    }

    const updatedLogs = [entryWithId, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem('MINDFUL_QUIT_LOGS', JSON.stringify(updatedLogs));
  };

  const handleQuickLogSmoke = () => {
    handleLogEntry({
      timestamp: new Date().toISOString(),
      wasUrge: false,
      resisted: false
    });
  };

  const handleInjectMockData = () => {
    if (!plan) return;
    const mockLogs: SmokeLog[] = [];
    
    // Generate logs starting from 30 days ago up to today (simulating day 30 of plan)
    for (let d = 0; d <= 30; d++) {
      const logDate = new Date(plan.startDate);
      logDate.setDate(logDate.getDate() + d);
      
      // Calculate allowance for this day
      const allowance = getDailyAllowance(plan.initialDailyCount, d);
      
      // Smoked logs: we will plot realistic intake matching the target curve
      let smokesToLog = allowance;
      if (d === 8) smokesToLog += 1; // minor overshoot for QA inspection
      if (d === 15) smokesToLog += 2; // slip-up day
      if (d === 22) smokesToLog = Math.max(0, smokesToLog - 2); // super clean day!

      // Spatially spread the logs across day hours (e.g. 8 AM to 9 PM)
      for (let i = 0; i < smokesToLog; i++) {
        const hour = 8 + (i * (13 / Math.max(1, smokesToLog)));
        const timestamp = new Date(logDate);
        timestamp.setHours(Math.floor(hour), Math.floor(Math.random() * 60), 0, 0);
        
        mockLogs.push({
          id: `mock-smoke-day-${d}-${i}`,
          timestamp: timestamp.toISOString(),
          wasUrge: Math.random() > 0.4,
          intensity: Math.floor(Math.random() * 4) + 6,
          trigger: ['stress', 'routine', 'boredom', 'after_meal'][Math.floor(Math.random() * 4)],
          resisted: false
        });
      }

      // Add successful resisted urges!
      const urgesToLog = Math.floor(Math.random() * 3) + 1; // 1 to 3 cravings overcome per day
      for (let i = 0; i < urgesToLog; i++) {
        const hour = 9 + (i * (11 / urgesToLog));
        const timestamp = new Date(logDate);
        timestamp.setHours(Math.floor(hour), Math.floor(Math.random() * 60), 0, 0);
        
        mockLogs.push({
          id: `mock-resist-day-${d}-${i}`,
          timestamp: timestamp.toISOString(),
          wasUrge: true,
          intensity: Math.floor(Math.random() * 5) + 5,
          trigger: ['stress', 'routine', 'boredom', 'social'][Math.floor(Math.random() * 4)],
          resisted: true
        });
      }
    }

    setLogs(mockLogs);
    localStorage.setItem('MINDFUL_QUIT_LOGS', JSON.stringify(mockLogs));
    
    // Fast forward day simulation index to 30 to show full 1-month results!
    setSimulatedDayIndex(30);
    setActiveTab('DASHBOARD');
  };

  const handleResetAllData = () => {
    if (window.confirm('Wipe all progress logs, settings, and start a fresh plan? This is irreversible.')) {
      setPlan(null);
      setLogs([]);
      setSimulatedDayIndex(0);
      localStorage.removeItem('MINDFUL_QUIT_PLAN');
      localStorage.removeItem('MINDFUL_QUIT_LOGS');
      localStorage.removeItem('MINDFUL_QUIT_SIM_DAY');
      setActiveTab('DASHBOARD');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-4 md:py-8 px-2 select-none font-sans antialiased text-slate-900">
      
      {/* Simulation/QA Alert Bar */}
      {plan && simulatedDayIndex !== getDailyAllowance(plan.initialDailyCount, simulatedDayIndex) && (
        <div className="w-full max-w-md bg-amber-500 text-slate-900 text-xs font-bold px-4 py-2.5 rounded-2xl mb-4 flex items-center justify-between shadow-md border border-amber-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>QA Mode Active: Day {simulatedDayIndex + 1} of Plan</span>
          </div>
          <button
            type="button"
            onClick={() => {
              // Reset to real day
              const start = new Date(plan.startDate);
              start.setHours(0,0,0,0);
              const current = new Date();
              current.setHours(0,0,0,0);
              const diffTime = current.getTime() - start.getTime();
              const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
              setSimulatedDayIndex(diffDays);
            }}
            className="underline hover:text-white cursor-pointer"
          >
            Reset to Today
          </button>
        </div>
      )}

      {/* Main Container simulating an Android Device running a TWA */}
      <div className="w-full max-w-md flex flex-col flex-1 bg-white md:rounded-[40px] md:shadow-2xl md:border-8 md:border-slate-900 relative overflow-hidden min-h-[780px] md:min-h-[840px]">
        
        {/* Phone Speaker & Camera Notch (aesthetic detail for TWA mockup) */}
        <div className="hidden md:flex justify-center items-center h-6 bg-slate-900 w-full relative z-50">
          <div className="w-24 h-4 bg-slate-950 rounded-b-xl absolute top-0 flex items-center justify-center">
            <div className="w-12 h-1 bg-slate-800 rounded-full mb-1" />
            <div className="w-2 h-2 bg-slate-800 rounded-full ml-2 mb-1" />
          </div>
        </div>

        {/* Content viewport area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 pb-28 relative">
          {!plan ? (
            <Onboarding onComplete={handleOnboardingComplete} />
          ) : (
            <>
              {activeTab === 'DASHBOARD' && (
                <Dashboard
                  plan={plan}
                  logs={logs}
                  onLaunchUrgeChamber={() => setActiveTab('URGE')}
                  onQuickLogSmoke={handleQuickLogSmoke}
                  simulatedDayIndex={simulatedDayIndex}
                />
              )}
              {activeTab === 'URGE' && (
                <UrgeChamber
                  plan={plan}
                  onLog={handleLogEntry}
                  onCancel={() => setActiveTab('DASHBOARD')}
                />
              )}
              {activeTab === 'ANALYTICS' && (
                <Analytics
                  plan={plan}
                  logs={logs}
                  simulatedDayIndex={simulatedDayIndex}
                />
              )}
              {activeTab === 'QA' && (
                <QAPanel
                  plan={plan}
                  logs={logs}
                  simulatedDayIndex={simulatedDayIndex}
                  setSimulatedDayIndex={setSimulatedDayIndex}
                  onInjectMockData={handleInjectMockData}
                  onResetAllData={handleResetAllData}
                  showAdMock={showAdMock}
                  setShowAdMock={setShowAdMock}
                />
              )}
            </>
          )}
        </div>

        {/* BOTTOM FIXED ZONE */}
        {plan && (
          <div className="absolute bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-100 flex flex-col px-4 pt-2 pb-4">
            
            {/* 1. MOCK GOOGLE ADSENSE ANCHOR BANNER */}
            {showAdMock && (
              <div
                id="mock-adsense-banner"
                className="w-full bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl flex items-center justify-between text-[9px] font-bold text-amber-800 tracking-wider mb-2 select-none h-11 relative"
              >
                <div className="flex items-center gap-2">
                  <span className="bg-amber-500 text-slate-900 text-[8px] px-1 rounded uppercase tracking-normal">Ad</span>
                  <div className="text-left">
                    <p className="leading-tight text-slate-700">Google AdSense TWA Monetization</p>
                    <p className="text-[7px] text-gray-400 uppercase font-semibold">320x50 Mobile anchor viewport banner</p>
                  </div>
                </div>
                <HelpCircle className="w-4 h-4 text-amber-600/60" />
              </div>
            )}

            {/* 2. TAB NAVIGATION BAR */}
            <nav className="flex justify-around items-center h-14 bg-slate-900 text-slate-400 rounded-2xl px-2 relative">
              <button
                type="button"
                id="tab-dashboard-btn"
                onClick={() => setActiveTab('DASHBOARD')}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                  activeTab === 'DASHBOARD' ? 'text-emerald-400' : 'hover:text-slate-200'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Plan</span>
              </button>

              <button
                type="button"
                id="tab-urge-btn"
                onClick={() => setActiveTab('URGE')}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-colors relative ${
                  activeTab === 'URGE' ? 'text-emerald-400' : 'hover:text-slate-200'
                }`}
              >
                <div className="absolute top-[-14px] bg-emerald-600 text-white p-2.5 rounded-full shadow-lg border-2 border-white flex items-center justify-center animate-pulse">
                  <Flame className="w-4 h-4 fill-current" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider mt-5">Urge Pause</span>
              </button>

              <button
                type="button"
                id="tab-analytics-btn"
                onClick={() => setActiveTab('ANALYTICS')}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                  activeTab === 'ANALYTICS' ? 'text-emerald-400' : 'hover:text-slate-200'
                }`}
              >
                <BarChart2 className="w-5 h-5" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Progress</span>
              </button>

              <button
                type="button"
                id="tab-qa-btn"
                onClick={() => setActiveTab('QA')}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                  activeTab === 'QA' ? 'text-amber-400' : 'hover:text-slate-200'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="text-[9px] font-bold uppercase tracking-wider">QA Playground</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
