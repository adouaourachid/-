/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Achievements and Badges system logic for Abu Salma Crossword.
 * Evaluates unlocks, calculates statistics, and maintains local/cloud records.
 */

import { BadgeDefinition, UserAchievementStats, SolvedPuzzleRecord } from '../types/achievements';

export const BADGES: BadgeDefinition[] = [
  {
    id: 'first_solve',
    title: 'First Step',
    titleAr: 'وسام الخطوة الأولى 🌟',
    descriptionAr: 'حل أول شبكة كلمات متقاطعة بنجاح',
    category: 'milestone',
    icon: 'Sparkles',
    targetCount: 1,
    tier: 'bronze',
  },
  {
    id: 'solve_3',
    title: 'Smart Novice',
    titleAr: 'وسام الهاوي الذكي 🥉',
    descriptionAr: 'حل 3 شبكات كلمات متقاطعة بالكامل',
    category: 'milestone',
    icon: 'Award',
    targetCount: 3,
    tier: 'bronze',
  },
  {
    id: 'solve_5',
    title: 'Diligent Scholar',
    titleAr: 'وسام الباحث المجتهد 🥈',
    descriptionAr: 'إكمال حل 5 شبكات كلمات متقاطعة',
    category: 'milestone',
    icon: 'BookOpen',
    targetCount: 5,
    tier: 'silver',
  },
  {
    id: 'moroccan_10',
    title: 'Moroccan Sleuth',
    titleAr: 'وسام المحقق المغربي 🇲🇦',
    descriptionAr: 'حل 10 شبكات من الألغاز المغربية الأصيلة',
    category: 'category',
    icon: 'Compass',
    targetCount: 10,
    tier: 'silver',
  },
  {
    id: 'science_5',
    title: 'Science Explorer',
    titleAr: 'وسام باحث العلوم 🔬',
    descriptionAr: 'حل 5 شبكات من تصنيف الألغاز العلمية',
    category: 'category',
    icon: 'Atom',
    targetCount: 5,
    tier: 'silver',
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    titleAr: 'وسام البرق السريع ⚡',
    descriptionAr: 'حل أي شبكة كاملة في أقل من 3 دقائق (180 ثانية)',
    category: 'skill',
    icon: 'Zap',
    targetCount: 1,
    tier: 'gold',
  },
  {
    id: 'zero_hints',
    title: 'Pure Genius',
    titleAr: 'وسام العبقرية الصافية 🧠',
    descriptionAr: 'حل شبكة بالكامل دون استخدام أي تلميح (0 تلميحات)',
    category: 'skill',
    icon: 'Brain',
    targetCount: 1,
    tier: 'gold',
  },
  {
    id: 'solve_25',
    title: 'Linguistic Master',
    titleAr: 'وسام الخبير اللغوي 🥇',
    descriptionAr: 'إتمام حل 25 شبكة مختلفة بنجاح',
    category: 'mastery',
    icon: 'Medal',
    targetCount: 25,
    tier: 'gold',
  },
  {
    id: 'solve_50',
    title: 'Moroccan Sage',
    titleAr: 'وسام علامة المغرب 👑',
    descriptionAr: 'حل 50 شبكة وبلوغ مرتبة الحكيم',
    category: 'mastery',
    icon: 'Crown',
    targetCount: 50,
    tier: 'diamond',
  },
  {
    id: 'grandmaster_100',
    title: 'Abu Salma Grandmaster',
    titleAr: 'خاتم أبو سلمى الذهبي 🏆',
    descriptionAr: 'إنجاز أسطوري: حل 100 شبكة كاملة ليخلد اسمك في السجل الذهبي',
    category: 'mastery',
    icon: 'Trophy',
    targetCount: 100,
    tier: 'diamond',
  },
];

const LOCAL_STORAGE_KEY = 'abu_salma_achievements_v1';

export function getInitialAchievements(): UserAchievementStats {
  return {
    totalSolved: 0,
    moroccanSolved: 0,
    scienceSolved: 0,
    specialSolved: 0,
    totalTimeSpentSeconds: 0,
    averageTimeSeconds: 0,
    bestTimeSeconds: null,
    totalHintsUsed: 0,
    zeroHintCount: 0,
    unlockedBadgeIds: [],
    solvedPuzzles: {},
    lastUpdated: new Date().toISOString(),
  };
}

export function loadLocalAchievements(): UserAchievementStats {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return getInitialAchievements();
    const data = JSON.parse(raw);
    return {
      ...getInitialAchievements(),
      ...data,
      solvedPuzzles: data.solvedPuzzles || {},
      unlockedBadgeIds: Array.isArray(data.unlockedBadgeIds) ? data.unlockedBadgeIds : [],
    };
  } catch (err) {
    console.warn('Failed to parse local achievements', err);
    return getInitialAchievements();
  }
}

export function saveLocalAchievements(stats: UserAchievementStats): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.warn('Failed to save achievements locally', err);
  }
}

/**
 * Register a puzzle completion and recalculate metrics & unlocked badges.
 * Returns the updated stats plus any newly unlocked badges in this solve.
 */
