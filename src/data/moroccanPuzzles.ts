/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 100 Authentic Moroccan Crossword Networks Generator for Abu Salma Crossword.
 * Deterministic seeded generator producing 100 distinct Moroccan puzzles
 * with verified letter intersections, Moroccan cultural clues, and instant memory caching.
 */

import { CellData, ClueItem, PuzzleDefinition } from './puzzles';

// Pseudo-random generator (mulberry32) for deterministic seeding
function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normArabic(ch: string): string {
  if (!ch) return '';
  return ch
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .trim();
}

export const moroccanCluesBank = [
  // مدن مغربية
  { text: "مدينة مغربية تُلقب بـ 'العاصمة الروحية'", answer: "فاس", category: "مدن" },
  { text: "مدينة مغربية تُلقب بـ 'المدينة الحمراء'", answer: "مراكش", category: "مدن" },
  { text: "عاصمة المملكة المغربية", answer: "الرباط", category: "مدن" },
  { text: "مدينة مغربية تُلقب بـ 'العاصمة الاقتصادية'", answer: "الدارالبيضاء", category: "مدن" },
  { text: "مدينة مغربية تقع في أقصى الشمال وتطل على مضيق جبل طارق", answer: "طنجة", category: "مدن" },
  { text: "مدينة مغربية تُلقب بـ 'الحمامة البيضاء' وعاصمة الشمال", answer: "تطوان", category: "مدن" },
  { text: "مدينة مغربية إسماعيلية تاريخية شهيرة بباب المنصور", answer: "مكناس", category: "مدن" },
  { text: "مدينة مغربية جنوبية تُلقب بـ 'عاصمة سوس' وبوابة الصحراء", answer: "اكادير", category: "مدن" },
  { text: "مدينة مغربية جبلية تُلقب بـ 'الجوهرة الزرقاء'", answer: "شفشاون", category: "مدن" },
  { text: "حاضرة الشرق المغربي وعاصمة جهة الشرق", answer: "وجدة", category: "مدن" },
  { text: "مدينة مغربية بالأطلس المتوسط تشتهر بالصنوبر والزرابي", answer: "ازرو", category: "مدن" },
  { text: "مدينة مغربية تاريخية على المحيط الأطلسي مشهورة بقلعتها", answer: "الجديدة", category: "مدن" },
  { text: "مدينة مغربية بالشرق تشتهر بإنتاج أجود أنواع البرتقال", answer: "بركان", category: "مدن" },
  { text: "مدينة مغربية في الجنوب الشرقي وبوابة تافيلالت", answer: "الرشيدية", category: "مدن" },
  { text: "مدينة مغربية أثرية رومانية قرب مكناس وفاس", answer: "وليلي", category: "مدن" },
  { text: "مدينة مغربية أطلسية تُلقب بسويسرا المغرب", answer: "افران", category: "مدن" },
  { text: "مدينة مغربية ساحلية تاريخية تُعرف بمدينة الرياح والأسوار", answer: "الصويرة", category: "مدن" },
  { text: "مدينة مغربية في الغرب تشتهر بصناعة الفخار والقصبة", answer: "اسفي", category: "مدن" },
  { text: "مدينة الفوسفاط وعاصمة الشاوية ورديغة", answer: "خريبكة", category: "مدن" },
  { text: "مدينة مغربية تاريخية على وادي سبو", answer: "القنيطرة", category: "مدن" },

  // أكلات وأطباق مغربية
  { text: "طبق مغربي شهير يُطهى ببطء في إناء فخاري مخروطي", answer: "طاجين", category: "أكلات" },
  { text: "حساء مغربي تقليدي يُقدم في الإفطار الرمضاني مع التمر", answer: "حريرة", category: "أكلات" },
  { text: "طبق الجمعة الوطني المغربي الشهير بالسميد والسبع خضار", answer: "كسكس", category: "أكلات" },
  { text: "حلوى مغربية دائرية مقرمشة باللوز والسمسم", answer: "غريبة", category: "أكلات" },
  { text: "حلوى مغربية راقية على شكل هلال محشوة بعقدة اللوز", answer: "كعبغزال", category: "أكلات" },
  { text: "المشروب الوطني المغربي المصنوع من الشاي الأخضر والنعناع", answer: "اتاي", category: "أكلات" },
  { text: "فطير مغربي مربع ومورق يُدهن بالزبدة والعسل", answer: "مسمن", category: "أكلات" },
  { text: "حساء مغربي شتوي دافئ من الفول المجفف وزيت الزيتون", answer: "بيصارة", category: "أكلات" },
  { text: "حلوى مغربية رمضانية معسلة ومشبكة بالجلجلان", answer: "شباكية", category: "أكلات" },
  { text: "حلوى مغربية تقليدية من السميد والتمر مقلية ومعسلة", answer: "مقروض", category: "أكلات" },
  { text: "شواء مغربي تقليدي لقطع الكبد الملفوفة بالشحم في عيد الأضحى", answer: "بولفاف", category: "أكلات" },
  { text: "فطائر مغربية رقيقة ومثقوبة كالشهدة تُسقى بالعسل", answer: "بغرير", category: "أكلات" },
  { text: "طبق مغربي فاخر من الدجاج واللوز في رقائق الورقة رشة قرفة", answer: "بسطيلة", category: "أكلات" },
  { text: "طبق مراكشي عريق يُطهى في جرة فخارية تحت رماد الحمام", answer: "طنجية", category: "أكلات" },

  // تراث وعادات مغربية
  { text: "لباس مغربي تقليدي أصيل للرجال ذو قلنسوة حادة", answer: "جلابة", category: "تراث" },
  { text: "زي نسائي مغربي فاخر ذو شهرة عالمية في المناسبات والأعراس", answer: "قفطان", category: "تراث" },
  { text: "غطاء رأس مغربي مخروطي من الجوخ الأحمر بشرابة حريرية", answer: "طربوش", category: "تراث" },
  { text: "رقصة جماعية مغربية أمازيغية من جبال الأطلس الكبير والصغير", answer: "احواش", category: "تراث" },
  { text: "فن غنائي وحركي تراثي مغربي من جبال الأطلس المتوسط", answer: "احيدوس", category: "تراث" },
  { text: "فن الفسيفساء الخزفي المغربي لتزيين القصور والمساجد", answer: "زليج", category: "تراث" },
  { text: "منزل مغربي تقليدي عريق بفناء داخلي مفتوح ونافورة", answer: "رياض", category: "تراث" },
  { text: "حمام مغربي تقليدي بالبخار والصابون البلدي والغاسول", answer: "حمام", category: "تراث" },
  { text: "حذاء مغربي جلدي تقليدي مدبب بدون كعب", answer: "بلغة", category: "تراث" },
  { text: "سجادة مغربية أمازيغية منسوجة يدوياً من الصوف الطبيعي", answer: "زربية", category: "تراث" },
  { text: "خنجر مغربي تقليدي مرصع بالفضة يوضع في الغمد", answer: "كمية", category: "تراث" },
  { text: "عرض فروسية مغربي تقليدي وبارود في المواسم والمهرجانات", answer: "تبوريدة", category: "تراث" },

  // جغرافيا وطبيعة
  { text: "أعلى قمة جبلية في المغرب وشمال إفريقيا بسلسلة الأطلس", answer: "توبقال", category: "جغرافيا" },
  { text: "سلسلة جبلية مهيبة تمتد عبر ربوع المغرب", answer: "اطلس", category: "جغرافيا" },
  { text: "واحة وكثبان رملية ذهبية شهيرة في صحراء المغرب بالجنوب الشرقي", answer: "مرزوكة", category: "جغرافيا" },
  { text: "مضيق مائي استراتيجي يفصل المغرب عن القارة الأوروبية", answer: "جبلطارق", category: "جغرافيا" },
  { text: "بحر يحد المملكة المغربية من جهة الشمال", answer: "متوسط", category: "جغرافيا" },
  { text: "محيط شاسع يحد المغرب من جهة الغرب بطول آلاف الكيلومترات", answer: "اطلسي", category: "جغرافيا" },
  { text: "ثاني أطول أنهار المغرب ينبع من الأطلس المتوسط ويصب في الأطلسي", answer: "امالربيع", category: "جغرافيا" },
  { text: "أطول نهر في المغرب ينبع من الأطلس الكبير", answer: "درعة", category: "جغرافيا" },
  { text: "نهر مغربي هام يمر بسهل الغرب ويصب بالمهدية", answer: "سبو", category: "جغرافيا" },
  { text: "وادي صحراوي مغربي خصب غني بواحات النخيل بتافيلالت", answer: "زيز", category: "جغرافيا" },

  // تاريخ ودول
  { text: "أول سلالة إسلامية مستقلة أسست الدولة المغربية وبنت فاس", answer: "ادريسية", category: "تاريخ" },
  { text: "سلالة أسست مراكش وحكمت إمبراطورية كبرى حتى الأندلس", answer: "مرابطون", category: "تاريخ" },
  { text: "دولة مغربية أسسها المهدي بن تومرت وبنت صومعة حسان والكتبية", answer: "موحدون", category: "تاريخ" },
  { text: "سلالة حكمت المغرب وبنت المدارس التاريخية بفاس ومكناس", answer: "مرينيون", category: "تاريخ" },
  { text: "دولة مغربية انتصرت في معركة وادي المخازن وبنت قصر البديع", answer: "سعديون", category: "تاريخ" },
  { text: "معركة تاريخية خالدة سنة 1578 هزم فيها المغاربة جيش البرتغال", answer: "وادالمخازن", category: "تاريخ" },
  { text: "أقدم جامعة في العالم تقع في قلب فاس بنتها فاطمة الفهرية", answer: "القرويين", category: "تاريخ" },
  { text: "صومعة تاريخية موحدية شهيرة تنتصب في الرباط", answer: "حسان", category: "تاريخ" },

  // رياضة وشخصيات
  { text: "اللقب الشهير لمنتخب المغرب لكرة القدم صاحب إنجاز مونديال 2022", answer: "اسودالاطلس", category: "رياضة" },
  { text: "نادي رياضي بيضاوي عريق باللونين الأحمر والأبيض", answer: "الوداد", category: "رياضة" },
  { text: "نادي رياضي بيضاوي شهير باللون الأخضر والنسر", answer: "الرجاء", category: "رياضة" },
  { text: "عداء مغربي أسطوري حطم الأرقام القياسية في المسافات المتوسطة", answer: "هشامالكروج", category: "رياضة" },
  { text: "أول بطلة أولمبية مغربية وعربية في سباق الحواجز", answer: "نوالالمتوكل", category: "رياضة" },
  { text: "ملعب رياضي تاريخي كبير في قلب الدار البيضاء", answer: "محمدالخامس", category: "رياضة" },

  // ثقافة ورموز
  { text: "العملة الرسمية للمملكة المغربية", answer: "درهم", category: "رموز" },
  { text: "الشعار الخماسي الأخضر الذي يتوسط العلم الوطني المغربي", answer: "نجمة", category: "رموز" },
  { text: "شجرة نادرة مقدسة وفريدة ينفرد بها المغرب عالمياً بجهة سوس", answer: "اركان", category: "طبيعة" },
  { text: "زيت مغربي ثمين للشعر والبشرة والتغذية يُلقب بالذهب السائل", answer: "زيتاركان", category: "طبيعة" },
  { text: "قلعة جنوبية مغربية بوادي دادس تشتهر بموسم الورود وعطره", answer: "قلعةمكونة", category: "جغرافيا" },
  { text: "مهرجان دولي سنوي للموسيقى يقام في العاصمة الرباط", answer: "موازين", category: "ثقافة" }
];

