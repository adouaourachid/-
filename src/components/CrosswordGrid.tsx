/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Interactive Crossword Grid Board for Abu Salma Crossword.
 * Newspaper layout with RTL Arabic letter rendering, word highlighting, and tactile cell feedback.
 */

import React, { useRef, useEffect } from 'react';
import { CellData } from '../data/puzzles';

interface CellValidationState {
  status: 'neutral' | 'correct' | 'incorrect' | 'revealed';
}

interface CrosswordGridProps {
  grid: CellData[][];
  userGrid: string[][];
  validationMap: Record<string, CellValidationState>;
  selectedRow: number | null;
  selectedCol: number | null;
  activeWordCells: Set<string>;
  zoomLevel: number;
  onCellClick: (row: number, col: number) => void;
  onCellKeyDown: (e: React.KeyboardEvent, row: number, col: number) => void;
}

export const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  grid,
  userGrid,
  validationMap,
  selectedRow,
  selectedCol,
  activeWordCells,
  zoomLevel,
  onCellClick,
  onCellKeyDown,
}) => {
  const activeInputRef = useRef<HTMLInputElement | null>(null);

  // Focus the input when active cell changes
  useEffect(() => {
    if (selectedRow !== null && selectedCol !== null) {
      if (activeInputRef.current) {
        activeInputRef.current.focus();
      }
    }
  }, [selectedRow, selectedCol]);

  const rows = grid.length;
  const cols = grid[0]?.length || 15;

  // Adaptive generous sizing for 20x20, 15x15, and 9x9 (تكبير مربعات الأجوبة)
  const cellSizeClass =
    cols >= 20
      ? 'w-[30px] h-[30px] xs:w-[34px] xs:h-[34px] sm:w-[38px] sm:h-[38px] md:w-[42px] md:h-[42px] lg:w-[46px] lg:h-[46px]'
      : cols <= 9
      ? 'w-[48px] h-[48px] sm:w-[56px] sm:h-[56px] md:w-[64px] md:h-[64px] lg:w-[72px] lg:h-[72px]'
      : 'w-[38px] h-[38px] xs:w-[42px] xs:h-[42px] sm:w-[46px] sm:h-[46px] md:w-[50px] md:h-[50px] lg:w-[54px] lg:h-[54px]';

  const fontSizeClass =
    cols >= 20
      ? 'text-base sm:text-lg md:text-xl lg:text-2xl font-bold'
      : cols <= 9
      ? 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold'
      : 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold';

  const numSizeClass =
    cols >= 20
      ? 'text-[7px] sm:text-[8px] md:text-[9px]'
      : 'text-[9px] sm:text-[11px] md:text-xs';
      
  const arrowSizeClass =
    cols >= 20
      ? 'text-[6px] sm:text-[7px] md:text-[8px]'
      : 'text-[8px] sm:text-[10px] md:text-[11px]';

  return (
    <div
      className="inline-block p-1 sm:p-2 md:p-2.5 bg-[#EDE6D6] rounded-xl border-2 sm:border-3 border-[#2A241A] shadow-xl overflow-x-auto max-w-full transition-transform origin-top"
      style={{
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'top center',
      }}
      dir="rtl"
    >
      <div
        className="grid border-2 border-[#201D19] bg-[#201D19] gap-[1px]"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const cellKey = `${r},${c}`;
            const isBlack = cell.isBlack;
            const isSelected = selectedRow === r && selectedCol === c;
            const isInActiveWord = activeWordCells.has(cellKey);
            const valState = validationMap[cellKey]?.status || 'neutral';
            const value = userGrid[r]?.[c] || '';

            // Black Separator Square:
            // Significantly reduced (50% size / 25% area) so the black squares are discreet dividers and white answer cells dominate!
            if (isBlack) {
              return (
                <div
                  key={cellKey}
                  className={`${cellSizeClass} bg-[#EAE2D2] flex items-center justify-center select-none`}
                  aria-hidden="true"
                >
                  <div className="w-[50%] h-[50%] bg-[#2C251D] rounded-xs opacity-85 shadow-inner" />
                </div>
              );
            }

            // Playable White Answer Cell (مربعات الأجوبة):
            // Full 100% cell dimensions, bright paper white, crisp, prominent and spacious!
            let bgClass = 'bg-white';
            let textClass = 'text-[#1E1912]';

            if (valState === 'correct') {
              bgClass = 'bg-[#D1FAE5]';
              textClass = 'text-[#065F46] font-bold';
            } else if (valState === 'incorrect') {
              bgClass = 'bg-[#FEE2E2]';
              textClass = 'text-[#991B1B] font-bold';
            } else if (valState === 'revealed') {
              bgClass = 'bg-[#FEF3C7]';
              textClass = 'text-[#92400E] font-bold';
            } else if (isSelected) {
              bgClass = 'bg-[#FEE685] ring-2 ring-inset ring-[#8F6106] z-10';
              textClass = 'text-[#1A1610] font-black';
            } else if (isInActiveWord) {
              bgClass = 'bg-[#FFF3C4]';
              textClass = 'text-[#241F16]';
            }

            return (
              <div
                key={cellKey}
                onClick={() => onCellClick(r, c)}
                className={`relative ${cellSizeClass} ${bgClass} transition-colors select-none cursor-pointer flex items-center justify-center shadow-xs`}
              >
                {/* Clue Number (if word starts here) */}
                {cell.number !== null && (
                  <span className={`absolute top-0.5 right-0.5 sm:right-1 ${numSizeClass} font-mono font-bold text-[#635745] leading-none pointer-events-none select-none z-10`}>
                    {cell.number}
                  </span>
                )}

                {/* Classic Arabic Newspaper Direction Arrows */}
                {cell.hasArrowLeft && (
                  <span
                    className={`absolute top-0.5 left-0.5 sm:left-1 ${arrowSizeClass} text-[#423725] leading-none pointer-events-none select-none`}
                    title="بداية كلمة أفقية (◀)"
                  >
                    ◀
                  </span>
                )}
                {cell.hasArrowDown && !cell.hasArrowLeft && (
                  <span
                    className={`absolute top-0.5 left-0.5 sm:left-1 ${arrowSizeClass} text-[#423725] leading-none pointer-events-none select-none`}
                    title="بداية كلمة عمودية (▼)"
                  >
                    ▼
                  </span>
                )}
                {cell.hasArrowDown && cell.hasArrowLeft && (
                  <span
                    className={`absolute bottom-0.5 left-0.5 sm:left-1 ${arrowSizeClass} text-[#423725] leading-none pointer-events-none select-none`}
                    title="بداية كلمة عمودية (▼)"
                  >
                    ▼
                  </span>
                )}

                {/* Visible / Editable Character in Cell */}
                <input
                  ref={isSelected ? activeInputRef : undefined}
                  type="text"
                  value={value}
                  readOnly
                  aria-label={`خلية ${r + 1}، ${c + 1}`}
                  onKeyDown={(e) => onCellKeyDown(e, r, c)}
                  className={`w-full h-full text-center bg-transparent border-none outline-none font-amiri ${fontSizeClass} cursor-pointer ${textClass} p-0 m-0`}
                  tabIndex={isSelected ? 0 : -1}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
