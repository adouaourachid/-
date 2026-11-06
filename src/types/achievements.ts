/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Types and definitions for User Achievements, Badges, and Stats Record.
 */

export interface SolvedPuzzleRecord {
  puzzleId: string;
  title: string;
  category: 'moroccan' | 'science' | 'special';
  timeSpentSeconds: number;
  hintsUsedCount: number;
  solvedAt: string;
}

export interface BadgeDefinition {
  id: string;
  title: string;
  titleAr: string;
  descriptionAr: string;
  category: 'milestone' | 'category' | 'mastery' | 'skill';
  icon: string; // Lucide icon name identifier
  targetCount: number;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
}

export interface UserAchievementStats {
  totalSolved: number;
  moroccanSolved: number;
  scienceSolved: number;
  specialSolved: number;
  totalTimeSpentSeconds: number;
  averageTimeSeconds: number;
  bestTimeSeconds: number | null;
  totalHintsUsed: number;
  zeroHintCount: number;
  unlockedBadgeIds: string[];
  solvedPuzzles: Record<string, SolvedPuzzleRecord>;
  lastUpdated: string;
}
