/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Masthead & Controls Component for Abu Salma Crossword.
 * Newspaper header, puzzle selector, timer, and gameplay controls.
 */

import React from 'react';
import { Volume2, VolumeX, Printer, RotateCcw, ZoomIn, ZoomOut, Trophy, CheckCheck, Cloud } from 'lucide-react';
import { User } from 'firebase/auth';
import { PUZZLES, PuzzleDefinition } from '../data/puzzles';
import { TOTAL_MOROCCAN_NETWORKS } from '../data/moroccanPuzzles';
import { TOTAL_SCIENCE_NETWORKS } from '../data/sciencePuzzles';

interface HeaderMastheadProps {
  currentPuzzle: PuzzleDefinition;
  onSelectPuzzle: (puzzle: PuzzleDefinition) => void;
  timerSeconds: number;
  isPaused: boolean;
  onTogglePause: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetGrid: () => void;
  onSolveAll: () => void;
  onPrint: () => void;
  filledCount: number;
  totalLetters: number;
  solvedWordsCount: number;
  totalWordsCount: number;
  currentUser?: User | null;
  onOpenCloudSync?: () => void;
  isCloudSyncing?: boolean;
  currentNetworkNumber?: number | null;
  onPrevNetwork?: () => void;
  onNextNetwork?: () => void;
  onSelectNetworkNumber?: (num: number) => void;
  activeMode?: 'moroccan' | 'science' | 'special';
  onSwitchMode?: (mode: 'moroccan' | 'science') => void;
  onOpenAchievements?: () => void;
  unlockedBadgesCount?: number;
  totalSolvedPuzzlesCount?: number;
}

