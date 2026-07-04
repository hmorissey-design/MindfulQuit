/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HealthMilestone, UrgeTip } from '../types';

export const HEALTH_MILESTONES: HealthMilestone[] = [
  {
    id: '20m',
    timeLabel: '20 Minutes',
    secondsRequired: 20 * 60,
    title: 'Cardiovascular Recovery',
    description: 'Your heart rate and blood pressure drop back down to normal, healthy levels, and circulation in your extremities begins to improve.',
    category: 'cardiovascular'
  },
  {
    id: '8h',
    timeLabel: '8 Hours',
    secondsRequired: 8 * 60 * 60,
    title: 'Carbon Monoxide Clears',
    description: 'Carbon monoxide levels in your bloodstream drop by half. Oxygen levels in your blood return to normal, letting cells breathe.',
    category: 'cardiovascular'
  },
  {
    id: '24h',
    timeLabel: '24 Hours',
    secondsRequired: 24 * 60 * 60,
    title: 'Heart Attack Risk Drops',
    description: 'Carbon monoxide has fully cleared from your body. Your lungs are starting to clear out smoking debris, and heart attack risk begins to decrease.',
    category: 'cardiovascular'
  },
  {
    id: '48h',
    timeLabel: '48 Hours',
    secondsRequired: 48 * 60 * 60,
    title: 'Taste & Smell Rebound',
    description: 'Nicotine is fully cleared from your body. Damaged nerve endings begin to grow back, restoring your senses of taste and smell to vibrant levels.',
    category: 'systemic'
  },
  {
    id: '72h',
    timeLabel: '72 Hours',
    secondsRequired: 72 * 60 * 60,
    title: 'Easier Breathing',
    description: 'Your bronchial tubes relax, making breathing significantly easier. Your lung capacity increases, and energy levels start to rise.',
    category: 'respiratory'
  },
  {
    id: '2w',
    timeLabel: '2 Weeks',
    secondsRequired: 14 * 24 * 60 * 60,
    title: 'Circulation & Stamina',
    description: 'Blood circulation continues to improve throughout your body. Walking and exercising become easier as your lung function improves by up to 30%.',
    category: 'cardiovascular'
  },
  {
    id: '1m',
    timeLabel: '1 Month',
    secondsRequired: 30 * 24 * 60 * 60,
    title: 'Lung Regeneration',
    description: 'Lung cilia (the tiny hair-like structures) start to function fully again, clearing mucus, cleaning the lungs, and reducing infection risk. Coughing and shortness of breath drop.',
    category: 'respiratory'
  },
  {
    id: '3m',
    timeLabel: '3 Months',
    secondsRequired: 90 * 24 * 60 * 60,
    title: 'The Clean Slate',
    description: 'You have completed the reduction journey! Your heart attack risk is reduced by half compared to when you smoked. Lung function has improved dramatically.',
    category: 'systemic'
  }
];

export const URGE_TIPS: UrgeTip[] = [
  {
    id: 't1',
    trigger: 'stress',
    text: 'Stress is an emotion, not a physical command to smoke. Inhaling burning smoke only increases your heart rate and chemical stress.',
    action: 'Close your eyes and complete 3 slow deep breaths. Let your shoulders drop on the exhale.'
  },
  {
    id: 't2',
    trigger: 'stress',
    text: 'The relief from smoking is just the temporary relief of satisfying nicotine withdrawal. It actually creates more physical stress in your body.',
    action: 'Drink a full glass of cold water slowly. Feel it cool your throat.'
  },
  {
    id: 't3',
    trigger: 'routine',
    text: 'Your brain has associated this specific time/activity with smoking. You are in control of rewriting this habit loop.',
    action: 'Change your physical environment right now. Move to a different room, stretch, or walk outside.'
  },
  {
    id: 't4',
    trigger: 'routine',
    text: 'A habit is just a path of least resistance in your mind. By pausing for 2 minutes, you are cutting a new, stronger pathway.',
    action: 'Grab a healthy substitute: chew sugarless gum, hold a toothpick, or squeeze a stress ball.'
  },
  {
    id: 't5',
    trigger: 'boredom',
    text: 'Craving is an itch of temporary boredom trying to convince you it is an emergency. It will pass in 3 to 5 minutes whether you smoke or not.',
    action: 'Engage in a rapid, high-focus task: play a puzzle on your phone, write a note, or wash your hands.'
  },
  {
    id: 't6',
    trigger: 'social',
    text: 'You do not need a cigarette to connect with others. True social bonds are forged through your presence, not shared smoke.',
    action: 'Step away from the smoking circle for just 3 minutes. Tell yourself: "I am free from needing this."'
  },
  {
    id: 't7',
    trigger: 'after_meal',
    text: 'After-meal cravings are strong because your digestion triggers routine signals. Smoking actually interferes with proper digestive oxygenation.',
    action: 'Immediately brush your teeth or rinse with fresh minty mouthwash. A clean mouth destroys the desire for a cigarette.'
  },
  {
    id: 't_gen_1',
    text: 'No one can force you to smoke, and no one can force you to quit. Every single cigarette you decline is a conscious decision that YOU own.',
    action: 'Acknowledge the urge, label it ("This is a temporary nicotine craving"), and let it float away like a cloud.'
  },
  {
    id: 't_gen_2',
    text: 'An urge is like a wave in the ocean. It swells, peaks, and breaks, but eventually it subsides. Ride the wave; do not fight it.',
    action: 'Use the 15-second breathing bubble to calm your nervous system.'
  }
];