export const TOTAL_MOROCCAN_NETWORKS = 100;

// Memory cache for generated networks
const networkCache = new Map<number, PuzzleDefinition>();

interface PlacedWordInfo {
  text: string;
  answer: string;
  category: string;
  dir: 'across' | 'down';
  row: number;
  col: number;
  length: number;
}

/**
 * Generates a full deterministic Moroccan Crossword network (1 - 100)
 */
export function getMoroccanNetwork(networkNumber: number): PuzzleDefinition {
  const index = Math.max(1, Math.min(TOTAL_MOROCCAN_NETWORKS, networkNumber));

  if (networkCache.has(index)) {
    return networkCache.get(index)!;
  }

  const rng = mulberry32(index * 9973 + 17);
  const size = 15;
  const gridLetters: (string | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));

  // Shuffle clues pool for this network
  const cluesPool = [...moroccanCluesBank];
  for (let i = cluesPool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cluesPool[i], cluesPool[j]] = [cluesPool[j], cluesPool[i]];
  }

  const placedWords: PlacedWordInfo[] = [];

  function canPlaceWord(ans: string, dir: 'across' | 'down', row: number, col: number): boolean {
    const len = ans.length;
    if (dir === 'across') {
      if (col + len > size) return false;
      if (col > 0 && gridLetters[row][col - 1] !== null) return false;
      if (col + len < size && gridLetters[row][col + len] !== null) return false;

      for (let i = 0; i < len; i++) {
        const c = col + i;
        const cur = gridLetters[row][c];
        if (cur !== null && normArabic(cur) !== normArabic(ans[i])) return false;

        if (cur === null) {
          if (row > 0 && gridLetters[row - 1][c] !== null) return false;
          if (row < size - 1 && gridLetters[row + 1][c] !== null) return false;
        }
      }
    } else {
      if (row + len > size) return false;
      if (row > 0 && gridLetters[row - 1][col] !== null) return false;
      if (row + len < size && gridLetters[row + len][col] !== null) return false;

      for (let i = 0; i < len; i++) {
        const r = row + i;
        const cur = gridLetters[r][col];
        if (cur !== null && normArabic(cur) !== normArabic(ans[i])) return false;

        if (cur === null) {
          if (col > 0 && gridLetters[r][col - 1] !== null) return false;
          if (col < size - 1 && gridLetters[r][col + 1] !== null) return false;
        }
      }
    }
    return true;
  }

  function placeWord(wordObj: typeof moroccanCluesBank[0], dir: 'across' | 'down', row: number, col: number) {
    const len = wordObj.answer.length;
    for (let i = 0; i < len; i++) {
      if (dir === 'across') {
        gridLetters[row][col + i] = wordObj.answer[i];
      } else {
        gridLetters[row + i][col] = wordObj.answer[i];
      }
    }
    placedWords.push({
      ...wordObj,
      dir,
      row,
      col,
      length: len,
    });
  }

  // Place initial seed word
  const firstWord = cluesPool[0];
  const startCol = Math.floor(rng() * 3) + 1;
  const startRow = Math.floor(rng() * 2) + 1;
  placeWord(firstWord, 'across', startRow, startCol);

  // Place intersecting words
  for (let cIdx = 1; cIdx < cluesPool.length && placedWords.length < 24; cIdx++) {
    const candidate = cluesPool[cIdx];
    const candLen = candidate.answer.length;
    let bestPlacement: { dir: 'across' | 'down'; row: number; col: number } | null = null;
    let maxIntersections = 0;

    for (const placed of placedWords) {
      const targetDir = placed.dir === 'across' ? 'down' : 'across';

      for (let ci = 0; ci < candLen; ci++) {
        for (let pi = 0; pi < placed.length; pi++) {
          if (normArabic(candidate.answer[ci]) === normArabic(placed.answer[pi])) {
            let row: number;
            let col: number;
            if (targetDir === 'down') {
              row = placed.row - ci;
              col = placed.col + pi;
            } else {
              row = placed.row + pi;
              col = placed.col - ci;
            }

            if (row >= 0 && col >= 0 && canPlaceWord(candidate.answer, targetDir, row, col)) {
              let intersections = 0;
              for (let k = 0; k < candLen; k++) {
                const r = targetDir === 'down' ? row + k : row;
                const c = targetDir === 'across' ? col + k : col;
                if (gridLetters[r][c] !== null) intersections++;
              }
              if (intersections > maxIntersections) {
                maxIntersections = intersections;
                bestPlacement = { dir: targetDir, row, col };
              }
            }
          }
        }
      }
    }

    if (bestPlacement) {
      placeWord(candidate, bestPlacement.dir, bestPlacement.row, bestPlacement.col);
    } else if (placedWords.length < 14) {
      const tryDir = placedWords.length % 2 === 0 ? 'across' : 'down';
      for (let r = 1; r < size - 2; r += 2) {
        for (let c = 1; c < size - candLen; c += 2) {
          if (canPlaceWord(candidate.answer, tryDir, r, c)) {
            placeWord(candidate, tryDir, r, c);
            r = size;
            break;
          }
        }
      }
    }
  }

  // Construct CellData grid and Clue items
  const cellGrid: CellData[][] = [];
  let totalLettersCount = 0;

  for (let r = 0; r < size; r++) {
    const rowCells: CellData[] = [];
    for (let c = 0; c < size; c++) {
      const letter = gridLetters[r][c];
      const isBlack = letter === null;
      if (!isBlack) totalLettersCount++;

      rowCells.push({
        row: r,
        col: c,
        isBlack,
        solution: letter || '',
        number: null,
        hasArrowLeft: false,
        hasArrowDown: false,
        acrossClueId: null,
        downClueId: null,
      });
    }
    cellGrid.push(rowCells);
  }

  // Map clues and assign numbers in reading order
  const acrossClues: ClueItem[] = [];
  const downClues: ClueItem[] = [];

  let nextClueNumber = 1;

  // Sort placed words by row, then col
  const sortedWords = [...placedWords].sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return a.col - b.col;
  });

  // Track assigned numbers by start cell coordinate
  const cellNumberMap = new Map<string, number>();

  sortedWords.forEach((pw, idx) => {
    const key = `${pw.row},${pw.col}`;
    let assignedNum = cellNumberMap.get(key);
    if (!assignedNum) {
      assignedNum = nextClueNumber++;
      cellNumberMap.set(key, assignedNum);
      cellGrid[pw.row][pw.col].number = assignedNum;
    }

    const clueId = `m_${pw.dir[0]}_${idx + 1}`;

    const clueItem: ClueItem = {
      id: clueId,
      num: assignedNum,
      row: pw.row,
      col: pw.col,
      length: pw.length,
      answer: pw.answer,
      clue: pw.text,
      category: pw.category,
      dir: pw.dir,
    };

    if (pw.dir === 'across') {
      cellGrid[pw.row][pw.col].hasArrowLeft = true;
      acrossClues.push(clueItem);
      for (let i = 0; i < pw.length; i++) {
        cellGrid[pw.row][pw.col + i].acrossClueId = clueId;
      }
    } else {
      cellGrid[pw.row][pw.col].hasArrowDown = true;
      downClues.push(clueItem);
      for (let i = 0; i < pw.length; i++) {
        cellGrid[pw.row + i][pw.col].downClueId = clueId;
      }
    }
  });

  const puzzleDef: PuzzleDefinition = {
    id: `moroccan-network-${index}`,
    title: `شبكة أبو سلمى المغربية (الشبكة ${index})`,
    subtitle: `لغز مغربي أصيل - مدن وتراث وأكلات وتاريخ وجغرافية المغرب (${acrossClues.length + downClues.length} سؤالاً)`,
    date: `الشبكة ${index} من 100 · مسابقة الكلمات المتقاطعة المغربية`,
    difficulty: index <= 30 ? 'سهل' : index <= 70 ? 'متوسط' : 'متقدم',
    rows: 15,
    cols: 15,
    totalLetters: totalLettersCount,
    grid: cellGrid,
    clues: {
      across: acrossClues,
      down: downClues,
    },
  };

  networkCache.set(index, puzzleDef);
  return puzzleDef;
}
