/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CessationPlan } from '../types';
import { Sparkles, Calendar, Heart, DollarSign, ArrowRight, Trash2, Plus, AlertCircle } from 'lucide-react';

interface OnboardingProps {
  onComplete: (plan: CessationPlan) => void;
}

const DEFAULT_REASONS = [
  'Reclaiming my physical stamina and lung health',
  'Saving thousands of dollars for things that matter',
  'Being fully present with family without smelling of smoke',
  'Freeing my mind from the constant itch of nicotine addiction'
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [initialCount, setInitialCount] = useState<string>('20');
  const [packCost, setPackCost] = useState<string>('12.50');
  const [cigarettesPerPack, setCigarettesPerPack] = useState<string>('20');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);
  
  const [reasons, setReasons] = useState<string[]>(DEFAULT_REASONS);
  const [newReason, setNewReason] = useState<string>('');

  const handleAddReason = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReason.trim()) {
      setReasons([...reasons, newReason.trim()]);
      setNewReason('');
    }
  };

  const handleRemoveReason = (index: number) => {
    setReasons(reasons.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const count = parseInt(initialCount, 10);
    const cost = parseFloat(packCost);
    const qty = parseInt(cigarettesPerPack, 10);

    if (isNaN(count) || count <= 0) {
      setError("Please enter a valid daily cigarette count (greater than 0).");
      return;
    }
    if (isNaN(cost) || cost < 0) {
      setError("Please enter a valid pack cost (0 or greater).");
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      setError("Please enter a valid quantity of cigarettes per pack (greater than 0).");
      return;
    }
    
    onComplete({
      startDate: new Date(startDate).toISOString(),
      initialDailyCount: count,
      packCost: cost,
      cigarettesPerPack: qty,
      currency: '', // Irrelevant as per user preference
      reasonsToQuit: reasons.length > 0 ? reasons : ['My health and freedom'],
    });
  };

  return (
    <div id="onboarding-container" className="max-w-md mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden my-4 md:my-8">
      {/* Brand Header */}
      <div className="bg-slate-900 text-white p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-radial from-slate-800 to-slate-950 opacity-50" />
        <div className="relative z-10">
          <div className="inline-flex p-3 bg-white/10 rounded-2xl mb-4 backdrop-blur-md">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight font-sans">Mindful Quit</h1>
          <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
            A 3-month gradual, respectful cessation plan tailored to your rhythm.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-emerald-500" /> Current Smoking Baseline
          </h2>
          <p className="text-xs text-gray-500">
            Tell us about your starting point. Your 3-month gradual reduction curve will be calculated from this baseline.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Cigarettes Smoked Daily
              </label>
              <input
                id="initial-count-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="20"
                required
                value={initialCount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^[0-9]+$/.test(val)) {
                    setInitialCount(val);
                  }
                }}
                onFocus={() => setInitialCount('')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-semibold text-center select-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Start Date of Plan
              </label>
              <div className="relative">
                <input
                  id="start-date-input"
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-semibold text-center"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" /> Pack & Financial Cost
          </h2>
          <p className="text-xs text-gray-500">
            Used to compute your physical and financial savings in real-time.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Pack Cost (numeric, e.g. 12.50)
              </label>
              <input
                id="pack-cost-input"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                required
                value={packCost}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^[0-9]*\.?[0-9]{0,2}$/.test(val)) {
                    setPackCost(val);
                  }
                }}
                onFocus={() => setPackCost('')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-semibold text-center select-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Qty / Pack
              </label>
              <input
                id="pack-qty-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="20"
                required
                value={cigarettesPerPack}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^[0-9]+$/.test(val)) {
                    setCigarettesPerPack(val);
                  }
                }}
                onFocus={() => setCigarettesPerPack('')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-semibold text-center select-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" /> Why are you quitting?
          </h2>
          <p className="text-xs text-gray-500">
            We will present these reasons back to you when you log an urge, reminding you of what is at stake.
          </p>

          <div className="space-y-2">
            {reasons.map((reason, index) => (
              <div key={index} className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3 rounded-xl gap-2">
                <span className="text-xs text-slate-700 font-medium leading-relaxed">{reason}</span>
                <button
                  type="button"
                  id={`remove-reason-${index}`}
                  onClick={() => handleRemoveReason(index)}
                  className="p-1 hover:bg-slate-200 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              id="new-reason-input"
              type="text"
              placeholder="Add your own deep personal reason..."
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              id="add-reason-button"
              onClick={handleAddReason}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          id="submit-onboarding-btn"
          className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer text-lg hover:translate-y-[-1px] active:translate-y-0"
        >
          Create My Reduction Plan <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
