/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AI Assistant Modal (مساعد أبو سلمى الذكي) for Abu Salma Crossword.
 * Offers clever linguistic hints, historical trivia, and gentle guidance without spoiling the answer.
 */

import React, { useState } from 'react';
import { ClueItem } from '../data/puzzles';
import { Sparkles, HelpCircle, X, Lightbulb, BookOpen, Compass, Check } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface AIHintModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeClue: ClueItem | null;
  onRevealFirstLetter: () => void;
  onRevealWord: () => void;
}

export const AIHintModal: React.FC<AIHintModalProps> = ({
  isOpen,
  onClose,
  activeClue,
  onRevealFirstLetter,
  onRevealWord,
}) => {
  const [hintType, setHintType] = useState<'riddle' | 'trivia' | 'letters'>('riddle');
  const [generatedHint, setGeneratedHint] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !activeClue) return null;

  const handleGenerateAIHint = async (type: 'riddle' | 'trivia' | 'letters') => {
    setHintType(type);
    setIsLoading(true);
    setGeneratedHint(null);

    try {
      const apiKey = process.env.GEMINI_API_KEY || (typeof window !== 'undefined' ? (window as unknown as { GEMINI_API_KEY?: string }).GEMINI_API_KEY : '');
      
      if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
        const ai = new GoogleGenAI({ apiKey });
        let prompt = '';

        if (type === 'riddle') {
          prompt = `أنت مساعد لعبة الكلمات المتقاطعة العربية الشهيرة (مساعد أبو سلمى).
السؤال هو: "${activeClue.clue}".
الإجابة الصحيحة هي: "${activeClue.answer}".
المطلوب: قدّم تلميحاً ذكياً ولطيفاً وموجزاً جداً باللغة العربية الفصحى (في جملة أو جملتين فقط) يقرب الفكرة للاعب ويحفز تفكيره دون أن تذكر الكلمة نفسها إطلاقاً ولا تفضح الإجابة.`;
        } else if (type === 'trivia') {
          prompt = `أنت باحث ثقافي في لعبة الكلمات المتقاطعة العربية.
السؤال هو: "${activeClue.clue}".
الإجابة الصحيحة هي: "${activeClue.answer}".
المطلوب: اذكر معلومة تاريخية أو جغرافية أو لغوية شيقة ومفيدة في جملتين موجزتين عن هذا الموضوع دون ذكر الكلمة صراحة.`;
        } else {
          prompt = `أنت مدقق لغوي في لعبة كلمات متقاطعة.
الكلمة المستهدفة هي "${activeClue.answer}" لتعريف: "${activeClue.clue}".
المطلوب: اذكر الوزن الصرفي للكلمة أو الحرف الأول والأخير وطريقة صياغتها في سطر واحد وموجز جداً.`;
        }

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        if (response.text) {
          setGeneratedHint(response.text.trim());
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Fallback to rich pre-crafted educational heuristic hints
    }

    // Heuristic fallbacks that always work offline / with no key
    setTimeout(() => {
      if (type === 'riddle') {
        setGeneratedHint(
          `💡 تلميح أبو سلمى: الكلمة تتكون من ${activeClue.length} حروف، وتبدأ بحرف (${activeClue.answer[0]}) وتنتهي بحرف (${activeClue.answer[activeClue.length - 1]}). فكّر في المعنى المجازي أو السياق العربي الشائع!`
        );
      } else if (type === 'trivia') {
        setGeneratedHint(
          `📚 معلومة إضافية: هذا المفهوم أو الاسم يرتبط بتصنيف (${activeClue.category || 'العام'}) ويعد من الكلمات الكلاسيكية الأصيلة في معاجم وجرائد الكلمات المتقاطعة العربية.`
        );
      } else {
        setGeneratedHint(
          `🔤 التركيب اللفظي: الكلمة مكوّنة من ${activeClue.length} مقاطع صوتية متناسقة، وأول حرفين هما: "${activeClue.answer.slice(0, 2)}".`
        );
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs no-print select-none">
      <div className="w-full max-w-md bg-[#FAF7F0] border-2 border-[#362D1F] rounded-2xl p-5 shadow-2xl relative text-right">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-full hover:bg-[#EBE2D0] text-[#5C503D] cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-[#EFE3C8] border border-[#C5B391] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#8F6106]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#2A2318]">مساعد أبو سلمى الذكي</h3>
            <p className="text-xs text-[#756651]">تلميحات ذكية دون حرق الإجابة</p>
          </div>
        </div>

        {/* Target Clue Summary */}
        <div className="p-3 bg-[#EFE8DA] rounded-xl border border-[#D9CDB8] mb-4">
          <div className="flex items-center justify-between text-xs text-[#6E5F4A] mb-1">
            <span>{activeClue.dir === 'across' ? 'أفقي ◀' : 'عمودي ▼'}</span>
            <span>{activeClue.length} حروف</span>
          </div>
          <p className="font-amiri font-bold text-base text-[#1E1911]">
            "{activeClue.clue}"
          </p>
        </div>

        {/* Hint Options */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => handleGenerateAIHint('riddle')}
            className={`p-2 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              hintType === 'riddle' && generatedHint
                ? 'bg-[#3A3122] text-white border-[#3A3122]'
                : 'bg-white border-[#D6CABB] text-[#473B2A] hover:bg-[#F2ECE0]'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>لغز تقريبي</span>
          </button>

          <button
            onClick={() => handleGenerateAIHint('trivia')}
            className={`p-2 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              hintType === 'trivia' && generatedHint
                ? 'bg-[#3A3122] text-white border-[#3A3122]'
                : 'bg-white border-[#D6CABB] text-[#473B2A] hover:bg-[#F2ECE0]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>معلومة ثقافية</span>
          </button>

          <button
            onClick={() => handleGenerateAIHint('letters')}
            className={`p-2 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              hintType === 'letters' && generatedHint
                ? 'bg-[#3A3122] text-white border-[#3A3122]'
                : 'bg-white border-[#D6CABB] text-[#473B2A] hover:bg-[#F2ECE0]'
            }`}
          >
            <Compass className="w-4 h-4 text-indigo-600" />
            <span>تلميح لغوي</span>
          </button>
        </div>

        {/* Generated Hint Display */}
        {isLoading && (
          <div className="py-6 text-center text-xs text-[#7A6B56] flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-[#8F6106] border-t-transparent rounded-full animate-spin" />
            <span>يجري التفكير في تلميح ملائم...</span>
          </div>
        )}

        {generatedHint && !isLoading && (
          <div className="p-3.5 bg-white rounded-xl border border-[#D1C3AD] text-sm font-amiri leading-relaxed text-[#2B2418] mb-4 shadow-inner">
            {generatedHint}
          </div>
        )}

        {/* Instant Letter/Word Reveal Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#DFD3BF]">
          <button
            onClick={() => {
              onRevealFirstLetter();
              onClose();
            }}
            className="flex-1 py-2 px-3 rounded-lg bg-[#EFE7D8] hover:bg-[#E3D9C6] text-[#3D3323] text-xs font-semibold border border-[#CBBDA5] transition-colors cursor-pointer"
          >
            كشف الحرف الأول ({activeClue.answer[0]})
          </button>

          <button
            onClick={() => {
              onRevealWord();
              onClose();
            }}
            className="flex-1 py-2 px-3 rounded-lg bg-[#383024] hover:bg-[#251F16] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            كشف الكلمة بالكامل
          </button>
        </div>
      </div>
    </div>
  );
};