export function recordPuzzleSolved(
  currentStats: UserAchievementStats,
  record: Omit<SolvedPuzzleRecord, 'solvedAt'>
): { updatedStats: UserAchievementStats; newlyUnlockedBadges: BadgeDefinition[] } {
  const solvedPuzzles = { ...currentStats.solvedPuzzles };
  const prevRecord = solvedPuzzles[record.puzzleId];

  // Store or update record
  const fullRecord: SolvedPuzzleRecord = {
    ...record,
    solvedAt: prevRecord?.solvedAt || new Date().toISOString(),
    // Keep best time if solved before
    timeSpentSeconds: prevRecord
      ? Math.min(prevRecord.timeSpentSeconds, record.timeSpentSeconds)
      : record.timeSpentSeconds,
    hintsUsedCount: prevRecord
      ? Math.min(prevRecord.hintsUsedCount, record.hintsUsedCount)
      : record.hintsUsedCount,
  };

  solvedPuzzles[record.puzzleId] = fullRecord;

  // Recalculate totals from solvedPuzzles
  const allSolved = Object.values(solvedPuzzles);
  const totalSolved = allSolved.length;

  let moroccanSolved = 0;
  let scienceSolved = 0;
  let specialSolved = 0;
  let totalTime = 0;
  let totalHints = 0;
  let zeroHintCount = 0;
  let bestTime: number | null = null;

  allSolved.forEach((p) => {
    if (p.category === 'moroccan') moroccanSolved++;
    else if (p.category === 'science') scienceSolved++;
    else specialSolved++;

    totalTime += p.timeSpentSeconds;
    totalHints += p.hintsUsedCount;

    if (p.hintsUsedCount === 0) {
      zeroHintCount++;
    }

    if (bestTime === null || p.timeSpentSeconds < bestTime) {
      bestTime = p.timeSpentSeconds;
    }
  });

  const averageTimeSeconds = totalSolved > 0 ? Math.round(totalTime / totalSolved) : 0;

  // Check unlocks
  const previouslyUnlocked = new Set(currentStats.unlockedBadgeIds || []);
  const newlyUnlockedBadges: BadgeDefinition[] = [];
  const currentUnlockedIds: string[] = [...previouslyUnlocked];

  BADGES.forEach((badge) => {
    if (previouslyUnlocked.has(badge.id)) return;

    let isUnlocked = false;
    switch (badge.id) {
      case 'first_solve':
        isUnlocked = totalSolved >= 1;
        break;
      case 'solve_3':
        isUnlocked = totalSolved >= 3;
        break;
      case 'solve_5':
        isUnlocked = totalSolved >= 5;
        break;
      case 'moroccan_10':
        isUnlocked = moroccanSolved >= 10;
        break;
      case 'science_5':
        isUnlocked = scienceSolved >= 5;
        break;
      case 'speed_demon':
        isUnlocked = allSolved.some((p) => p.timeSpentSeconds <= 180 && p.timeSpentSeconds > 0);
        break;
      case 'zero_hints':
        isUnlocked = zeroHintCount >= 1;
        break;
      case 'solve_25':
        isUnlocked = totalSolved >= 25;
        break;
      case 'solve_50':
        isUnlocked = totalSolved >= 50;
        break;
      case 'grandmaster_100':
        isUnlocked = totalSolved >= 100;
        break;
      default:
        break;
    }

    if (isUnlocked) {
      currentUnlockedIds.push(badge.id);
      newlyUnlockedBadges.push(badge);
    }
  });

  const updatedStats: UserAchievementStats = {
    totalSolved,
    moroccanSolved,
    scienceSolved,
    specialSolved,
    totalTimeSpentSeconds: totalTime,
    averageTimeSeconds,
    bestTimeSeconds: bestTime,
    totalHintsUsed: totalHints,
    zeroHintCount,
    unlockedBadgeIds: currentUnlockedIds,
    solvedPuzzles,
    lastUpdated: new Date().toISOString(),
  };

  saveLocalAchievements(updatedStats);

  return { updatedStats, newlyUnlockedBadges };
}

/**
 * Returns current progress toward a badge (current, max, percent, isUnlocked).
 */
export function getBadgeProgress(badge: BadgeDefinition, stats: UserAchievementStats) {
  const isUnlocked = stats.unlockedBadgeIds.includes(badge.id);
  let current = 0;
  const target = badge.targetCount;

  switch (badge.id) {
    case 'first_solve':
    case 'solve_3':
    case 'solve_5':
    case 'solve_25':
    case 'solve_50':
    case 'grandmaster_100':
      current = Math.min(stats.totalSolved, target);
      break;
    case 'moroccan_10':
      current = Math.min(stats.moroccanSolved, target);
      break;
    case 'science_5':
      current = Math.min(stats.scienceSolved, target);
      break;
    case 'speed_demon':
      current = isUnlocked ? 1 : 0;
      break;
    case 'zero_hints':
      current = Math.min(stats.zeroHintCount, target);
      break;
    default:
      current = isUnlocked ? target : 0;
      break;
  }

  const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  return { current, target, percent, isUnlocked };
}

export function formatSecondsArabic(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return '0 ثانية';
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  if (mins === 0) return `${secs} ثانية`;
  if (secs === 0) return `${mins} دقيقة`;
  return `${mins} دقيقة و ${secs} ث`;
}
