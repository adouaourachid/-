/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Clues List Component for Abu Salma Crossword.
 * Organizes Across and Down clues into authentic newspaper columns with status indicators.
 */

import React, { useState } from 'react';
import { ClueItem } from '../data/puzzles';
import { CheckCircle2, Search, ArrowLeft, ArrowDown } from 'lucide-react';

interface CluesPanelProps {
  acrossClues: ClueItem[];
  downClues: ClueItem[];
  activeClueId: string | null;
  completedClueIds: Set<string>;
  onSelectClue: (clue: ClueItem) => void;
}

export const CluesPanel: React.FC<CluesPanelProps> = ({
  acrossClues,
  downClues,
  activeClueId,
  completedClueIds,
  onSelectClue,
}) => {
  const [activeTab, setActiveTab] = useState<'both' | 'across' | 'down'>('both');
  const [searchQuery, setSearchQuery] = useState('');

  const filterClues = (list: ClueItem[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.trim().toLowerCase();
    return list.filter(
      (c) =>
        c.clue.toLowerCase().includes(q) ||
        (c.category && c.category.toLowerCase().includes(q)) ||
        (c.num && c.num.toString().includes(q))
    );
  };

  const filteredAcross = filterClues(acrossClues);
  const filteredDown = filterClues(downClues);

  const renderClueItem = (clue: ClueItem) => {
    const isActive = activeClueId === clue.id;
    const isCompleted = completedClueIds.has(clue.id);

    return (
      <div
        key={clue.id}
        onClick={() => onSelectClue(clue)}
        className={`group p-2 sm:p-2.5 rounded-lg border transition-all cursor-pointer select-none text-right ${
          isActive
            ? 'bg-[#EBE2D0] border-[#3F3627] shadow-sm'
            : isCompleted
            ? 'bg-[#F2EFE8]/70 border-[#E0D7C6] opacity-75 hover:opacity-100 hover:bg-[#EBE2D0]/50'
            : 'bg-white border-[#E8DEC9] hover:border-[#C4B79F] hover:bg-[#FAF7F0]'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 shrink-0">
            {clue.num && (
              <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${
                isActive ? 'bg-[#3F3627] text-white' : 'bg-[#E8DDC8] text-[#473D2C]'
              }`}>
                {clue.num}
              </span>
            )}
            <span className="text-[11px] font-medium text-[#7D705C]">
              ({clue.length} حروف)
            </span>
          </div>

          <div className="flex items-center gap-1">
            {clue.category && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EDE3CE] text-[#695B47] font-medium">
                {clue.category}
              </span>
            )}
            {isCompleted && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            )}
          </div>
        </div>

        <p className={`mt-1 text-sm font-amiri leading-relaxed ${
          isCompleted ? 'line-through text-[#635948]' : 'text-[#231F18] font-bold'
        }`}>
          {clue.clue}
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF7F0] border border-[#DDD3C0] rounded-xl overflow-hidden shadow-sm">
      {/* Header & Tabs */}
      <div className="p-3 bg-[#EFE9DC] border-b border-[#DDD3C0]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-[#2A241A] text-sm flex items-center gap-1.5">
            <span>قائمة الأسئلة والتعاريف</span>
            <span className="text-xs font-normal text-[#756854]">
              ({completedClueIds.size}/{acrossClues.length + downClues.length} مكتملة)
            </span>
          </h3>

          <div className="flex items-center bg-[#DDD1BE] p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab('both')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'both' ? 'bg-white text-[#2B2317] shadow-xs' : 'text-[#615442] hover:text-[#2B2317]'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setActiveTab('across')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'across' ? 'bg-white text-[#2B2317] shadow-xs' : 'text-[#615442] hover:text-[#2B2317]'
              }`}
            >
              أفقي
            </button>
            <button
              onClick={() => setActiveTab('down')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'down' ? 'bg-white text-[#2B2317] shadow-xs' : 'text-[#615442] hover:text-[#2B2317]'
              }`}
            >
              عمودي
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#857662]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في الأسئلة أو التصنيفات..."
            className="w-full pl-3 pr-8 py-1 text-xs rounded-md bg-white border border-[#D5C9B4] text-[#2C251B] placeholder-[#9E907B] outline-none focus:border-[#4B3F2D] transition-colors"
          />
        </div>
      </div>

      {/* Clues Columns */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {(activeTab === 'both' || activeTab === 'across') && (
          <div>
            <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-[#E0D5C1] text-xs font-bold text-[#3B3224]">
              <ArrowLeft className="w-3.5 h-3.5 text-[#3B3224]" />
              <span>الأسئلة الأفقية (من اليمين إلى اليسار)</span>
              <span className="text-[11px] font-normal text-[#7A6C58]">
                ({filteredAcross.length})
              </span>
            </div>
            <div className="space-y-1.5">
              {filteredAcross.map(renderClueItem)}
              {filteredAcross.length === 0 && (
                <div className="text-center py-4 text-xs text-[#8A7D69]">
                  لا توجد أسئلة مطابقة للبحث
                </div>
              )}
            </div>
          </div>
        )}

        {(activeTab === 'both' || activeTab === 'down') && (
          <div>
            <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-[#E0D5C1] text-xs font-bold text-[#3B3224]">
              <ArrowDown className="w-3.5 h-3.5 text-[#3B3224]" />
              <span>الأسئلة العمودية (من الأعلى إلى الأسفل)</span>
              <span className="text-[11px] font-normal text-[#7A6C58]">
                ({filteredDown.length})
              </span>
            </div>
            <div className="space-y-1.5">
              {filteredDown.map(renderClueItem)}
              {filteredDown.length === 0 && (
                <div className="text-center py-4 text-xs text-[#8A7D69]">
                  لا توجد أسئلة مطابقة للبحث
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
