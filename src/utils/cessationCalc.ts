/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SmokeLog, CessationPlan } from '../types';

/**
 * Calculates the day index of the plan, starting at 0 for the start date.
 */
export function getPlanDayIndex(startDateStr: string, currentDateStr?: string): number {
  const start = new Date(startDateStr);
  start.setHours(0, 0, 0, 0);
  
  const current = currentDateStr ? new Date(currentDateStr) : new Date();
  current.setHours(0, 0, 0, 0);
  
  const diffTime = current.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Calculates the daily cigarette allowance based on initial count and plan day index.
 * Gradually reduces to 0 over a 3-month (90 days) timeframe.
 */
export function getDailyAllowance(initialDailyCount: number, dayIndex: number): number {
  const TOTAL_DAYS = 90;
  if (dayIndex >= TOTAL_DAYS) {
    return 0;
  }
  if (dayIndex <= 0) {
    return initialDailyCount;
  }
  
  // Linear reduction formula: allowance drops from initialCount to 0 at day 90
  const factor = 1 - (dayIndex / TOTAL_DAYS);
  const rawAllowance = initialDailyCount * factor;
  
  // We round to nearest whole cigarette, but guarantee it's at least 1 until day 90
  const allowance = Math.round(rawAllowance);
  return Math.max(dayIndex >= TOTAL_DAYS ? 0 : 1, allowance);
}

/**
 * Calculates financial savings based on cigarettes avoided.
 */
export function calculateSavings(
  plan: CessationPlan,
  logs: SmokeLog[],
  simulatedDayIndex?: number
): {
  cigarettesAvoided: number;
  moneySaved: number;
  totalActuallySmoked: number;
  totalWouldHaveSmoked: number;
} {
  const dayIndex = simulatedDayIndex !== undefined ? simulatedDayIndex : getPlanDayIndex(plan.startDate);
  const daysActive = dayIndex + 1;
  
  // Total smoked logs (resisted = false)
  const smokedLogs = logs.filter(log => !log.resisted);
  const totalActuallySmoked = smokedLogs.length;
  
  // If they hadn't started this program, they would have smoked:
  const totalWouldHaveSmoked = daysActive * plan.initialDailyCount;
  
  const cigarettesAvoided = Math.max(0, totalWouldHaveSmoked - totalActuallySmoked);
  const costPerCigarette = plan.packCost / plan.cigarettesPerPack;
  const moneySaved = cigarettesAvoided * costPerCigarette;
  
  return {
    cigarettesAvoided,
    moneySaved,
    totalActuallySmoked,
    totalWouldHaveSmoked
  };
}

/**
 * Calculates duration since last smoked cigarette.
 * Returns time in seconds. Returns null if they have never smoked or never logged.
 */
export function getSecondsSinceLastSmoked(logs: SmokeLog[]): number | null {
  const smokedLogs = logs.filter(log => !log.resisted);
  if (smokedLogs.length === 0) return null;
  
  // Find the most recent log
  const sortedLogs = [...smokedLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  const lastSmokedTime = new Date(sortedLogs[0].timestamp).getTime();
  const currentTime = new Date().getTime();
  
  return Math.max(0, Math.floor((currentTime - lastSmokedTime) / 1000));
}

/**
 * Formats seconds into a beautiful human-readable string (e.g. "12h 45m" or "2d 4h")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) {
    return `${hours}h ${remainingMinutes}m`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours}h`;
}
