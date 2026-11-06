// scripts/create_verified_puzzles.cjs
const fs = require('fs');
const path = require('path');

function normChar(c) {
  if (!c) return '';
  return c
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .trim();
}

function createVerifiedPuzzle(puzzleData) {
  const { id, title, subtitle, date, difficulty, rows, cols, across, down } = puzzleData;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));

  const validatedAcross = [];
  const validatedDown = [];

  // Place Across
  for (const item of across) {
    const { id: clueId, r, c, word, clue, cat } = item;
    if (c + word.length > cols) throw new Error(`Across ${word} overflows row ${r}`);
    for (let i = 0; i < word.length; i++) {
      const curC = c + i;
      const char = word[i];
      if (grid[r][curC] !== null && normChar(grid[r][curC]) !== normChar(char)) {
        throw new Error(`Conflict Across in "${title}" at (${r},${curC}): existing "${grid[r][curC]}" vs "${char}" in "${word}"`);
      }
      grid[r][curC] = char;
    }
    validatedAcross.push({
      id: clueId,
      row: r,
      col: c,
      length: word.length,
      answer: word,
      clue,
      category: cat || 'عام',
      dir: 'across'
    });
  }

  // Place Down
  for (const item of down) {
    const { id: clueId, r, c, word, clue, cat } = item;
    if (r + word.length > rows) throw new Error(`Down ${word} overflows col ${c}`);
    for (let i = 0; i < word.length; i++) {
      const curR = r + i;
      const char = word[i];
      if (grid[curR][c] !== null && normChar(grid[curR][c]) !== normChar(char)) {
        throw new Error(`Conflict Down in "${title}" at (${curR},${c}): existing "${grid[curR][c]}" vs "${char}" in "${word}"`);
      }
      grid[curR][c] = char;
    }
    validatedDown.push({
      id: clueId,
      row: r,
      col: c,
      length: word.length,
      answer: word,
      clue,
      category: cat || 'عام',
      dir: 'down'
    });
  }

  // Build cell matrix & numbers
  let numberSequence = 1;
  const cellMatrix = [];

  for (let r = 0; r < rows; r++) {
    const rowList = [];
    for (let c = 0; c < cols; c++) {
      const char = grid[r][c];
      const isBlack = (char === null);

      const startsAcross = validatedAcross.find(a => a.row === r && a.col === c);
      const startsDown = validatedDown.find(d => d.row === r && d.col === c);

      let number = null;
      if (!isBlack && (startsAcross || startsDown)) {
        number = numberSequence++;
        if (startsAcross) startsAcross.num = number;
        if (startsDown) startsDown.num = number;
      }

      const parentAcross = validatedAcross.find(a => a.row === r && c >= a.col && c < a.col + a.length);
      const parentDown = validatedDown.find(d => d.col === c && r >= d.row && r < d.row + d.length);

      rowList.push({
        row: r,
        col: c,
        isBlack,
        solution: isBlack ? '' : char,
        number,
        hasArrowLeft: !!startsAcross,
        hasArrowDown: !!startsDown,
        acrossClueId: parentAcross ? parentAcross.id : null,
        downClueId: parentDown ? parentDown.id : null
      });
    }
    cellMatrix.push(rowList);
  }

  let totalLetters = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!cellMatrix[r][c].isBlack) totalLetters++;
    }
  }

  console.log(`[OK] "${title}": ${totalLetters} filled cells, ${validatedAcross.length} across, ${validatedDown.length} down.`);

  return {
    id,
    title,
    subtitle,
    date,
    difficulty,
    rows,
    cols,
    totalLetters,
    grid: cellMatrix,
    clues: {
      across: validatedAcross,
      down: validatedDown
    }
  };
}

