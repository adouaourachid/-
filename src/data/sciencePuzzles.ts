/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 50 Authentic Scientific Crossword Networks Generator (الشبكات العلمية).
 * Covers Physics, Chemistry, Biology, Astronomy, Mathematics, and Medicine.
 * Deterministic seeded generator with verified letter intersections and instant caching.
 */

import { CellData, ClueItem, PuzzleDefinition } from './puzzles';

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

export const scienceCluesBank = [
  // فيزياء
  { text: "وحدة قياس القوة في الفيزياء نسبة إلى عالم التفاحة", answer: "نيوتن", hint: "نسبة إلى إسحاق نيوتن", category: "فيزياء" },
  { text: "طاقة يكتسبها الجسم بسبب حركته وسرعته", answer: "حركية", hint: "طاقة الحركة", category: "فيزياء" },
  { text: "جسيم ذري أولي يحمل شحنة سالبة ويدور حول النواة", answer: "الكترون", hint: "يدور حول النواة", category: "فيزياء" },
  { text: "جسيم ذري موجب الشحنة يستقر داخل نواة الذرة", answer: "بروتون", hint: "في نواة الذرة", category: "فيزياء" },
  { text: "جسيم متعادل الشحنة الكهربائية داخل النواة", answer: "نيوترون", hint: "لا شحنة له", category: "فيزياء" },
  { text: "وحدة قياس شدة التيار الكهربائي في النظام الدولي", answer: "امبير", hint: "نسبة إلى عالم فرنسي", category: "فيزياء" },
  { text: "وحدة قياس فرق الجهد الكهربائي والقوة الدافعة", answer: "فولت", hint: "نسبة إلى عالم إيطالي", category: "فيزياء" },
  { text: "عالم فيزياء عبقري صاحب النظرية النسبية الشهيرة", answer: "اينشتاين", hint: "E=mc²", category: "فيزياء" },
  { text: "القوة الكونية التي تجذب الأجسام والكتل نحو مركز الأرض", answer: "جاذبية", hint: "قوة الجذب", category: "فيزياء" },
  { text: "مادة تسمح بسريان التيار الكهربائي مثل النحاس والحديد", answer: "موصل", hint: "مثل النحاس", category: "فيزياء" },
  { text: "مادة تقاوم وتمنع انتقال التيار الكهربائي مثل الخشب والبلاستيك", answer: "عازل", hint: "مثل البلاستيك", category: "فيزياء" },
  { text: "وحدة قياس الشغل والطاقة في الفيزياء", answer: "جول", hint: "نسبة للعالم جيمس جول", category: "فيزياء" },
  { text: "أسرع موجة كهرومغناطيسية في الكون تسير بسرعة 300 ألف كم/ث", answer: "الضوء", hint: "أسرع شيء في الكون", category: "فيزياء" },
  { text: "جهاز علمي دقيق يُستخدم لقياس الضغط الجوي", answer: "بارومتر", hint: "قياس الضغط الجوي", category: "فيزياء" },
  { text: "مقياس حراري يستخدم لقياس درجات الحرارة", answer: "ترمومتر", hint: "ميزان الحرارة", category: "فيزياء" },
  { text: "الوحدة الحرارية المستخدمة لتقدير الطاقة في الأغذية", answer: "سعرة", hint: "كالوري", category: "فيزياء" },

  // كيمياء
  { text: "أخف وأبسط عنصر كيميائي في الجدول الدوري", answer: "هيدروجين", hint: "الرمز الكيميائي H", category: "كيمياء" },
  { text: "غاز حيوي ضروري لتنفس الكائنات الحية والاحتراق", answer: "اكسجين", hint: "الرمز الكيميائي O", category: "كيمياء" },
  { text: "عنصر كيميائي أساسي في تكوين جميع المركبات العضوية", answer: "كربون", hint: "الرمز الكيميائي C", category: "كيمياء" },
  { text: "معدن فضي فريد يظل سائلاً في درجة حرارة الغرفة العادية", answer: "زئبق", hint: "الرمز الكيميائي Hg", category: "كيمياء" },
  { text: "المركب الأساسي للحياة يتكون من ذرتي هيدروجين وذرة أكسجين", answer: "ماء", hint: "H2O", category: "كيمياء" },
  { text: "غاز رئيسي ينبعث من التنفس ويسبب ظاهرة الاحتباس الحراري", answer: "ثانياكسيدالكربون", hint: "CO2", category: "كيمياء" },
  { text: "قيمة الرقم الهيدروجيني pH للماء النقي المحايد", answer: "سبعة", hint: "درجة التعادل 7", category: "كيمياء" },
  { text: "فلز ثمين أصفر لا يصدأ يستخدم في صناعة الحلي والعملات", answer: "ذهب", hint: "الرمز Au", category: "كيمياء" },
  { text: "عنصر هالوجيني مطهر يستخدم في تعقيم الجروح والعمليات", answer: "يود", hint: "مطهر طبي", category: "كيمياء" },
  { text: "العالم الروسي العبقري واضع أول جدول دوري للعناصر", answer: "مندليف", hint: "مبتكر الجدول الدوري", category: "كيمياء" },

  // أحياء وبيولوجيا
  { text: "الوحدة التركيبية والوظيفية الأساسية لجميع الكائنات الحية", answer: "خلية", hint: "أصغر لبنة حية", category: "أحياء" },
  { text: "العضو العضلي الحيوي المسؤول عن ضخ الدم إلى الجسم", answer: "قلب", hint: "المضخة الحيوية", category: "أحياء" },
  { text: "العضو التنفسي المسؤول عن تبادل الأكسجين وثاني أكسيد الكربون", answer: "رئة", hint: "جهاز التنفس", category: "أحياء" },
  { text: "مركز التحكم والقيادة في الجهاز العصبي البشري", answer: "دماغ", hint: "مركز التفكير", category: "أحياء" },
  { text: "عملية حيوية يصنع بها النبات غذاءه باستخدام ضوء الشمس", answer: "بناءضوئي", hint: "التركيب الضوئي", category: "أحياء" },
  { text: "الصبغة الخضراء في النباتات المسؤولة عن امتصاص الضوء", answer: "كلوروفيل", hint: "اليخضور", category: "أحياء" },
  { text: "أكبر عضو في جسم الإنسان يغطي السطح الخارجي بالكامل", answer: "جلد", hint: "الغطاء الخارجي", category: "أحياء" },
  { text: "السائل الأحمر الحيوي الذي ينقل الأكسجين والمغذيات بالخلايا", answer: "دم", hint: "سائل الحياة", category: "أحياء" },
  { text: "أصغر عظمة في جسم الإنسان وتقع في الأذن الوسطى", answer: "ركاب", hint: "عظمة في الأذن", category: "أحياء" },
  { text: "الحمض النووي الحامل للشفرة والجينات الوراثية للكائن الحي", answer: "دنا", hint: "DNA", category: "أحياء" },
  { text: "طبيب وفيلسوف مسلم رائد ومؤلف كتاب القانون في الطب", answer: "ابنسينا", hint: "الشيخ الرئيس", category: "أحياء" },
  { text: "الجهاز الحيوي في الجسم الذي يحارب الميكروبات والعدوى", answer: "مناعة", hint: "خط الدفاع", category: "أحياء" },
  { text: "أضخم حيوان ثديي على كوكب الأرض يعيش في المحيطات", answer: "حوتازرق", hint: "عملاق البحار", category: "أحياء" },

  // فلك وفضاء
  { text: "أقرب كواكب المجموعة الشمسية إلى الشمس وأصغرها حجماً", answer: "عطارد", hint: "الكوكب الأقرب للشمس", category: "فلك" },
  { text: "الكوكب المجاور للأرض الملقب بالكوكب الأحمر", answer: "المريخ", hint: "الكوكب الأحمر", category: "فلك" },
  { text: "أكبر كواكب المجموعة الشمسية حجماً وكتلة وله بقعة حمراء", answer: "المشتري", hint: "كوكب الغاز العملاق", category: "فلك" },
  { text: "الكوكب المائي الوحيد المعروف باحتوائه على حياة", answer: "الارض", hint: "كوكبنا الأزرق", category: "فلك" },
  { text: "كوكب غازي شهير بحلقاته الجليدية الرائعة التي تدور حوله", answer: "زحل", hint: "كوكب الحلقات", category: "فلك" },
  { text: "النجم المركزي المضيء الذي تدور حوله كواكب مجموعتنا", answer: "الشمس", hint: "نجم المنظومة", category: "فلك" },
  { text: "التابع الطبيعي الوحيد الذي يدور حول كوكب الأرض", answer: "القمر", hint: "تابع الأرض", category: "فلك" },
  { text: "ظاهرة فلكية تحدث عندما يحجب القمر ضوء الشمس عن الأرض", answer: "كسوف", hint: "كسوف الشمس", category: "فلك" },
  { text: "ظاهرة فلكية تحدث عندما تحجب الأرض ضوء الشمس عن القمر", answer: "خسوف", hint: "خسوف القمر", category: "فلك" },
  { text: "المجرة الحلزونية العظيمة التي تضم شمسنا وملايين النجوم", answer: "دربالتبانة", hint: "مجرتنا", category: "فلك" },
  { text: "عالم فلك إيطالي شهير اكتشف أقمار المشتري بالتلسكوب", answer: "غاليليو", hint: "رائد الرصد بالتلسكوب", category: "فلك" },
  { text: "كوكب جليدي عملاق أزرق وهو أبعد الكواكب عن الشمس", answer: "نبتون", hint: "أبعد كوكب", category: "فلك" },

  // رياضيات
  { text: "عالم رياضيات يوناني قديم شهير بنظرية أضلاع المثلث القائم", answer: "فيثاغورس", hint: "نظرية الوتر والمثلث", category: "رياضيات" },
  { text: "عالم رياضيات وفلك مسلم ومؤسس علم الجبر والخوارزميات", answer: "الخوارزمي", hint: "أبو الجبر", category: "رياضيات" },
  { text: "مجموع قياسات الزوايا الداخلية لأي مثلث في الهندسة المستوية", answer: "مائةوثمانون", hint: "180 درجة", category: "رياضيات" },
  { text: "عدد أضلاع وزوايا الشكل المربع والمستطيل", answer: "اربعة", hint: "شكل رباعي", category: "رياضيات" },

  // طب وصحة
  { text: "فيتامين ضروري للعظام يُصنعه الجسم عند التعرض لأشعة الشمس", answer: "دال", hint: "فيتامين D", category: "طب" },
  { text: "فيتامين مضاد للأكسدة يعزز المناعة وموجود بوفرة في البرتقال", answer: "جيم", hint: "فيتامين C", category: "طب" },
  { text: "مرض استقلابي مزمن يسببه نقص إفراز هرمون الأنسولين", answer: "سكري", hint: "داء السكري", category: "طب" },
  { text: "غدة حيوية تفرز هرمون الأنسولين لتنظيم سكر الجلوكوز", answer: "بنكرياس", hint: "غدة خلف المعدة", category: "طب" },
  { text: "مادة عضوية يفرزها الجسم تسبب أعراض الحساسية وسيلان الأنف", answer: "هيستامين", hint: "مسبب أعراض الحساسية", category: "طب" },
  { text: "عضو حاسة الشم وممر الهواء إلى الرئتين في الوجه", answer: "انف", hint: "حاسة الشم", category: "طب" },
  { text: "كائن مجهري دقيق يسبب العدوى والأمراض مثل الإنفلونزا", answer: "فيروس", hint: "أصغر من البكتيريا", category: "طب" }
];

