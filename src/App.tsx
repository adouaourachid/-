/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Main Application Component for Abu Salma Crossword (شبكة أبو سلمى للكلمات المتقاطعة).
 * Full-featured classic Arabic newspaper crossword puzzle with authentic clues,
 * smart auto-advance, sound effects, virtual Arabic keyboard, and AI helper.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PUZZLES, PuzzleDefinition, ClueItem } from './data/puzzles';
import { getMoroccanNetwork, TOTAL_MOROCCAN_NETWORKS } from './data/moroccanPuzzles';
import { getScientificNetwork, TOTAL_SCIENCE_NETWORKS } from './data/sciencePuzzles';
import { HeaderMasthead } from './components/HeaderMasthead';
import { CrosswordGrid } from './components/CrosswordGrid';
import { CluesPanel } from './components/CluesPanel';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { AIHintModal } from './components/AIHintModal';
import { VictoryModal } from './components/VictoryModal';
import { PrintSheet } from './components/PrintSheet';
import { CloudSyncModal } from './components/CloudSyncModal';
import { AchievementsModal } from './components/AchievementsModal';
import { VisitorCounter } from './components/VisitorCounter';
import { HintAdModal } from './components/HintAdModal';
import { UserAchievementStats, BadgeDefinition } from './types/achievements';
import { loadLocalAchievements, saveLocalAchievements, recordPuzzleSolved } from './utils/achievements';
import { User } from 'firebase/auth';
import {
  loginWithGoogle,
  logoutUser,
  onUserAuthStateChanged,
  savePuzzleProgressToFirestore,
  loadPuzzleProgressFromFirestore,
  subscribeToPuzzleProgress,
  saveUserAchievementsToFirestore,
  loadUserAchievementsFromFirestore,
} from './services/firebase';
import {
  playPencilSound,
  playTypewriterClick,
  playWordSuccessSound,
  playRevealSound,
  playVictoryFanfare,
  setMuted,
  isMuted as getAudioMuted,
} from './utils/audio';
import confetti from 'canvas-confetti';

function normArabic(ch: string): string {
  if (!ch) return '';
  return ch
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .trim();
}

const defaultInitialPuzzle = getMoroccanNetwork(1);