// Puzzle 1: "شبكة أبو سلمى (الأصلية) 15×15"
const puzzle1 = createVerifiedPuzzle({
  id: "abu-salma-classic",
  title: "شبكة أبو سلمى (الأصلية)",
  subtitle: "مستوحاة من الشبكة الكلاسيكية الأصلية لجرائد الكلمات المتقاطعة العريقة",
  date: "العدد الكلاسيكي 101 - مسابقة الكلمات المتقاطعة",
  difficulty: "متوسط",
  rows: 15,
  cols: 15,
  across: [
    { id: "a1", r: 0, c: 0, word: "غائب", clue: "ضد (الحاضر) - أو الشخص الذي ليس موجوداً", cat: "أضداد" },
    { id: "a2", r: 0, c: 5, word: "بيروت", clue: "عاصمة الجمهورية اللبنانية وزهرة الشرق", cat: "عواصم" },
    { id: "a3", r: 0, c: 11, word: "مقص", clue: "أداة للقطع ونصل حاد لقص الأوراق والأقمشة", cat: "أدوات" },

    { id: "a4", r: 2, c: 0, word: "قبيح", clue: "شخص غير جميل الخِلقة والمنظر", cat: "صفات" },
    { id: "a5", r: 2, c: 5, word: "دمشق", clue: "أقدم عاصمة مأهولة في التاريخ (عاصمة سوريا)", cat: "عواصم" },
    { id: "a6", r: 2, c: 10, word: "تفاح", clue: "نوع شهير من الفاكهة (أحمر أو أخضر أو أصفر)", cat: "ثمار" },

    { id: "a7", r: 4, c: 1, word: "حبة", clue: "نبات يستخدم في الطب - أو قرص دواء علاجي", cat: "صحة" },
    { id: "a8", r: 4, c: 6, word: "أسد", clue: "ملك الغابة ومن أشرس الحيوانات المفترسة", cat: "حيوان" },
    { id: "a9", r: 4, c: 11, word: "نهار", clue: "عكس الليل وضياؤه الممتد من الفجر للمغرب", cat: "أضداد" },

    { id: "a10", r: 6, c: 0, word: "موسى", clue: "كليم الله ومن أولي العزم من الرسل عليهم السلام", cat: "أنبياء" },
    { id: "a11", r: 6, c: 5, word: "بغداد", clue: "دار السلام وعاصمة العراق العريقة على نهر دجلة", cat: "عواصم" },
    { id: "a12", r: 6, c: 12, word: "قلم", clue: "أداة للكتابة والتدوين أقسم الله بها في القرآن الكريم", cat: "أدوات" },

    { id: "a13", r: 8, c: 1, word: "عقب", clue: "مؤخرة القدم - أو الشيء الذي يعقب غيره", cat: "لغة" },
    { id: "a14", r: 8, c: 5, word: "خاسر", clue: "ضد الرابح والفائز في المنافسة والمسابقة", cat: "أضداد" },
    { id: "a15", r: 8, c: 11, word: "رباط", clue: "عاصمة المملكة المغربية العريقة على المحيط الأطلسي", cat: "عواصم" },

    { id: "a16", r: 10, c: 0, word: "أحد", clue: "جبل تاريخي في المدينة المنورة - ورقم فردي أولي", cat: "تاريخ" },
    { id: "a17", r: 10, c: 4, word: "رزاق", clue: "من أسماء الله الحسنى (المتكفل بأقوات جميع الخلائق)", cat: "إيمانيات" },
    { id: "a18", r: 10, c: 9, word: "ليل", clue: "عكس النهار ووقت السكون والظلام والهدوء", cat: "أضداد" },
    { id: "a19", r: 10, c: 13, word: "حر", clue: "ضد البرد وشديد السخونة - أو طليق غير مقيد", cat: "أضداد" },

    { id: "a20", r: 12, c: 0, word: "ضرغام", clue: "من أبلغ وأشهر أسماء الأسد في المعاجم العربية", cat: "لغة" },
    { id: "a21", r: 12, c: 7, word: "عمان", clue: "عاصمة المملكة الأردنية الهاشمية الجميلة", cat: "عواصم" },
    { id: "a22", r: 12, c: 12, word: "سمك", clue: "حيوان مائي يعيش في البحار والأنهار ويتنفس بالخياشيم", cat: "حيوان" },

    { id: "a23", r: 14, c: 1, word: "حلوم", clue: "نوع شهير من الجبن الأبيض اللذيذ", cat: "أطعمة" },
    { id: "a24", r: 14, c: 6, word: "جوزة", clue: "ثمرة صلبة ومنها بهارات عطرة (جوزة الطيب)", cat: "نبات" },
    { id: "a25", r: 14, c: 11, word: "حمام", clue: "طائر السلام المشهور بالهديل ورسائل البريد قديماً", cat: "طيور" }
  ],
  down: [
    { id: "d1", r: 0, c: 1, word: "أدب", clue: "فصاحة وبلاغة وحسن أخلاق وثقافة راقية", cat: "ثقافة" },
    { id: "d2", r: 6, c: 0, word: "مطر", clue: "ماء طاهر ينزل من السحاب غيثاً للعباد والزرع", cat: "طبيعة" },
    { id: "d3", r: 10, c: 0, word: "أرض", clue: "كوكبنا وموطن الحياة والبشرية", cat: "علوم" },
    { id: "d4", r: 0, c: 5, word: "بلد", clue: "وطن وإقليم يعيش فيه قوم ذوو تاريخ مشترك", cat: "جغرافيا" },
    { id: "d5", r: 6, c: 5, word: "بذخ", clue: "إفراط في الترف والإنفاق بغير حساب", cat: "أخلاق" },
    { id: "d6", r: 8, c: 11, word: "رجل", clue: "إنسان بالغ عاقل - وقدم المشي والحركة", cat: "صفات" },
    { id: "d7", r: 4, c: 8, word: "دعا", clue: "ابتهل ورجا وتضرع إلى الله وسأله من فضله", cat: "إيمانيات" },
    { id: "d8", r: 10, c: 9, word: "لجا", clue: "اعتصم واحتمى وطلب المأوى والحماية", cat: "لغة" },
    { id: "d9", r: 6, c: 12, word: "قلب", clue: "الفؤاد ومركز المشاعر ومضغة الجسد النابضة", cat: "تشريح" }
  ]
});

