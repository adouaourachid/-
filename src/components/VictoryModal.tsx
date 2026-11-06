/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Victory & Puzzle Completed Modal for Abu Salma Crossword.
 * Celebratory fanfare, confetti, stats breakdown, and next puzzle options.
 */

import React from 'react';
import { Trophy, Clock, Sparkles, RotateCcw, ArrowLeft, Printer, Award, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BadgeDefinition } from '../types/achievements';
import { formatSecondsArabic } from '../utils/achievements';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  puzzleTitle: string;
  timeSpentSeconds: number;
  hintsUsedCount: number;
  totalLetters: number;
  onPlayNextPuzzle: () => void;
  onReplay: () => void;
  onPrint: () => void;
  newlyUnlockedBadges?: BadgeDefinition[];
  totalSolvedCount?: number;
  averageTimeSeconds?: number;
  onOpenAchievements?: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  onClose,
  puzzleTitle,
  timeSpentSeconds,
  hintsUsedCount,
  totalLetters,
  onPlayNextPuzzle,
  onReplay,
  onPrint,
  newlyUnlockedBadges = [],
  totalSolvedCount,
  averageTimeSeconds,
  onOpenAchievements,
}) => {
  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins} دقيقة و ${rem} ثانية`;
  };

  const handleFireMoreConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print select-none">
      <div className="w-full max-w-md bg-[#FAF7F0] border-3 border-[#362E20] rounded-2xl p-6 shadow-2xl relative text-center">
        {/* Decorative Badge */}
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#F5E7C4] border-2 border-[#BFA267] flex items-center justify-center shadow-md animate-bounce">
          <Trophy className="w-9 h-9 text-[#855B09]" />
        </div>

        <h2 className="text-2xl font-black font-kufi text-[#241E15] mb-1">
          مبروك! لقد أتممت حل الشبكة بنجاح
        </h2>
        <p className="text-xs font-amiri font-bold text-[#6B5A42] mb-5">
          {puzzleTitle}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 bg-[#EFE7D8] p-3.5 rounded-xl border border-[#D5C7B0] mb-5 text-right">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#7A643E] shrink-0" />
            <div>
              <div className="text-[10px] text-[#786954]">وقت الحل المستغرق</div>
              <div className="text-xs font-bold font-mono text-[#241E15]">
                {formatTime(timeSpentSeconds)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#A8791B] shrink-0" />
            <div>
              <div className="text-[10px] text-[#786954]">التلميحات المستخدمة</div>
              <div className="text-xs font-bold text-[#241E15]">
                {hintsUsedCount === 0 ? 'بدون تلميحات (مثالي!)' : `${hintsUsedCount} تلميحات`}
              </div>
            </div>
          </div>
        </div>

        {/* Newly Unlocked Badge Celebration Banner */}
        {newlyUnlockedBadges.length > 0 && (
          <div className="mb-4 p-3 bg-gradient-to-r from-[#FEF3C7] via-[#FDE68A] to-[#FEF3C7] border-2 border-[#D97706] rounded-xl text-right animate-pulse shadow-md">
            <div className="flex items-center gap-2 text-[#92400E] font-bold text-xs mb-1">
              <Award className="w-4 h-4 text-[#B45309]" />
              <span>🎉 وسام جديد تم فتحه بنجاح!</span>
            </div>
            {newlyUnlockedBadges.map((b) => (
              <div key={b.id} className="mt-1 bg-white/70 p-2 rounded-lg border border-[#F59E0B]">
                <div className="text-sm font-black font-amiri text-[#78350F]">
                  {b.titleAr}
                </div>
                <div className="text-[11px] text-[#92400E] font-amiri">
                  {b.descriptionAr}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Overall Solver Stats Summary (if available) */}
        {totalSolvedCount !== undefined && totalSolvedCount > 0 && (
          <div className="mb-4 py-2 px-3 bg-[#EFE8DC] rounded-xl border border-[#D8CABE] flex items-center justify-around text-xs text-[#524434] font-amiri">
            <div>
              <span className="text-[10px] text-[#7A6B56] block">إجمالي شبكاتك المحلولة</span>
              <span className="font-mono font-bold text-sm text-[#271E14]">
                {totalSolvedCount} شبكة
              </span>
            </div>
            {averageTimeSeconds !== undefined && averageTimeSeconds > 0 && (
              <>
                <div className="w-[1px] h-6 bg-[#CBBDAA]" />
                <div>
                  <span className="text-[10px] text-[#7A6B56] block">متوسط وقتك لكل لغز</span>
                  <span className="font-mono font-bold text-sm text-[#271E14]">
                    {formatSecondsArabic(averageTimeSeconds)}
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              onPlayNextPuzzle();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#2E6B34] hover:bg-[#235328] text-white text-sm font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <span>الانتقال للشبكة التالية</span>
            <ArrowLeft className="w-4 h-4" />
          </button>

          {onOpenAchievements && (
            <button
              onClick={() => {
                onClose();
                onOpenAchievements();
              }}
              className="w-full py-2 px-3 rounded-lg bg-[#FAF0D8] hover:bg-[#F3E2BD] text-[#785110] border border-[#D5B979] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>عرض سجل الإنجازات والأوسمة 🏅</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onReplay();
                onClose();
              }}
              className="flex-1 py-2 px-3 rounded-lg bg-[#EFE8DA] hover:bg-[#E2D8C7] text-[#3D3323] text-xs font-semibold border border-[#C5B69F] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة الحل</span>
            </button>

            <button
              onClick={onPrint}
              className="flex-1 py-2 px-3 rounded-lg bg-white hover:bg-[#F2ECE0] text-[#3D3323] text-xs font-semibold border border-[#C5B69F] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة ورقية</span>
            </button>
          </div>

          <button
            onClick={handleFireMoreConfetti}
            className="text-[11px] text-[#8C7654] hover:underline mt-1 cursor-pointer"
          >
            احتفل مجدداً بالألعاب النارية 🎊
          </button>
        </div>
      </div>
    </div>
  );
};
