/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Printable Newspaper Crossword Sheet for Abu Salma Crossword.
 * Formatted for standard paper printing (A4 / Letter) with crisp ink borders and clear clues.
 */

import React from 'react';
import { PuzzleDefinition } from '../data/puzzles';

interface PrintSheetProps {
  puzzle: PuzzleDefinition;
}

export const PrintSheet: React.FC<PrintSheetProps> = ({ puzzle }) => {
  return (
    <div className="hidden print:block p-6 bg-white text-black font-amiri" dir="rtl">
      {/* Newspaper Masthead */}
      <div className="text-center border-b-2 border-black pb-3 mb-4">
        <h1 className="text-3xl font-bold font-kufi tracking-tight mb-1">
          شبكة أبو سلمى للكلمات المتقاطعة
        </h1>
        <div className="flex justify-between items-center text-xs border-t border-black pt-1">
          <span>{puzzle.title}</span>
          <span>{puzzle.date}</span>
          <span>درجة الصعوبة: {puzzle.difficulty}</span>
        </div>
      </div>

      {/* Main Print Layout: Grid + Clues */}
      <div className="flex gap-4 items-start">
        {/* The Crossword Grid */}
        <div className={`shrink-0 border-2 border-black ${puzzle.cols >= 20 ? 'w-[440px]' : 'w-[400px]'}`}>
          <div
            className="grid border border-black bg-black gap-[1px]"
            style={{
              gridTemplateColumns: `repeat(${puzzle.cols}, 1fr)`,
            }}
          >
            {puzzle.grid.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`${puzzle.cols >= 20 ? 'w-5 h-5' : 'w-6 h-6'} relative flex items-center justify-center ${
                    cell.isBlack ? 'bg-black' : 'bg-white'
                  }`}
                >
                  {cell.number !== null && (
                    <span className={`absolute top-0 right-0.5 ${puzzle.cols >= 20 ? 'text-[6px]' : 'text-[8px]'} font-bold font-mono leading-none`}>
                      {cell.number}
                    </span>
                  )}
                  {cell.hasArrowLeft && (
                    <span className={`absolute top-0 left-0.5 ${puzzle.cols >= 20 ? 'text-[5px]' : 'text-[7px]'} leading-none`}>
                      ◀
                    </span>
                  )}
                  {cell.hasArrowDown && !cell.hasArrowLeft && (
                    <span className={`absolute top-0 left-0.5 ${puzzle.cols >= 20 ? 'text-[5px]' : 'text-[7px]'} leading-none`}>
                      ▼
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Clues Column */}
        <div className="flex-1 grid grid-cols-2 gap-4 text-xs">
          {/* Across */}
          <div>
            <h3 className="font-bold border-b border-black pb-1 mb-1.5 text-sm">
              أفقي (يمين إلى يسار)
            </h3>
            <ol className="space-y-1">
              {puzzle.clues.across.map((clue) => (
                <li key={clue.id} className="leading-tight">
                  <span className="font-bold">{clue.num}. </span>
                  <span>{clue.clue} </span>
                  <span className="text-[10px]">({clue.length} حروف)</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Down */}
          <div>
            <h3 className="font-bold border-b border-black pb-1 mb-1.5 text-sm">
              عمودي (أعلى إلى أسفل)
            </h3>
            <ol className="space-y-1">
              {puzzle.clues.down.map((clue) => (
                <li key={clue.id} className="leading-tight">
                  <span className="font-bold">{clue.num}. </span>
                  <span>{clue.clue} </span>
                  <span className="text-[10px]">({clue.length} حروف)</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-2 border-t border-black text-center text-[10px] text-gray-700">
        تم إعداد هذه الشبكة عبر تطبيق شبكة أبو سلمى للكلمات المتقاطعة © جميع الحقوق محفوظة
      </div>
    </div>
  );
};