// Puzzle 2: "شبكة عواصم العرب وروائع التراث 15×15"
const puzzle2 = createVerifiedPuzzle({
  id: "arab-capitals-heritage",
  title: "شبكة العواصم العربية والتراث",
  subtitle: "رحلة ثقافية ممتعة عبر المدن واللغة والآثار العربية",
  date: "العدد الخاص 102 - مسابقة الثقافة العامة",
  difficulty: "متقدم",
  rows: 15,
  cols: 15,
  across: [
    { id: "p2_a1", r: 0, c: 0, word: "صنعاء", clue: "عاصمة الجمهورية اليمنية ومدينة التراث المعماري الفريد", cat: "عواصم" },
    { id: "p2_a2", r: 0, c: 6, word: "خرطوم", clue: "عاصمة جمهورية السودان عند ملتقى النيلين الأبيض والأزرق", cat: "عواصم" },
    { id: "p2_a3", r: 0, c: 13, word: "حر", clue: "ضد البريد والشتاء القارس", cat: "طبيعة" },

    { id: "p2_a4", r: 2, c: 1, word: "يوسف", clue: "نبي كريم اشتهر بالحسن وجمال الصورة وتأويل الرؤى", cat: "أنبياء" },
    { id: "p2_a5", r: 2, c: 7, word: "قاهرة", clue: "عاصمة مصر ومدينة الألف مئذنة وأكبر مدن العرب", cat: "عواصم" },

    { id: "p2_a6", r: 4, c: 0, word: "دوحة", clue: "عاصمة دولة قطر الجميلة المطلة على الخليج العربي", cat: "عواصم" },
    { id: "p2_a7", r: 4, c: 6, word: "طرابلس", clue: "عروس البحر المتوسط وعاصمة دولة ليبيا", cat: "عواصم" },

    { id: "p2_a8", r: 6, c: 1, word: "مفتاح", clue: "أداة معدنية تستخدم لفتح الأقفال والأبواب الموصدة", cat: "أدوات" },
    { id: "p2_a9", r: 6, c: 8, word: "كريم", clue: "من أسماء الله الحسنى - وضد البخيل اللئيم", cat: "أخلاق" },

    { id: "p2_a10", r: 8, c: 0, word: "طائف", clue: "عروس المصايف السعودية المشهورة بالورد والعنب", cat: "مدن" },
    { id: "p2_a11", r: 8, c: 6, word: "غفور", clue: "من أسماء الله الحسنى كثير العفو والصفح عن التائبين", cat: "إيمانيات" },
    { id: "p2_a12", r: 8, c: 12, word: "موز", clue: "فاكهة استوائية صفراء محبوبة للصغار والكبار", cat: "ثمار" },

    { id: "p2_a13", r: 10, c: 1, word: "ليث", clue: "من ألمع أسماء الأسد في الشعر والفروسية العربية", cat: "لغة" },
    { id: "p2_a14", r: 10, c: 6, word: "سلم", clue: "ضد الحرب والدمار - ورمز الأمان والسكينة", cat: "أضداد" },
    { id: "p2_a15", r: 10, c: 11, word: "فقير", clue: "ضد الغني والموسر ذو الحاجة والفاقة", cat: "صفات" },

    { id: "p2_a16", r: 12, c: 0, word: "أشياء", clue: "جمع شيء - وكل موجود له كيان وحقيقة", cat: "معارف" },
    { id: "p2_a17", r: 12, c: 7, word: "خضر", clue: "نبي أو رجل صالح صاحب نبي الله موسى - وخضروات مائدة", cat: "تاريخ" },

    { id: "p2_a18", r: 14, c: 1, word: "دمشق", clue: "عاصمة سوريا الفيحاء وأقدم حواضر الشام", cat: "عواصم" },
    { id: "p2_a19", r: 14, c: 8, word: "بيروت", clue: "عاصمة لبنان وسويسرا الشرق وست الدنيا", cat: "عواصم" }
  ],
  down: [
    { id: "p2_d1", r: 0, c: 0, word: "صوت", clue: "أثر مسموع يدركه السمع في الآذان", cat: "فيزياء" },
    { id: "p2_d2", r: 2, c: 1, word: "يد", clue: "جارحة الإنسان التي يبطش بها ويكتب", cat: "تشريح" },
    { id: "p2_d4", r: 2, c: 7, word: "قمر", clue: "جرم سماوي ونيّر الليل ورمز الجمال", cat: "فلك" },
    { id: "p2_d5", r: 4, c: 0, word: "درهم", clue: "عملة فضية تاريخية شهيرة لدى العرب", cat: "اقتصاد" },
    { id: "p2_d6", r: 8, c: 0, word: "طير", clue: "كائن ذو ريش وجناحين يطير في كبد السماء", cat: "حيوان" },
    { id: "p2_d7", r: 6, c: 11, word: "ماء", clue: "سر الحياة وأعظم نعمة تشربها الكائنات", cat: "طبيعة" },
    { id: "p2_d8", r: 10, c: 11, word: "فجر", clue: "أول ضوء الصباح وإشراقة النهار", cat: "وقت" },
    { id: "p2_d9", r: 10, c: 14, word: "رمز", clue: "إشارة وعلامة تدل على معنى أعمق", cat: "لغة" }
  ]
});