export default function App() {
  // Current active puzzle (Default: شبكة 1 من 100 شبكة مغربية)
  const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleDefinition>(defaultInitialPuzzle);

  // Active collection mode: 'moroccan' (100 puzzles) or 'science' (50 puzzles)
  const [activeCategoryMode, setActiveCategoryMode] = useState<'moroccan' | 'science'>('moroccan');

  // User input grid: matrix of strings [row][col]
  const [userGrid, setUserGrid] = useState<string[][]>(() => {
    return Array.from({ length: defaultInitialPuzzle.rows }, () =>
      Array(defaultInitialPuzzle.cols).fill('')
    );
  });

  // Navigation & Selection
  const [selectedRow, setSelectedRow] = useState<number | null>(0);
  const [selectedCol, setSelectedCol] = useState<number | null>(0);
  const [direction, setDirection] = useState<'across' | 'down'>('across');

  // Status maps
  const [validationMap, setValidationMap] = useState<
    Record<string, { status: 'neutral' | 'correct' | 'incorrect' | 'revealed' }>
  >({});
  const [completedClueIds, setCompletedClueIds] = useState<Set<string>>(new Set());

  // Controls & Modals
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMutedState, setIsMutedState] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [isVirtualKeyboardOpen, setIsVirtualKeyboardOpen] = useState(true);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [isHintAdModalOpen, setIsHintAdModalOpen] = useState(false);
  const [hintsUsedCount, setHintsUsedCount] = useState(0);

  // Cloud Sync state (Firebase Firestore & Auth)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Achievements & Badges state
  const [achievementStats, setAchievementStats] = useState<UserAchievementStats>(loadLocalAchievements);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [latestUnlockedBadges, setLatestUnlockedBadges] = useState<BadgeDefinition[]>([]);

  // Subscribe to Firebase Auth and load achievements
  useEffect(() => {
    const unsubscribe = onUserAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        loadUserAchievementsFromFirestore(user.uid).then((cloudStats) => {
          if (cloudStats) {
            setAchievementStats((prev) => {
              if (cloudStats.totalSolved >= prev.totalSolved) {
                const merged: UserAchievementStats = {
                  ...prev,
                  ...cloudStats,
                  solvedPuzzles: {
                    ...prev.solvedPuzzles,
                    ...cloudStats.solvedPuzzles,
                  },
                  unlockedBadgeIds: Array.from(
                    new Set([...prev.unlockedBadgeIds, ...cloudStats.unlockedBadgeIds])
                  ),
                  lastUpdated: new Date().toISOString(),
                };
                saveLocalAchievements(merged);
                return merged;
              } else {
                saveUserAchievementsToFirestore(user.uid, prev);
                return prev;
              }
            });
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Initialize or load puzzle state from localStorage and cloud
  const initPuzzle = useCallback((puzzle: PuzzleDefinition) => {
    setCurrentPuzzle(puzzle);
    const saved = localStorage.getItem(`abu_salma_grid_${puzzle.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserGrid(parsed);
      } catch {
        setUserGrid(Array.from({ length: puzzle.rows }, () => Array(puzzle.cols).fill('')));
      }
    } else {
      setUserGrid(Array.from({ length: puzzle.rows }, () => Array(puzzle.cols).fill('')));
    }

    // Find the first white cell
    let firstR = 0,
      firstC = 0;
    outer: for (let r = 0; r < puzzle.rows; r++) {
      for (let c = 0; c < puzzle.cols; c++) {
        if (!puzzle.grid[r][c].isBlack) {
          firstR = r;
          firstC = c;
        }
      }
    }
    setSelectedRow(firstR);
    setSelectedCol(firstC);
    setDirection('across');
    setValidationMap({});
    setCompletedClueIds(new Set());
    setTimerSeconds(0);
    setIsPaused(false);
    setIsVictoryModalOpen(false);
  }, []);

  // Load from Firebase Firestore when user or puzzle changes
  useEffect(() => {
    if (!currentUser || !currentPuzzle) return;
    let isSubscribed = true;

    async function loadCloudState() {
      setIsCloudSyncing(true);
      try {
        const cloudData = await loadPuzzleProgressFromFirestore(currentUser!.uid, currentPuzzle.id);
        if (cloudData && cloudData.grid && cloudData.grid.length === currentPuzzle.rows && isSubscribed) {
          setUserGrid(cloudData.grid);
          if (cloudData.timerSeconds) setTimerSeconds(cloudData.timerSeconds);
          if (cloudData.hintsUsedCount) setHintsUsedCount(cloudData.hintsUsedCount);
          if (cloudData.isCompleted) setIsVictoryModalOpen(true);
          setLastSyncedAt(new Date());
        }
      } catch (err) {
        console.warn('Could not load progress from Firestore:', err);
      } finally {
        if (isSubscribed) setIsCloudSyncing(false);
      }
    }

    loadCloudState();

    // Real-time listener for live cross-device synchronization
    const unsubscribe = subscribeToPuzzleProgress(currentUser.uid, currentPuzzle.id, (data) => {
      if (data && data.grid && data.grid.length === currentPuzzle.rows) {
        setUserGrid((prevGrid) => {
          if (JSON.stringify(prevGrid) !== JSON.stringify(data.grid)) {
            return data.grid;
          }
          return prevGrid;
        });
        if (data.isCompleted) setIsVictoryModalOpen(true);
        setLastSyncedAt(new Date());
      }
    });

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [currentUser, currentPuzzle]);

  // Save progress automatically to Local Storage (Always active)
  useEffect(() => {
    if (currentPuzzle && userGrid.length > 0) {
      localStorage.setItem(`abu_salma_grid_${currentPuzzle.id}`, JSON.stringify(userGrid));
    }
  }, [userGrid, currentPuzzle]);

  // Auto-sync progress to Firebase Firestore (when user is signed in)
  useEffect(() => {
    if (!currentUser || !currentPuzzle || userGrid.length === 0) return;

    const timer = setTimeout(async () => {
      setIsCloudSyncing(true);
      try {
        await savePuzzleProgressToFirestore(currentUser.uid, currentPuzzle.id, {
          grid: userGrid,
          timerSeconds,
          hintsUsedCount,
          isCompleted: isVictoryModalOpen,
        });
        setLastSyncedAt(new Date());
      } catch (err) {
        console.warn('Failed auto-sync to Firestore:', err);
      } finally {
        setIsCloudSyncing(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [userGrid, currentUser, currentPuzzle, timerSeconds, hintsUsedCount, isVictoryModalOpen]);

  // Timer tick
  useEffect(() => {
    if (isPaused || isVictoryModalOpen) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, isVictoryModalOpen]);

  // Identify active clue based on selection & direction
  const activeClue = useMemo<ClueItem | null>(() => {
    if (selectedRow === null || selectedCol === null) return null;
    const cell = currentPuzzle.grid[selectedRow]?.[selectedCol];
    if (!cell || cell.isBlack) return null;

    if (direction === 'across') {
      if (cell.acrossClueId) {
        return currentPuzzle.clues.across.find((c) => c.id === cell.acrossClueId) || null;
      }
      if (cell.downClueId) {
        return currentPuzzle.clues.down.find((c) => c.id === cell.downClueId) || null;
      }
    } else {
      if (cell.downClueId) {
        return currentPuzzle.clues.down.find((c) => c.id === cell.downClueId) || null;
      }
      if (cell.acrossClueId) {
        return currentPuzzle.clues.across.find((c) => c.id === cell.acrossClueId) || null;
      }
    }
    return null;
  }, [currentPuzzle, selectedRow, selectedCol, direction]);

  // Set of all coordinates in the active word for visual highlighting
  const activeWordCells = useMemo<Set<string>>(() => {
    const set = new Set<string>();
    if (!activeClue) return set;

    for (let i = 0; i < activeClue.length; i++) {
      const r = activeClue.dir === 'across' ? activeClue.row : activeClue.row + i;
      const c = activeClue.dir === 'across' ? activeClue.col + i : activeClue.col;
      set.add(`${r},${c}`);
    }
    return set;
  }, [activeClue]);

  // Check if a specific clue's word is fully and correctly answered
  const verifyClue = useCallback(
    (clue: ClueItem, currentGridState: string[][]) => {
      let isFull = true;
      let isCorrect = true;

      for (let i = 0; i < clue.length; i++) {
        const r = clue.dir === 'across' ? clue.row : clue.row + i;
        const c = clue.dir === 'across' ? clue.col + i : clue.col;
        const userChar = currentGridState[r]?.[c] || '';
        const solChar = clue.answer[i];

        if (!userChar) {
          isFull = false;
        } else if (normArabic(userChar) !== normArabic(solChar)) {
          isCorrect = false;
        }
      }

      return { isFull, isCorrect };
    },
    []
  );

  // Check entire puzzle for victory
  const checkPuzzleCompletion = useCallback(
    (currentGridState: string[][]) => {
      for (let r = 0; r < currentPuzzle.rows; r++) {
        for (let c = 0; c < currentPuzzle.cols; c++) {
          const cell = currentPuzzle.grid[r][c];
          if (!cell.isBlack) {
            const userChar = currentGridState[r]?.[c] || '';
            if (!userChar || normArabic(userChar) !== normArabic(cell.solution)) {
              return false;
            }
          }
        }
      }
      return true;
    },
    [currentPuzzle]
  );

  // Handle cell click
  const handleCellClick = (r: number, c: number) => {
    const cell = currentPuzzle.grid[r]?.[c];
    if (!cell || cell.isBlack) return;

    if (selectedRow === r && selectedCol === c) {
      // Clicking same cell toggles direction!
      const newDir = direction === 'across' ? 'down' : 'across';
      setDirection(newDir);
      playTypewriterClick();
    } else {
      setSelectedRow(r);
      setSelectedCol(c);
      playPencilSound();

      // If current direction has no clue here, switch direction automatically
      if (direction === 'across' && !cell.acrossClueId && cell.downClueId) {
        setDirection('down');
      } else if (direction === 'down' && !cell.downClueId && cell.acrossClueId) {
        setDirection('across');
      }
    }
  };

  // Move forward in current word
  const moveNextInWord = useCallback(() => {
    if (selectedRow === null || selectedCol === null || !activeClue) return;

    let nextR = selectedRow;
    let nextC = selectedCol;

    if (direction === 'across') {
      nextC += 1;
    } else {
      nextR += 1;
    }

    // Ensure within active clue bounds
    const isWithinClue =
      direction === 'across'
        ? nextR === activeClue.row && nextC < activeClue.col + activeClue.length
        : nextC === activeClue.col && nextR < activeClue.row + activeClue.length;

    if (isWithinClue && !currentPuzzle.grid[nextR]?.[nextC]?.isBlack) {
      setSelectedRow(nextR);
      setSelectedCol(nextC);
    }
  }, [selectedRow, selectedCol, activeClue, direction, currentPuzzle]);

  // Move backward in current word
  const movePrevInWord = useCallback(() => {
    if (selectedRow === null || selectedCol === null || !activeClue) return;

    let prevR = selectedRow;
    let prevC = selectedCol;

    if (direction === 'across') {
      prevC -= 1;
    } else {
      prevR -= 1;
    }

    const isWithinClue =
      direction === 'across'
        ? prevR === activeClue.row && prevC >= activeClue.col
        : prevC === activeClue.col && prevR >= activeClue.row;

    if (isWithinClue && !currentPuzzle.grid[prevR]?.[prevC]?.isBlack) {
      setSelectedRow(prevR);
      setSelectedCol(prevC);
    }
  }, [selectedRow, selectedCol, activeClue, direction, currentPuzzle]);

  // Record completed puzzle in achievements history & unlock check
  const registerPuzzleCompletion = useCallback(
    (timeSpent: number, hintsUsed: number) => {
      let category: 'moroccan' | 'science' | 'special' = 'special';
      if (currentPuzzle.id.startsWith('moroccan-network-')) category = 'moroccan';
      else if (currentPuzzle.id.startsWith('science-network-')) category = 'science';

      setAchievementStats((prev) => {
        const { updatedStats, newlyUnlockedBadges } = recordPuzzleSolved(prev, {
          puzzleId: currentPuzzle.id,
          title: currentPuzzle.title,
          category,
          timeSpentSeconds: timeSpent,
          hintsUsedCount: hintsUsed,
        });

        if (newlyUnlockedBadges.length > 0) {
          setLatestUnlockedBadges(newlyUnlockedBadges);
        }

        if (currentUser) {
          saveUserAchievementsToFirestore(currentUser.uid, updatedStats).catch((err) => {
            console.warn('Could not save achievements to Firestore', err);
          });
        }

        return updatedStats;
      });
    },
    [currentPuzzle, currentUser]
  );

  // Enter a character into the selected cell
  const handleCharInput = useCallback(
    (rawChar: string) => {
      if (selectedRow === null || selectedCol === null) return;
      const char = rawChar.trim();
      if (!char) return;

      playPencilSound();

      const newGrid = userGrid.map((row) => [...row]);
      newGrid[selectedRow][selectedCol] = char;
      setUserGrid(newGrid);

      // Clear any negative validation state on this cell
      const cellKey = `${selectedRow},${selectedCol}`;
      setValidationMap((prev) => {
        const next = { ...prev };
        if (next[cellKey]?.status === 'incorrect') {
          delete next[cellKey];
        }
        return next;
      });

      // Check if current active clue is completed
      if (activeClue) {
        const check = verifyClue(activeClue, newGrid);
        if (check.isFull && check.isCorrect) {
          setCompletedClueIds((prev) => new Set([...prev, activeClue.id]));
          playWordSuccessSound();

          // Mark word cells as correct
          setValidationMap((prev) => {
            const next = { ...prev };
            for (let i = 0; i < activeClue.length; i++) {
              const r = activeClue.dir === 'across' ? activeClue.row : activeClue.row + i;
              const c = activeClue.dir === 'across' ? activeClue.col + i : activeClue.col;
              next[`${r},${c}`] = { status: 'correct' };
            }
            return next;
          });
        }
      }

      // Check full puzzle victory
      if (checkPuzzleCompletion(newGrid)) {
        registerPuzzleCompletion(timerSeconds, hintsUsedCount);
        playVictoryFanfare();
        try {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 },
          });
        } catch {}
        setIsVictoryModalOpen(true);
      } else {
        // Auto-advance
        moveNextInWord();
      }
    },
    [selectedRow, selectedCol, userGrid, activeClue, verifyClue, checkPuzzleCompletion, moveNextInWord, registerPuzzleCompletion, timerSeconds, hintsUsedCount]
  );

  // Handle Backspace
  const handleBackspace = useCallback(() => {
    if (selectedRow === null || selectedCol === null) return;

    const currentVal = userGrid[selectedRow]?.[selectedCol] || '';
    if (currentVal) {
      // Clear current cell
      const newGrid = userGrid.map((row) => [...row]);
      newGrid[selectedRow][selectedCol] = '';
      setUserGrid(newGrid);

      const cellKey = `${selectedRow},${selectedCol}`;
      setValidationMap((prev) => {
        const next = { ...prev };
        delete next[cellKey];
        return next;
      });
      playPencilSound();
    } else {
      // Move to previous cell and clear it
      movePrevInWord();
      if (direction === 'across') {
        const prevC = selectedCol - 1;
        if (activeClue && prevC >= activeClue.col) {
          const newGrid = userGrid.map((row) => [...row]);
          newGrid[selectedRow][prevC] = '';
          setUserGrid(newGrid);
        }
      } else {
        const prevR = selectedRow - 1;
        if (activeClue && prevR >= activeClue.row) {
          const newGrid = userGrid.map((row) => [...row]);
          newGrid[prevR][selectedCol] = '';
          setUserGrid(newGrid);
        }
      }
      playPencilSound();
    }
  }, [selectedRow, selectedCol, userGrid, movePrevInWord, direction, activeClue]);

  // Physical Keyboard Handler
  const handleCellKeyDown = (e: React.KeyboardEvent, r: number, c: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      handleBackspace();
      return;
    }

    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      setDirection((prev) => (prev === 'across' ? 'down' : 'across'));
      playTypewriterClick();
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      // In RTL, ArrowRight moves rightwards (c - 1 in index)
      if (c > 0 && !currentPuzzle.grid[r][c - 1]?.isBlack) {
        setSelectedCol(c - 1);
      }
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      // In RTL, ArrowLeft moves leftwards (c + 1 in index)
      if (c < currentPuzzle.cols - 1 && !currentPuzzle.grid[r][c + 1]?.isBlack) {
        setSelectedCol(c + 1);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (r > 0 && !currentPuzzle.grid[r - 1][c]?.isBlack) {
        setSelectedRow(r - 1);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (r < currentPuzzle.rows - 1 && !currentPuzzle.grid[r + 1][c]?.isBlack) {
        setSelectedRow(r + 1);
      }
      return;
    }

    // Any Arabic or printable character
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      handleCharInput(e.key);
    }
  };

  // Jump to selected clue from CluesPanel
  const handleSelectClue = (clue: ClueItem) => {
    setDirection(clue.dir);

    // Find first empty cell in this word, or start of word
    let targetR = clue.row;
    let targetC = clue.col;

    for (let i = 0; i < clue.length; i++) {
      const curR = clue.dir === 'across' ? clue.row : clue.row + i;
      const curC = clue.dir === 'across' ? clue.col + i : clue.col;
      if (!userGrid[curR]?.[curC]) {
        targetR = curR;
        targetC = curC;
        break;
      }
    }

    setSelectedRow(targetR);
    setSelectedCol(targetC);
    playTypewriterClick();
  };

  // Next / Previous Clue navigation
  const allCluesList = useMemo(() => {
    return [...currentPuzzle.clues.across, ...currentPuzzle.clues.down];
  }, [currentPuzzle]);

  const handleNextClue = () => {
    if (!activeClue) return;
    const currentIndex = allCluesList.findIndex((c) => c.id === activeClue.id);
    const nextIndex = (currentIndex + 1) % allCluesList.length;
    handleSelectClue(allCluesList[nextIndex]);
  };

  const handlePrevClue = () => {
    if (!activeClue) return;
    const currentIndex = allCluesList.findIndex((c) => c.id === activeClue.id);
    const prevIndex = (currentIndex - 1 + allCluesList.length) % allCluesList.length;
    handleSelectClue(allCluesList[prevIndex]);
  };

  // Check current word
  const handleCheckWord = () => {
    if (!activeClue) return;

    let hasError = false;
    const newMap = { ...validationMap };

    for (let i = 0; i < activeClue.length; i++) {
      const r = activeClue.dir === 'across' ? activeClue.row : activeClue.row + i;
      const c = activeClue.dir === 'across' ? activeClue.col + i : activeClue.col;
      const cellKey = `${r},${c}`;
      const userVal = userGrid[r]?.[c] || '';
      const solVal = activeClue.answer[i];

      if (!userVal) continue;

      if (normArabic(userVal) === normArabic(solVal)) {
        newMap[cellKey] = { status: 'correct' };
      } else {
        newMap[cellKey] = { status: 'incorrect' };
        hasError = true;
      }
    }

    setValidationMap(newMap);

    if (!hasError) {
      setCompletedClueIds((prev) => new Set([...prev, activeClue.id]));
      playWordSuccessSound();
    } else {
      playPencilSound();
    }
  };

  // Reveal current cell letter
  const handleRevealLetter = () => {
    if (selectedRow === null || selectedCol === null) return;
    const cell = currentPuzzle.grid[selectedRow]?.[selectedCol];
    if (!cell || cell.isBlack) return;

    const solChar = cell.solution;
    const newGrid = userGrid.map((row) => [...row]);
    newGrid[selectedRow][selectedCol] = solChar;
    setUserGrid(newGrid);

    const cellKey = `${selectedRow},${selectedCol}`;
    setValidationMap((prev) => ({
      ...prev,
      [cellKey]: { status: 'revealed' },
    }));

    const newHints = hintsUsedCount + 1;
    setHintsUsedCount(newHints);
    playRevealSound();

    if (checkPuzzleCompletion(newGrid)) {
      registerPuzzleCompletion(timerSeconds, newHints);
      setIsVictoryModalOpen(true);
      playVictoryFanfare();
    } else {
      moveNextInWord();
    }
  };

  // Reveal entire active word
  const handleRevealWord = () => {
    if (!activeClue) return;

    const newGrid = userGrid.map((row) => [...row]);
    const newMap = { ...validationMap };

    for (let i = 0; i < activeClue.length; i++) {
      const r = activeClue.dir === 'across' ? activeClue.row : activeClue.row + i;
      const c = activeClue.dir === 'across' ? activeClue.col + i : activeClue.col;
      const cellKey = `${r},${c}`;
      newGrid[r][c] = activeClue.answer[i];
      newMap[cellKey] = { status: 'revealed' };
    }

    setUserGrid(newGrid);
    setValidationMap(newMap);
    setCompletedClueIds((prev) => new Set([...prev, activeClue.id]));
    const newHints = hintsUsedCount + activeClue.length;
    setHintsUsedCount(newHints);
    playRevealSound();

    if (checkPuzzleCompletion(newGrid)) {
      registerPuzzleCompletion(timerSeconds, newHints);
      setIsVictoryModalOpen(true);
      playVictoryFanfare();
    }
  };

  // Reveal first letter for AI modal
  const handleRevealFirstLetter = () => {
    if (!activeClue) return;
    const r = activeClue.row;
    const c = activeClue.col;

    const newGrid = userGrid.map((row) => [...row]);
    newGrid[r][c] = activeClue.answer[0];
    setUserGrid(newGrid);

    setValidationMap((prev) => ({
      ...prev,
      [`${r},${c}`]: { status: 'revealed' },
    }));
    setHintsUsedCount((prev) => prev + 1);
    playRevealSound();
  };

  // Reset grid
  const handleResetGrid = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في مسح جميع الخانات والبدء من جديد؟')) {
      const empty = Array.from({ length: currentPuzzle.rows }, () =>
        Array(currentPuzzle.cols).fill('')
      );
      setUserGrid(empty);
      setValidationMap({});
      setCompletedClueIds(new Set());
      setTimerSeconds(0);
      playPencilSound();
    }
  };

  // Solve all cells
  const handleSolveAll = () => {
    if (window.confirm('هل تود كشف حل الشبكة بالكامل؟')) {
      const solved = currentPuzzle.grid.map((row) =>
        row.map((cell) => (cell.isBlack ? '' : cell.solution))
      );
      setUserGrid(solved);

      const allCorrectMap: Record<string, { status: 'correct' }> = {};
      currentPuzzle.grid.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (!cell.isBlack) {
            allCorrectMap[`${r},${c}`] = { status: 'correct' };
          }
        });
      });
      setValidationMap(allCorrectMap);

      const allIds = new Set(allCluesList.map((c) => c.id));
      setCompletedClueIds(allIds);
      playVictoryFanfare();
      setIsVictoryModalOpen(true);
    }
  };

  // Current Network number if active (1 - 100 for Moroccan, 1 - 50 for Scientific)
  const currentNetworkNumber = useMemo(() => {
    if (currentPuzzle.id.startsWith('moroccan-network-')) {
      return parseInt(currentPuzzle.id.replace('moroccan-network-', ''), 10);
    }
    if (currentPuzzle.id.startsWith('science-network-')) {
      return parseInt(currentPuzzle.id.replace('science-network-', ''), 10);
    }
    return null;
  }, [currentPuzzle.id]);

  const totalInCurrentMode = activeCategoryMode === 'science' ? TOTAL_SCIENCE_NETWORKS : TOTAL_MOROCCAN_NETWORKS;

  const handleSwitchMode = useCallback(
    (mode: 'moroccan' | 'science') => {
      setActiveCategoryMode(mode);
      if (mode === 'science') {
        initPuzzle(getScientificNetwork(1));
      } else {
        initPuzzle(getMoroccanNetwork(1));
      }
    },
    [initPuzzle]
  );

  const handlePrevNetwork = useCallback(() => {
    if (currentNetworkNumber && currentNetworkNumber > 1) {
      const prevNum = currentNetworkNumber - 1;
      initPuzzle(activeCategoryMode === 'science' ? getScientificNetwork(prevNum) : getMoroccanNetwork(prevNum));
    }
  }, [currentNetworkNumber, activeCategoryMode, initPuzzle]);

  const handleNextNetwork = useCallback(() => {
    if (currentNetworkNumber && currentNetworkNumber < totalInCurrentMode) {
      const nextNum = currentNetworkNumber + 1;
      initPuzzle(activeCategoryMode === 'science' ? getScientificNetwork(nextNum) : getMoroccanNetwork(nextNum));
    }
  }, [currentNetworkNumber, totalInCurrentMode, activeCategoryMode, initPuzzle]);

  const handleSelectNetworkNumber = useCallback(
    (num: number) => {
      initPuzzle(activeCategoryMode === 'science' ? getScientificNetwork(num) : getMoroccanNetwork(num));
    },
    [activeCategoryMode, initPuzzle]
  );

  // Next puzzle switch (cycles through Moroccan 100 networks or Scientific 50 networks or special puzzles)
  const handlePlayNextPuzzle = () => {
    if (currentNetworkNumber) {
      const nextNum = (currentNetworkNumber % totalInCurrentMode) + 1;
      initPuzzle(activeCategoryMode === 'science' ? getScientificNetwork(nextNum) : getMoroccanNetwork(nextNum));
    } else {
      const curIdx = PUZZLES.findIndex((p) => p.id === currentPuzzle.id);
      const nextIdx = (curIdx + 1) % PUZZLES.length;
      initPuzzle(PUZZLES[nextIdx]);
    }
  };

  // Filled count & stats
  const filledCount = useMemo(() => {
    let count = 0;
    userGrid.forEach((row, r) => {
      row.forEach((val, c) => {
        if (!currentPuzzle.grid[r]?.[c]?.isBlack && val.trim() !== '') {
          count++;
        }
      });
    });
    return count;
  }, [userGrid, currentPuzzle]);

  // Manual sync to Firebase Firestore
  const handleManualSync = async () => {
    if (!currentUser || !currentPuzzle) return;
    setIsCloudSyncing(true);
    try {
      await savePuzzleProgressToFirestore(currentUser.uid, currentPuzzle.id, {
        grid: userGrid,
        timerSeconds,
        hintsUsedCount,
        isCompleted: isVictoryModalOpen,
      });
      setLastSyncedAt(new Date());
    } catch (err) {
      console.warn('Manual sync failed:', err);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  return (
    <div className="min-h-screen newspaper-texture flex flex-col justify-between selection:bg-[#E4D8C4]">
      {/* Top Masthead & Controls */}
      <HeaderMasthead
        currentPuzzle={currentPuzzle}
        onSelectPuzzle={initPuzzle}
        timerSeconds={timerSeconds}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused((prev) => !prev)}
        isMuted={isMutedState}
        onToggleMute={() => {
          const next = !isMutedState;
          setIsMutedState(next);
          setMuted(next);
        }}
        zoomLevel={zoomLevel}
        onZoomIn={() => setZoomLevel((prev) => Math.min(1.3, prev + 0.1))}
        onZoomOut={() => setZoomLevel((prev) => Math.max(0.8, prev - 0.1))}
        onResetGrid={handleResetGrid}
        onSolveAll={handleSolveAll}
        onPrint={() => window.print()}
        filledCount={filledCount}
        totalLetters={currentPuzzle.totalLetters}
        solvedWordsCount={completedClueIds.size}
        totalWordsCount={allCluesList.length}
        currentUser={currentUser}
        onOpenCloudSync={() => setIsCloudModalOpen(true)}
        isCloudSyncing={isCloudSyncing}
        currentNetworkNumber={currentNetworkNumber}
        onPrevNetwork={handlePrevNetwork}
        onNextNetwork={handleNextNetwork}
        onSelectNetworkNumber={handleSelectNetworkNumber}
        activeMode={activeCategoryMode}
        onSwitchMode={handleSwitchMode}
        onOpenAchievements={() => setIsAchievementsModalOpen(true)}
        unlockedBadgesCount={achievementStats.unlockedBadgeIds.length}
        totalSolvedPuzzlesCount={achievementStats.totalSolved}
      />

      {/* Main Play View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 flex flex-col gap-3 no-print pb-56 sm:pb-64">
        {/* 2-Column Responsive Layout: Crossword Grid + Clues Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* Crossword Grid Column - Max clarity & unobstructed space (استغلال المساحة) */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center overflow-x-auto py-1 w-full">
            <CrosswordGrid
              grid={currentPuzzle.grid}
              userGrid={userGrid}
              validationMap={validationMap}
              selectedRow={selectedRow}
              selectedCol={selectedCol}
              activeWordCells={activeWordCells}
              zoomLevel={zoomLevel}
              onCellClick={handleCellClick}
              onCellKeyDown={handleCellKeyDown}
            />

            {/* Instruction Footer under grid */}
            <div className="mt-2 text-center text-xs text-[#73634F] font-amiri space-x-2 space-x-reverse">
              <span>انقر مرتين على الخانة للتبديل بين الأفقي والعمودي</span>
              <span>·</span>
              <span>المسافة (Space) لقلب الاتجاه</span>
              <span>·</span>
              <span>الأسهم للتنقل السريع</span>
            </div>
          </div>

          {/* Clues List Column */}
          <div className="lg:col-span-4 h-[520px] lg:h-[650px] w-full">
            <CluesPanel
              acrossClues={currentPuzzle.clues.across}
              downClues={currentPuzzle.clues.down}
              activeClueId={activeClue?.id || null}
              completedClueIds={completedClueIds}
              onSelectClue={handleSelectClue}
            />
          </div>
        </div>

        {/* Vintage Mechanical Visitor Counter (عداد الزوار في الأسفل) */}
        <VisitorCounter />
      </main>

      {/* Virtual Keyboard with Docked Question Bar (المكان المحدد بالأصفر) */}
      <VirtualKeyboard
        onKeyPress={handleCharInput}
        onBackspace={handleBackspace}
        onToggleDirection={() => {
          setDirection((prev) => (prev === 'across' ? 'down' : 'across'));
          playTypewriterClick();
        }}
        onHint={() => setIsHintAdModalOpen(true)}
        onCheckWord={handleCheckWord}
        onPrevClue={handlePrevClue}
        onNextClue={handleNextClue}
        onAskAIHint={() => setIsAIModalOpen(true)}
        activeClue={activeClue}
        direction={direction}
        isOpen={isVirtualKeyboardOpen}
        onToggleOpen={() => setIsVirtualKeyboardOpen((prev) => !prev)}
      />

      {/* Hint AdSense Popup Modal (إشهار التلميح ثم يختفي ويكشف الحرف) */}
      <HintAdModal
        isOpen={isHintAdModalOpen}
        onClose={() => setIsHintAdModalOpen(false)}
        onAdComplete={handleRevealLetter}
      />

      {/* AI Assistant Modal */}
      <AIHintModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        activeClue={activeClue}
        onRevealFirstLetter={handleRevealFirstLetter}
        onRevealWord={handleRevealWord}
      />

      {/* Victory Modal */}
      <VictoryModal
        isOpen={isVictoryModalOpen}
        onClose={() => setIsVictoryModalOpen(false)}
        puzzleTitle={currentPuzzle.title}
        timeSpentSeconds={timerSeconds}
        hintsUsedCount={hintsUsedCount}
        totalLetters={currentPuzzle.totalLetters}
        onPlayNextPuzzle={handlePlayNextPuzzle}
        onReplay={() => initPuzzle(currentPuzzle)}
        onPrint={() => window.print()}
        newlyUnlockedBadges={latestUnlockedBadges}
        totalSolvedCount={achievementStats.totalSolved}
        averageTimeSeconds={achievementStats.averageTimeSeconds}
        onOpenAchievements={() => setIsAchievementsModalOpen(true)}
      />

      {/* User Achievements & Badges Modal */}
      <AchievementsModal
        isOpen={isAchievementsModalOpen}
        onClose={() => setIsAchievementsModalOpen(false)}
        stats={achievementStats}
        onSelectPuzzleById={(puzzleId) => {
          if (puzzleId.startsWith('moroccan-network-')) {
            const num = parseInt(puzzleId.replace('moroccan-network-', ''), 10);
            setActiveCategoryMode('moroccan');
            initPuzzle(getMoroccanNetwork(num));
          } else if (puzzleId.startsWith('science-network-')) {
            const num = parseInt(puzzleId.replace('science-network-', ''), 10);
            setActiveCategoryMode('science');
            initPuzzle(getScientificNetwork(num));
          } else {
            const p = PUZZLES.find((x) => x.id === puzzleId);
            if (p) initPuzzle(p);
          }
        }}
      />

      {/* Cloud Sync Modal */}
      <CloudSyncModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        currentUser={currentUser}
        onSignInWithGoogle={async () => {
          await loginWithGoogle();
        }}
        onSignOut={async () => {
          await logoutUser();
        }}
        onManualSync={handleManualSync}
        lastSyncedAt={lastSyncedAt}
        isSyncing={isCloudSyncing}
        storageMode={currentUser ? 'cloud' : 'local'}
      />

      {/* Printable Sheet (Shown only on Ctrl+P) */}
      <PrintSheet puzzle={currentPuzzle} />
    </div>
  );
}