export const HeaderMasthead: React.FC<HeaderMastheadProps> = ({
  currentPuzzle,
  onSelectPuzzle,
  timerSeconds,
  isPaused,
  onTogglePause,
  isMuted,
  onToggleMute,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetGrid,
  onSolveAll,
  onPrint,
  filledCount,
  totalLetters,
  solvedWordsCount,
  totalWordsCount,
  currentUser,
  onOpenCloudSync,
  isCloudSyncing,
  currentNetworkNumber,
  onPrevNetwork,
  onNextNetwork,
  onSelectNetworkNumber,
  activeMode = 'moroccan',
  onSwitchMode,
  onOpenAchievements,
  unlockedBadgesCount = 0,
  totalSolvedPuzzlesCount = 0,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const completionPercent = Math.round((filledCount / totalLetters) * 100) || 0;
  const totalInCurrentMode = activeMode === 'science' ? TOTAL_SCIENCE_NETWORKS : TOTAL_MOROCCAN_NETWORKS;

  return (
    <header className="w-full bg-[#FAF7F0] border-b-2 border-[#262118] px-3 sm:px-6 py-2.5 sm:py-3 no-print">
      <div className="max-w-6xl mx-auto flex flex-col gap-2.5">
        
        {/* Category Mode Switcher: 🇲🇦 شبكات مغربية vs 🔬 شبكات علمية */}
        {onSwitchMode && (
          <div className="flex items-center justify-between border-b border-[#DDD3C2] pb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#574B3A]">تصنيف الألغاز:</span>
              <div className="flex items-center gap-1 bg-[#EDE5D5] p-1 rounded-lg border border-[#D5C9B5]">
                <button
                  onClick={() => onSwitchMode('moroccan')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeMode === 'moroccan'
                      ? 'bg-[#2E6B34] text-white shadow-xs'
                      : 'text-[#443828] hover:bg-white/70'
                  }`}
                >
                  <span>🇲🇦 شبكات مغربية</span>
                  <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-full font-mono">100</span>
                </button>
                <button
                  onClick={() => onSwitchMode('science')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeMode === 'science'
                      ? 'bg-[#1E568C] text-white shadow-xs'
                      : 'text-[#443828] hover:bg-white/70'
                  }`}
                >
                  <span>🔬 شبكات علمية</span>
                  <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-full font-mono">50</span>
                </button>
              </div>
            </div>

            <div className="text-xs text-[#7D6E59] font-amiri hidden md:block">
              {activeMode === 'moroccan'
                ? 'مدن، أكلات، عادات، جغرافيا وتاريخ المغرب'
                : 'فيزياء، كيمياء، أحياء، فلك، رياضيات وطب'}
            </div>
          </div>
        )}

        {/* Top Masthead Line */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-[#DDD3C2] pb-2.5 gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-kufi font-black text-2xl sm:text-3xl text-[#241F17] tracking-tight">
                {activeMode === 'science' ? 'شبكة أبو سلمى العلمية' : 'شبكة أبو سلمى المغربية'}
              </span>
              <span className="text-[#877864] hidden sm:inline">|</span>
              <span className="text-xs sm:text-sm font-amiri font-bold text-[#635541]">
                {activeMode === 'science' ? '50 شبكة علمية شيقة' : '100 شبكة كلمات متقاطعة أصيلة'}
              </span>
            </div>
            <p className="text-xs text-[#7D6E59] font-amiri mt-0.5">
              {currentPuzzle.date} · {currentPuzzle.subtitle}
            </p>
          </div>

          {/* Networks Selector & Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Prev / Next navigation */}
            {onPrevNetwork && onNextNetwork && currentNetworkNumber !== null && currentNetworkNumber !== undefined && (
              <div className="flex items-center bg-[#EDE5D5] rounded-lg border border-[#C5B7A0] p-0.5 shadow-xs">
                <button
                  onClick={onPrevNetwork}
                  disabled={currentNetworkNumber <= 1}
                  className="px-2 py-1 rounded text-xs font-bold text-[#3B3224] hover:bg-white disabled:opacity-35 cursor-pointer transition-colors"
                  title="الشبكة السابقة"
                >
                  ◀ السابق
                </button>
                <span className="px-2 text-xs font-bold text-[#2A2317] font-mono border-x border-[#D5C9B5]">
                  الشبكة {currentNetworkNumber} من {totalInCurrentMode}
                </span>
                <button
                  onClick={onNextNetwork}
                  disabled={currentNetworkNumber >= totalInCurrentMode}
                  className="px-2 py-1 rounded text-xs font-bold text-[#3B3224] hover:bg-white disabled:opacity-35 cursor-pointer transition-colors"
                  title="الشبكة التالية"
                >
                  التالي ▶
                </button>
              </div>
            )}

            {/* Dropdown selector */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="puzzle-picker" className="text-xs font-bold text-[#574B3A] shrink-0">
                انتقل إلى:
              </label>
              <select
                id="puzzle-picker"
                value={currentPuzzle.id}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith('moroccan-network-') || val.startsWith('science-network-')) {
                    const num = parseInt(val.replace(/^(moroccan|science)-network-/, ''), 10);
                    if (onSelectNetworkNumber) onSelectNetworkNumber(num);
                  } else {
                    const found = PUZZLES.find((p) => p.id === val);
                    if (found) onSelectPuzzle(found);
                  }
                }}
                className="text-xs font-bold bg-[#EFE8DA] border border-[#C5B7A0] text-[#292218] rounded-md px-2.5 py-1.5 outline-none cursor-pointer hover:bg-[#E5DCCB] transition-colors"
              >
                {activeMode === 'science' ? (
                  <optgroup label="🔬 50 شبكة علمية (فيزياء، كيمياء، أحياء، فلك)">
                    {Array.from({ length: TOTAL_SCIENCE_NETWORKS }, (_, i) => i + 1).map((n) => (
                      <option key={`science-network-${n}`} value={`science-network-${n}`}>
                        الشبكة العلمية {n} من 50
                      </option>
                    ))}
                  </optgroup>
                ) : (
                  <optgroup label="🇲🇦 100 شبكة مغربية أصيلة">
                    {Array.from({ length: TOTAL_MOROCCAN_NETWORKS }, (_, i) => i + 1).map((n) => (
                      <option key={`moroccan-network-${n}`} value={`moroccan-network-${n}`}>
                        الشبكة المغربية {n} من 100
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="⭐ الشبكات الخاصة والكبرى">
                  {PUZZLES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.difficulty})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>
        </div>

        {/* Action Controls & HUD */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
          {/* Progress & Stats */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#4F4332]">
            {/* Timer */}
            <div className="flex items-center gap-1.5 bg-[#EDE5D5] px-2.5 py-1 rounded-md border border-[#D5C9B5]">
              <button
                onClick={onTogglePause}
                className="font-mono font-bold text-sm text-[#2B2317] hover:text-[#7A5B18] transition-colors cursor-pointer"
                title={isPaused ? 'استئناف' : 'إيقاف مؤقت'}
              >
                ⏱ {formatTime(timerSeconds)}
              </button>
              {isPaused && (
                <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-1 rounded">
                  متوقف
                </span>
              )}
            </div>

            {/* Word count */}
            <div className="flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-[#8A671A]" />
              <span className="font-semibold">{solvedWordsCount}</span>
              <span className="text-[#7A6A55]">/ {totalWordsCount} كلمة</span>
            </div>

            {/* Letter percentage */}
            <div className="flex items-center gap-1.5">
              <div className="w-16 sm:w-24 bg-[#E0D5C3] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#3A7540] h-full transition-all duration-300"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <span className="font-mono text-xs font-bold text-[#3B3122]">
                {completionPercent}%
              </span>
            </div>
          </div>

          {/* Functional Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Zoom Controls */}
            <div className="flex items-center bg-[#EDE5D5] rounded-md border border-[#D5C9B5] p-0.5">
              <button
                onClick={onZoomOut}
                disabled={zoomLevel <= 0.8}
                className="p-1 hover:bg-white rounded text-[#4B3E2C] disabled:opacity-40 cursor-pointer transition-colors"
                title="تصغير الشبكة"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono px-1 text-[#665743]">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={onZoomIn}
                disabled={zoomLevel >= 1.3}
                className="p-1 hover:bg-white rounded text-[#4B3E2C] disabled:opacity-40 cursor-pointer transition-colors"
                title="تكبير الشبكة"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={onToggleMute}
              className={`p-1.5 rounded-md border text-xs font-medium cursor-pointer transition-colors ${
                isMuted
                  ? 'bg-[#E5DCCA] border-[#C8BBA5] text-[#7A6C58]'
                  : 'bg-white border-[#C8BBA5] text-[#362D20] hover:bg-[#F3ECE0]'
              }`}
              title={isMuted ? 'تشغيل المؤثرات الصوتية' : 'كتم الصوت'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Achievements & Badges Button */}
            {onOpenAchievements && (
              <button
                onClick={onOpenAchievements}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#FFF8E7] hover:bg-[#FCEFD0] border border-[#CFA74E] text-[#785311] text-xs font-bold cursor-pointer transition-colors shadow-xs"
                title="عرض سجل الإنجازات، الأوسمة، والسرعة"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">الإنجازات</span>
                <span className="text-[10px] font-mono bg-amber-200/90 text-amber-900 px-1.5 py-0.2 rounded-full font-bold">
                  {unlockedBadgesCount} 🏅
                </span>
              </button>
            )}

            {/* Cloud Sync Button */}
            {onOpenCloudSync && (
              <button
                onClick={onOpenCloudSync}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-xs font-bold cursor-pointer transition-colors shadow-xs ${
                  currentUser
                    ? 'bg-[#EBF7EE] hover:bg-[#DCF2E1] border-[#489456] text-[#2E7D32]'
                    : 'bg-[#FFF9EC] hover:bg-[#FDF3DE] border-[#D4A328] text-[#805B17]'
                }`}
                title={currentUser ? `مزامنة سحابية نشطة (${currentUser.displayName || currentUser.email})` : 'تفعيل المزامنة السحابية عبر الأجهزة'}
              >
                <Cloud className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-pulse text-amber-500' : ''}`} />
                <span className="hidden sm:inline">
                  {currentUser ? 'متزامن سحابياً' : 'مزامنة عبر الأجهزة'}
                </span>
                {currentUser && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] animate-pulse" />
                )}
              </button>
            )}

            {/* Print button */}
            <button
              onClick={onPrint}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white hover:bg-[#F3ECE0] text-[#362D20] border border-[#C8BBA5] text-xs font-medium cursor-pointer transition-colors"
              title="طباعة الشبكة للعب بالقلم الورقي"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">طباعة</span>
            </button>

            {/* Reset button */}
            <button
              onClick={onResetGrid}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white hover:bg-[#FEE2E2] text-[#842029] border border-[#E2C3C5] text-xs font-medium cursor-pointer transition-colors"
              title="إعادة تعيين ومسح الخانات"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">مسح</span>
            </button>

            {/* Solve all button */}
            <button
              onClick={onSolveAll}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#383125] hover:bg-[#262017] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
              title="حل الشبكة بالكامل"
            >
              <CheckCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>حل الكل</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