// Puzzle 3: "الشبكة السريعة المصغرة 9×9"
const puzzle3 = createVerifiedPuzzle({
  id: "quick-crossword-9x9",
  title: "الشبكة السريعة المصغرة (9×9)",
  subtitle: "شبكة رشيقة ومثالية لجولات اللعب السريعة على الهواتف والأجهزة اللوحية",
  date: "جولة التحدي السريع اليومية",
  difficulty: "سهل",
  rows: 9,
  cols: 9,
  across: [
    { id: "p3_a1", r: 0, c: 0, word: "قلم", clue: "أداة للكتابة والتدوين في الدفاتر", cat: "أدوات" },
    { id: "p3_a2", r: 0, c: 4, word: "تفاح", clue: "فاكهة لذيذة ومفيدة للصحة حمراء أو خضراء", cat: "ثمار" },

    { id: "p3_a3", r: 2, c: 1, word: "موز", clue: "فاكهة استوائية صفراء غنية بالطاقة", cat: "ثمار" },
    { id: "p3_a4", r: 2, c: 5, word: "أسد", clue: "ملك الغابة وحيوان مفترس وشجاع", cat: "حيوان" },

    { id: "p3_a5", r: 4, c: 0, word: "نهار", clue: "عكس الليل وضوء الشمس المنير", cat: "أضداد" },
    { id: "p3_a6", r: 4, c: 5, word: "سلم", clue: "ضد الحرب ورمز السلام والمحبة", cat: "أخلاق" },

    { id: "p3_a7", r: 6, c: 1, word: "سمك", clue: "كائن مائي يتنفس بالخياشيم ويعيش في البحار", cat: "حيوان" },
    { id: "p3_a8", r: 6, c: 6, word: "حر", clue: "شديد السخونة ضد البرد", cat: "طبيعة" },

    { id: "p3_a9", r: 8, c: 0, word: "حمام", clue: "طائر السلام المشهور بالهديل الجميل", cat: "طيور" },
    { id: "p3_a10", r: 8, c: 5, word: "ليل", clue: "عكس النهار ووقت النوم والسكينة", cat: "أضداد" }
  ],
  down: [
    { id: "p3_d1", r: 0, c: 0, word: "قرن", clue: "مئة عام - أو جزء صلب على رأس بعض الحيوانات", cat: "زمن" },
    { id: "p3_d2", r: 0, c: 4, word: "تونس", clue: "عاصمة الخضراء الشقيقة", cat: "عواصم" },
    { id: "p3_d3", r: 2, c: 2, word: "وفا", clue: "إخلاص وصدق بالعهد والوعد والمحبة", cat: "أخلاق" },
    { id: "p3_d4", r: 4, c: 5, word: "سيف", clue: "سلاح أبيض من تراث الفروسية والشجاعة", cat: "تراث" },
    { id: "p3_d5", r: 4, c: 7, word: "مطر", clue: "غيث السماء وخير الأرض", cat: "طبيعة" }
  ]
});

// Output TypeScript code
const tsContent = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Auto-generated and verified crossword puzzle collection for Abu Salma Crossword.
 */

export interface CellData {
  row: number;
  col: number;
  isBlack: boolean;
  solution: string;
  number: number | null;
  hasArrowLeft: boolean;
  hasArrowDown: boolean;
  acrossClueId: string | null;
  downClueId: string | null;
}

export interface ClueItem {
  id: string;
  num?: number;
  row: number;
  col: number;
  length: number;
  answer: string;
  clue: string;
  category: string;
  dir: 'across' | 'down';
}

export interface PuzzleDefinition {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  difficulty: 'سهل' | 'متوسط' | 'متقدم';
  rows: number;
  cols: number;
  totalLetters: number;
  grid: CellData[][];
  clues: {
    across: ClueItem[];
    down: ClueItem[];
  };
}

export const PUZZLES: PuzzleDefinition[] = ${JSON.stringify([puzzle1, puzzle2, puzzle3], null, 2)};
`;

const outDir = path.join(__dirname, '../src/data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
fs.writeFileSync(path.join(outDir, 'puzzles.ts'), tsContent, 'utf-8');
console.log("Successfully generated /src/data/puzzles.ts!");
