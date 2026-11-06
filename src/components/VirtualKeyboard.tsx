/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * On-screen Arabic Virtual Keyboard for Abu Salma Crossword.
 * Features an integrated yellow-highlighted Question Bar directly above the keys,
 * keeping the crossword grid completely clear and visible.
 */

import React from 'react';
import { Delete, ArrowRightLeft, Sparkles, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { ClueItem } from '../data/puzzles';

interface VirtualKeyboardProps {
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onToggleDirection: () => void;
  onHint: () => void;
  direction: 'across' | 'down';
  isOpen: boolean;
  onToggleOpen: () => void;
  activeClue: ClueItem | null;
  onCheckWord?: () => void;
  onPrevClue?: () => void;
  onNextClue?: () => void;
  onAskAIHint?: () => void;
}

const ROW_1 = ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'];
const ROW_2 = ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'];
const ROW_3 = ['ذ', 'ئ', 'ء', 'ؤ', 'ر', 'ى', 'ة', 'و', 'ز', 'ظ'];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onKeyPress,
  onBackspace,
  onToggleDirection,
  onHint,
  direction,
  isOpen,
  onToggleOpen,
  activeClue,
  onCheckWord,
  onPrevClue,
  onNextClue,
  onAskAIHint,
}) => {
  // When keyboard is minimized, show a compact floating question strip
  if (!isOpen) {
    return (
      <div className="fixed bottom-2 left-0 right-0 z-30 px-3 max-w-xl mx-auto no-print">
        <div className="flex items-center justify-between gap-2 p-2 bg-[#FFF8DB] border-2 border-[#D4A328] rounded-xl shadow-lg">
          <div className="flex-1 min-w-0 text-right">
            {activeClue ? (
              <div className="flex items-center gap-1.5">
                <span className="shrink-0 px-1.5 py-0.5 rounded bg-[#3B3428] text-white text-[10px] font-bold">
                  {activeClue.num ? `رقم ${activeClue.num}` : ''} ({direction === 'across' ? 'أفقي ◀' : 'عمودي ▼'})
                </span>
                <span className="font-amiri font-bold text-xs sm:text-sm text-[#241E15] truncate">
                  {activeClue.clue}
                </span>
              </div>
            ) : (
              <span className="text-xs text-[#7A6B53]">اضغط على خانة لعرض السؤال</span>
            )}
          </div>

          <button
            onClick={onToggleOpen}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#3B3428] text-[#F8F5EE] text-xs font-semibold hover:bg-[#28231B] transition-all cursor-pointer border border-[#584D3D] shrink-0"
          >
            <span>لوحة المفاتيح</span>
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#EDE7DA]/98 backdrop-blur-md border-t-3 border-[#363024] p-1.5 sm:p-2 shadow-2xl no-print select-none transition-all">
      <div className="max-w-3xl mx-auto flex flex-col gap-1.5">
        
        {/* ========================================================================= */}
        {/* THE QUESTION BAR (شريط السؤال النقي في مستوى واحد مع زر التلميح) */}
        {/* ========================================================================= */}
        <div className="bg-[#FEF08A] border-2 border-[#D97706] rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 shadow-md flex items-center justify-between gap-2 transition-all">
          {/* THE QUESTION TEXT (نص السؤال في مستوى التلميح) */}
          <div className="flex-1 min-w-0 text-right pr-1">
            {activeClue ? (
              <p className="font-amiri font-bold text-base sm:text-lg md:text-xl text-[#1E1708] leading-tight select-text">
                {activeClue.clue}
              </p>
            ) : (
              <p className="font-amiri font-semibold text-xs sm:text-sm text-[#785E22]">
                👈 اضغط على أي خانة بيضاء في الشبكة لعرض السؤال هنا
              </p>
            )}
          </div>

          {/* ACTION BUTTONS ON THE SAME LEVEL AS THE QUESTION (التلميح في نفس مستوى السؤال) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Check Answer Button */}
            {onCheckWord && (
              <button
                onClick={onCheckWord}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#15803D] hover:bg-[#166534] active:scale-95 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer transition-colors"
                title="تحقق من صحة الكلمة الحالية"
              >
                <Check className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">تحقق</span>
              </button>
            )}

            {/* Hint button on the same level as the question (زر التلميح) */}
            <button
              onClick={onHint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF089] hover:bg-[#FDE047] active:scale-95 text-[#78350F] border border-[#CA8A04] text-xs sm:text-sm font-bold shadow-xs cursor-pointer transition-colors"
              title="كشف الحرف في الخانة المحددة"
            >
              <Sparkles className="w-4 h-4 text-[#B45309]" />
              <span>تلميح</span>
            </button>

            {/* Minimize keyboard toggle */}
            <button
              onClick={onToggleOpen}
              className="p-1.5 rounded-lg hover:bg-[#FDE047] text-[#713F12] cursor-pointer transition-colors"
              title="إخفاء لوحة المفاتيح لإفساح مجال للشبكة"
              aria-label="إخفاء لوحة المفاتيح"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ARABIC KEYBOARD KEYS (حروف الكايبورد الكبيرة والمريحة للمس) */}
        {/* ========================================================================= */}
        
        {/* Row 1 */}
        <div className="flex justify-center gap-1 sm:gap-1.5">
          {ROW_1.map((char) => (
            <button
              key={char}
              onClick={() => onKeyPress(char)}
              className="flex-1 max-w-[50px] sm:max-w-[58px] md:max-w-[64px] h-12 sm:h-13 md:h-14 rounded-lg bg-white text-[#18140E] hover:bg-[#FAF6F0] active:scale-95 shadow-xs border border-[#BFB09C] font-amiri text-2xl sm:text-3xl md:text-3xl font-black flex items-center justify-center transition-transform cursor-pointer leading-none"
            >
              {char}
            </button>
          ))}
        </div>

        {/* Row 2 */}
        <div className="flex justify-center gap-1 sm:gap-1.5 px-0.5 sm:px-1.5">
          {ROW_2.map((char) => (
            <button
              key={char}
              onClick={() => onKeyPress(char)}
              className="flex-1 max-w-[52px] sm:max-w-[60px] md:max-w-[66px] h-12 sm:h-13 md:h-14 rounded-lg bg-white text-[#18140E] hover:bg-[#FAF6F0] active:scale-95 shadow-xs border border-[#BFB09C] font-amiri text-2xl sm:text-3xl md:text-3xl font-black flex items-center justify-center transition-transform cursor-pointer leading-none"
            >
              {char}
            </button>
          ))}
        </div>

        {/* Row 3 with Backspace and Direction */}
        <div className="flex justify-center items-center gap-1 sm:gap-1.5">
          {/* Backspace Key */}
          <button
            onClick={onBackspace}
            className="flex-[1.4] max-w-[76px] sm:max-w-[88px] h-12 sm:h-13 md:h-14 rounded-lg bg-[#E2D4BF] text-[#3D3323] hover:bg-[#D5C4AC] active:scale-95 border border-[#B5A58D] font-bold text-xs sm:text-sm flex items-center justify-center gap-1 transition-transform cursor-pointer shadow-xs"
            title="مسح الحرف (Backspace)"
          >
            <Delete className="w-5 h-5 text-[#4A3D28]" />
            <span className="hidden sm:inline">مسح</span>
          </button>

          {ROW_3.map((char) => (
            <button
              key={char}
              onClick={() => onKeyPress(char)}
              className="flex-1 max-w-[52px] sm:max-w-[60px] md:max-w-[66px] h-12 sm:h-13 md:h-14 rounded-lg bg-white text-[#18140E] hover:bg-[#FAF6F0] active:scale-95 shadow-xs border border-[#BFB09C] font-amiri text-2xl sm:text-3xl md:text-3xl font-black flex items-center justify-center transition-transform cursor-pointer leading-none"
            >
              {char}
            </button>
          ))}

          {/* Direction Toggle Key */}
          <button
            onClick={onToggleDirection}
            className="flex-[1.4] max-w-[76px] sm:max-w-[88px] h-12 sm:h-13 md:h-14 rounded-lg bg-[#383023] text-white hover:bg-[#251F16] active:scale-95 border border-[#1F1A12] font-bold text-xs sm:text-sm flex items-center justify-center gap-1 transition-transform cursor-pointer shadow-xs"
            title="تبديل الاتجاه بين أفقي وعمودي"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
            <span className="text-xs sm:text-sm">{direction === 'across' ? 'أفقي' : 'عمودي'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
