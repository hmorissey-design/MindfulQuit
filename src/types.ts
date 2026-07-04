/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CessationPlan {
  startDate: string; // ISO String (Date when reduction started)
  initialDailyCount: number; // e.g. 15 cigarettes
  packCost: number; // e.g. 12.50
  cigarettesPerPack: number; // e.g. 20
  currency: string; // '$', '£', '€', etc.
  reasonsToQuit: string[]; // User's personal motivation list
}

export interface SmokeLog {
  id: string;
  timestamp: string; // ISO String
  wasUrge: boolean; // Did they log via the "I have an urge" chamber?
  intensity?: number; // 1-10 craving intensity (if urge)
  trigger?: string; // Trigger category (stress, routine, boredom, etc.)
  resisted: boolean; // Did they successfully resist, or did they smoke?
  notes?: string;
}

export interface HealthMilestone {
  id: string;
  timeLabel: string; // e.g. "20 minutes", "8 hours", "12 weeks"
  secondsRequired: number; // Duration in seconds
  title: string;
  description: string;
  category: 'cardiovascular' | 'respiratory' | 'systemic' | 'mental';
}

export interface UrgeTip {
  id: string;
  trigger?: string; // Specific to a trigger, or general
  text: string;
  action: string;
}