export const TOTAL_SCIENCE_NETWORKS = 50;

// Memory cache for generated scientific networks
const scienceCache = new Map<number, PuzzleDefinition>();

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
 * Generates a full deterministic Scientific Crossword network (1 - 50)
 */
export function getScientificNetwork(networkNumber: number): PuzzleDefinition {
  const index = Math.max(1, Math.min(TOTAL_SCIENCE_NETWORKS, networkNumber));

  if (scienceCache.has(index)) {
    return scienceCache.get(index)!;
  }

  const rng = mulberry32(index * 13337 + 43);
  const size = 15;
  const gridLetters: (string | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));

  // Shuffle clues pool
  const cluesPool = [...scienceCluesBank];
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

  function placeWord(wordObj: typeof scienceCluesBank[0], dir: 'across' | 'down', row: number, col: number) {
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

  const sortedWords = [...placedWords].sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return a.col - b.col;
  });

  const cellNumberMap = new Map<string, number>();

  sortedWords.forEach((pw, idx) => {
    const key = `${pw.row},${pw.col}`;
    let assignedNum = cellNumberMap.get(key);
    if (!assignedNum) {
      assignedNum = nextClueNumber++;
      cellNumberMap.set(key, assignedNum);
      cellGrid[pw.row][pw.col].number = assignedNum;
    }

    const clueId = `s_${pw.dir[0]}_${idx + 1}`;

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
    id: `science-network-${index}`,
    title: `شبكة أبو سلمى العلمية (الشبكة ${index})`,
    subtitle: `لغز علمي شيق - فيزياء وكيمياء وأحياء وفلك ورياضيات وطب (${acrossClues.length + downClues.length} سؤالاً)`,
    date: `الشبكة العلمية ${index} من 50 · مسابقة الكلمات المتقاطعة العلمية`,
    difficulty: index <= 15 ? 'سهل' : index <= 35 ? 'متوسط' : 'متقدم',
    rows: 15,
    cols: 15,
    totalLetters: totalLettersCount,
    grid: cellGrid,
    clues: {
      across: acrossClues,
      down: downClues,
    },
  };

  scienceCache.set(index, puzzleDef);
  return puzzleDef;
}
