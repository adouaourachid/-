/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Active Clue Dock Component for Abu Salma Crossword.
 * Fixed/Docked banner showing the currently focused question, word direction, length, and actions.
 */

import React from 'react';
import { ClueItem } from '../data/puzzles';
import { ArrowRightLeft, Check, Sparkles, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';

interface ActiveClueDockProps {
  activeClue: ClueItem | null;
  direction: 'across' | 'down';
  onToggleDirection: () => void;
  onCheckWord: () => void;
  onRevealLetter: () => void;
  onRevealWord: () => void;
  onPrevClue: () => void;
  onNextClue: () => void;
  onAskAIHint: () => void;
}

export const ActiveClueDock: React.FC<ActiveClueDockProps> = ({
  activeClue,
  direction,
  onToggleDirection,
  onCheckWord,
  onRevealLetter,
  onRevealWord,
  onPrevClue,
  onNextClue,
  onAskAIHint,
}) => {
  if (!activeClue) {
    return (
      <div className="bg-[#FAF7F0] border-2 border-[#363024] rounded-xl p-3 sm:p-4 shadow-sm text-center">
        <p className="text-sm font-medium text-[#7C6F5C]">
          اضغط على أي خانة بيضاء في الشبكة لعرض السؤال والبدء بالكتابة
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF7F0] border-2 border-[#363024] rounded-xl p-3 sm:p-4 shadow-md transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Clue Details */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-[#3B3428] text-white text-xs font-bold">
              {activeClue.num ? `رقم ${activeClue.num}` : 'السؤال الحالي'}
            </span>

            <button
              onClick={onToggleDirection}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#E4DAC7] hover:bg-[#D5C9B3] text-[#362E21] text-xs font-semibold cursor-pointer border border-[#C5B79F] transition-colors"
              title="انقر لتبديل الاتجاه بين أفقي وعمودي"
            >
              <ArrowRightLeft className="w-3 h-3 text-[#5A4D37]" />
              <span>{direction === 'across' ? 'أفقي (◀ يمين لليسار)' : 'عمودي (▼ من أعلى لأسفل)'}</span>
            </button>

            <span className="text-xs font-medium text-[#6B5E4A] bg-[#EDE4D3] px-2 py-0.5 rounded border border-[#DFD3BE]">
              {activeClue.length} حروف
            </span>

            {activeClue.category && (
              <span className="text-xs text-[#827460] font-normal">
                · {activeClue.category}
              </span>
            )}
          </div>

          <h2 className="text-lg sm:text-xl font-bold font-amiri text-[#1F1B15] leading-snug">
            {activeClue.clue}
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E5DAC6]">
          {/* Previous / Next Clue Nav */}
          <div className="flex items-center bg-[#EAE1D1] rounded-lg p-0.5 border border-[#D5C8B4]">
            <button
              onClick={onPrevClue}
              className="p-1.5 hover:bg-white rounded text-[#423829] cursor-pointer transition-colors"
              title="السؤال السابق"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-xs text-[#7A6C58] px-1 font-mono">
              التنقل
            </span>
            <button
              onClick={onNextClue}
              className="p-1.5 hover:bg-white rounded text-[#423829] cursor-pointer transition-colors"
              title="السؤال التالي"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* AI Helper Hint */}
          <button
            onClick={onAskAIHint}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F5ECDB] hover:bg-[#EBDDC5] text-[#69460D] border border-[#DCBFA2] text-xs font-semibold cursor-pointer transition-colors"
            title="تلميح ذكي وسريع دون كشف الإجابة"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#A16207]" />
            <span>تلميح ذكي</span>
          </button>

          {/* Reveal Single Letter */}
          <button
            onClick={onRevealLetter}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#F2ECE0] text-[#3D3323] border border-[#CFC1A9] text-xs font-medium cursor-pointer transition-colors"
            title="كشف الحرف المحدد"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B88728]" />
            <span>كشف حرف</span>
          </button>

          {/* Reveal Word */}
          <button
            onClick={onRevealWord}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#F2ECE0] text-[#635541] border border-[#CFC1A9] text-xs font-medium cursor-pointer transition-colors"
            title="كشف الكلمة كاملة"
          >
            كشف الكلمة
          </button>

          {/* Check Word */}
          <button
            onClick={onCheckWord}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2E6B34] hover:bg-[#245429] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
            title="تحقق من صحة الكلمة"
          >
            <Check className="w-3.5 h-3.5" />
            <span>تحقق</span>
          </button>
        </div>
      </div>
    </div>
  );
};
