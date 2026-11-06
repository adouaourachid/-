/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Achievements & Badges Modal for Abu Salma Crossword.
 * Visualizes user achievements, stats (total solved, average time, best time),
 * and virtual Moroccan medals/badges with progress bars.
 */

import React, { useState } from 'react';
import {
  Trophy,
  X,
  Sparkles,
  Clock,
  Zap,
  Award,
  BookOpen,
  Compass,
  Atom,
  Brain,
  Medal,
  Crown,
  CheckCircle2,
  Lock,
  Flame,
  Calendar,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { BADGES, getBadgeProgress, formatSecondsArabic } from '../utils/achievements';
import { UserAchievementStats, BadgeDefinition } from '../types/achievements';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserAchievementStats;
  onSelectPuzzleById?: (puzzleId: string) => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onSelectPuzzleById,
}) => {
  const [activeTab, setActiveTab] = useState<'badges' | 'history'>('badges');
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  if (!isOpen) return null;

  const unlockedCount = stats.unlockedBadgeIds.length;
  const totalBadges = BADGES.length;
  const solvedList = Object.values(stats.solvedPuzzles).sort(
    (a, b) => new Date(b.solvedAt).getTime() - new Date(a.solvedAt).getTime()
  );

  const filteredBadges = BADGES.filter((badge) => {
    const isUnlocked = stats.unlockedBadgeIds.includes(badge.id);
    if (badgeFilter === 'unlocked') return isUnlocked;
    if (badgeFilter === 'locked') return !isUnlocked;
    return true;
  });

  // Render badge icon dynamically
  const renderBadgeIcon = (iconName: string, isUnlocked: boolean, tier: BadgeDefinition['tier']) => {
    const iconClass = `w-7 h-7 sm:w-8 sm:h-8 ${
      isUnlocked
        ? tier === 'diamond'
          ? 'text-cyan-500'
          : tier === 'gold'
          ? 'text-amber-500'
          : tier === 'silver'
          ? 'text-slate-400'
          : 'text-amber-700'
        : 'text-[#8E7E6B]'
    }`;

    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className={iconClass} />;
      case 'Award':
        return <Award className={iconClass} />;
      case 'BookOpen':
        return <BookOpen className={iconClass} />;
      case 'Compass':
        return <Compass className={iconClass} />;
      case 'Atom':
        return <Atom className={iconClass} />;
      case 'Zap':
        return <Zap className={iconClass} />;
      case 'Brain':
        return <Brain className={iconClass} />;
      case 'Medal':
        return <Medal className={iconClass} />;
      case 'Crown':
        return <Crown className={iconClass} />;
      case 'Trophy':
        return <Trophy className={iconClass} />;
      default:
        return <Award className={iconClass} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs no-print select-none">
      <div className="w-full max-w-3xl max-h-[92vh] bg-[#FAF7F0] border-3 border-[#362E20] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Header */}
        <div className="bg-[#EDE5D5] border-b-2 border-[#C9BCA7] px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border-2 border-[#9F8356] flex items-center justify-center shadow-xs">
              <Trophy className="w-6 h-6 text-[#926B1E]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-kufi text-[#241E15] leading-tight">
                سجل إنجازات أبو سلمى
              </h2>
              <p className="text-xs font-amiri font-bold text-[#6D5E49]">
                الأوسمة الافتراضية، سجل الشبكات المحلولة، وإحصائيات السرعة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#DDD2BF] text-[#4A3F30] cursor-pointer transition-colors"
            title="إغلاق"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4">
          
          {/* Key Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {/* Total Solved Card */}
            <div className="bg-[#FAF2E1] border border-[#DECDAF] rounded-xl p-3 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between text-[#856322]">
                <span className="text-[11px] font-bold font-amiri">الشبكات المكتملة</span>
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
              </div>
              <div className="mt-1">
                <span className="text-2xl sm:text-3xl font-black font-mono text-[#251D12]">
                  {stats.totalSolved}
                </span>
                <span className="text-[10px] text-[#78664F] mr-1">شبكة</span>
              </div>
              <div className="text-[10px] text-[#7A6953] font-amiri mt-0.5">
                {stats.moroccanSolved} مغربية · {stats.scienceSolved} علمية
              </div>
            </div>

            {/* Average Time Card */}
            <div className="bg-[#FAF2E1] border border-[#DECDAF] rounded-xl p-3 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between text-[#856322]">
                <span className="text-[11px] font-bold font-amiri">متوسط وقت الحل</span>
                <Clock className="w-4 h-4 text-[#A8791B]" />
              </div>
              <div className="mt-1">
                <span className="text-xl sm:text-2xl font-bold font-mono text-[#251D12]">
                  {stats.totalSolved > 0 ? formatSecondsArabic(stats.averageTimeSeconds) : '—'}
                </span>
              </div>
              <div className="text-[10px] text-[#7A6953] font-amiri mt-0.5">
                لكل شبكة محلولة
              </div>
            </div>

            {/* Best Record Card */}
            <div className="bg-[#FAF2E1] border border-[#DECDAF] rounded-xl p-3 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between text-[#856322]">
                <span className="text-[11px] font-bold font-amiri">أسرع إنجاز</span>
                <Zap className="w-4 h-4 text-[#D97706]" />
              </div>
              <div className="mt-1">
                <span className="text-xl sm:text-2xl font-bold font-mono text-[#251D12]">
                  {stats.bestTimeSeconds !== null ? formatSecondsArabic(stats.bestTimeSeconds) : '—'}
                </span>
              </div>
              <div className="text-[10px] text-[#7A6953] font-amiri mt-0.5">
                أفضل وقت مسجل
              </div>
            </div>

            {/* Pure Solves Card */}
            <div className="bg-[#FAF2E1] border border-[#DECDAF] rounded-xl p-3 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between text-[#856322]">
                <span className="text-[11px] font-bold font-amiri">بدون تلميحات</span>
                <Sparkles className="w-4 h-4 text-[#B45309]" />
              </div>
              <div className="mt-1">
                <span className="text-2xl sm:text-3xl font-black font-mono text-[#251D12]">
                  {stats.zeroHintCount}
                </span>
                <span className="text-[10px] text-[#78664F] mr-1">حل عبقري</span>
              </div>
              <div className="text-[10px] text-[#7A6953] font-amiri mt-0.5">
                صفر تلميحات مستخدمة
              </div>
            </div>
          </div>

          {/* Navigation Tabs (الأوسمة vs السجل التاريخي) */}
          <div className="flex items-center justify-between border-b border-[#D6C8B2] pb-1 gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('badges')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'badges'
                    ? 'bg-[#382E20] text-white shadow-xs'
                    : 'text-[#4F4130] hover:bg-[#E8DFC9]'
                }`}
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>لوحة الأوسمة والميداليات</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
                  {unlockedCount}/{totalBadges}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-[#382E20] text-white shadow-xs'
                    : 'text-[#4F4130] hover:bg-[#E8DFC9]'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>سجل الشبكات المحلولة</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
                  {stats.totalSolved}
                </span>
              </button>
            </div>

            {/* Filter buttons for badges tab */}
            {activeTab === 'badges' && (
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <button
                  onClick={() => setBadgeFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    badgeFilter === 'all'
                      ? 'bg-[#D1C3AB] text-[#241E15]'
                      : 'text-[#6D5D48] hover:bg-[#EAE1D1]'
                  }`}
                >
                  الكل ({totalBadges})
                </button>
                <button
                  onClick={() => setBadgeFilter('unlocked')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    badgeFilter === 'unlocked'
                      ? 'bg-[#D1C3AB] text-[#241E15]'
                      : 'text-[#6D5D48] hover:bg-[#EAE1D1]'
                  }`}
                >
                  المكتسبة ({unlockedCount})
                </button>
                <button
                  onClick={() => setBadgeFilter('locked')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    badgeFilter === 'locked'
                      ? 'bg-[#D1C3AB] text-[#241E15]'
                      : 'text-[#6D5D48] hover:bg-[#EAE1D1]'
                  }`}
                >
                  قيد الإنجاز ({totalBadges - unlockedCount})
                </button>
              </div>
            )}
          </div>

          {/* TAB 1: BADGES GRID */}
          {activeTab === 'badges' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredBadges.map((badge) => {
                const { current, target, percent, isUnlocked } = getBadgeProgress(badge, stats);

                // Tier Styling
                let tierBorder = 'border-[#D4C4AB]';
                let tierBg = 'bg-[#FAF7F0]';
                let tierGlow = '';

                if (isUnlocked) {
                  if (badge.tier === 'diamond') {
                    tierBorder = 'border-cyan-500/80';
                    tierBg = 'bg-gradient-to-br from-[#E0F7FA] to-[#FAF7F0]';
                    tierGlow = 'shadow-md shadow-cyan-500/10';
                  } else if (badge.tier === 'gold') {
                    tierBorder = 'border-amber-400';
                    tierBg = 'bg-gradient-to-br from-[#FFFBEB] to-[#FAF7F0]';
                    tierGlow = 'shadow-md shadow-amber-500/10';
                  } else if (badge.tier === 'silver') {
                    tierBorder = 'border-slate-300';
                    tierBg = 'bg-gradient-to-br from-[#F1F5F9] to-[#FAF7F0]';
                  } else {
                    tierBorder = 'border-amber-700/40';
                    tierBg = 'bg-[#FDFBF7]';
                  }
                }

                return (
                  <div
                    key={badge.id}
                    className={`relative p-3.5 rounded-xl border-2 ${tierBorder} ${tierBg} ${tierGlow} flex gap-3 transition-all`}
                  >
                    {/* Badge Icon Frame */}
                    <div
                      className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center shrink-0 ${
                        isUnlocked
                          ? 'border-[#C9A458] bg-[#FFF5D6] shadow-sm'
                          : 'border-[#D4C6B2] bg-[#EFE9DC] opacity-65'
                      }`}
                    >
                      {renderBadgeIcon(badge.icon, isUnlocked, badge.tier)}
                    </div>

                    {/* Badge Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-amiri font-bold text-sm sm:text-base text-[#241E15] leading-tight truncate">
                            {badge.titleAr}
                          </h3>

                          {isUnlocked ? (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] shrink-0">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>مكتسب</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EFE9DC] text-[#71624E] shrink-0">
                              <Lock className="w-3 h-3" />
                              <span>قيد السعي</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#635541] font-amiri mt-0.5 line-clamp-2">
                          {badge.descriptionAr}
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-2.5">
                        <div className="flex items-center justify-between text-[10px] text-[#786955] font-mono mb-1">
                          <span>التقدم:</span>
                          <span className="font-bold">
                            {isUnlocked ? 'مكتمل 100%' : `${current} / ${target} (${percent}%)`}
                          </span>
                        </div>
                        <div className="w-full bg-[#E4D9C7] h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              isUnlocked ? 'bg-[#15803D]' : 'bg-[#C99120]'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: SOLVED PUZZLES HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-2">
              {solvedList.length === 0 ? (
                <div className="text-center py-10 bg-[#FAF4E8] rounded-xl border border-[#D5C7B0] p-6">
                  <Flame className="w-10 h-10 text-amber-500/70 mx-auto mb-2" />
                  <p className="font-amiri font-bold text-base text-[#382E20]">
                    لم تقم بحل أي شبكة بالكامل بعد!
                  </p>
                  <p className="text-xs text-[#7A6B56] mt-1 font-amiri">
                    ابدأ بحل أي شبكة مغربية أو علمية واجتز الاختبار لتسجيل أول انتصار لك في السجل.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#6D5E4A] font-amiri px-1">
                    قائمة الشبكات التي أتممت حلها بنجاح ({solvedList.length} شبكة):
                  </div>

                  <div className="divide-y divide-[#E6DAC8] border border-[#DECFBB] rounded-xl bg-white overflow-hidden shadow-xs">
                    {solvedList.map((item, idx) => (
                      <div
                        key={item.puzzleId}
                        className="p-3 flex items-center justify-between gap-2 hover:bg-[#FAF7F0] transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-[#FAF0D9] text-[#7A5B18] font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-[#D5B979]">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-amiri font-bold text-sm text-[#241E15] truncate">
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-[#786650] font-amiri mt-0.5">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#9A7426]" />
                                <span>{formatSecondsArabic(item.timeSpentSeconds)}</span>
                              </span>
                              <span>·</span>
                              <span>
                                {item.hintsUsedCount === 0
                                  ? 'بدون تلميحات ✨'
                                  : `${item.hintsUsedCount} تلميحات`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.category === 'moroccan'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : item.category === 'science'
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {item.category === 'moroccan'
                              ? '🇲🇦 مغربية'
                              : item.category === 'science'
                              ? '🔬 علمية'
                              : '⭐ كبرى'}
                          </span>

                          {onSelectPuzzleById && (
                            <button
                              onClick={() => {
                                onSelectPuzzleById(item.puzzleId);
                                onClose();
                              }}
                              className="text-xs px-2.5 py-1 rounded-md bg-[#EDE5D5] hover:bg-[#DFD3BE] text-[#362E20] font-bold cursor-pointer transition-colors"
                              title="إعادة فتح هذه الشبكة"
                            >
                              عرض
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="bg-[#EFE7D8] border-t border-[#D6C7B0] px-4 py-2.5 flex items-center justify-between text-xs text-[#6B5C47] font-amiri">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>يتم حفظ تقدمك وإنجازاتك تلقائياً محلياً وسحابياً عبر حسابك</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#382F22] hover:bg-[#251E14] text-white font-bold cursor-pointer transition-colors shadow-xs"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
