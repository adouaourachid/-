/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Vintage Newspaper Visitor Counter (عداد الزوار) for Abu Salma Crossword.
 * Mechanical flip-digit odometer display, live Firestore sync, and authentic newspaper footer styling.
 */

import React, { useEffect, useState } from 'react';
import { Eye, Users, Sparkles } from 'lucide-react';
import { incrementVisitorCount, subscribeToVisitorCount } from '../services/firebase';

export const VisitorCounter: React.FC = () => {
  const [visitorCount, setVisitorCount] = useState<number>(() => {
    try {
      localStorage.removeItem('abu_salma_visitors_local');
      const saved = localStorage.getItem('abu_salma_real_visitors_local');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    // 1. Session check to increment once per browser visit session
    const sessionKey = 'abu_salma_real_session_counted';
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, 'true');
      incrementVisitorCount().then((newCount) => {
        setVisitorCount(newCount);
      });
    }

    // 2. Real-time subscription to live visitor count updates
    const unsubscribe = subscribeToVisitorCount((count) => {
      setVisitorCount(count);
    });

    return () => unsubscribe();
  }, []);

  // Format count into 6 digits: e.g. 1 -> ['0', '0', '0', '0', '0', '1']
  const paddedDigits = visitorCount.toString().padStart(6, '0').split('');

  return (
    <div className="w-full flex flex-col items-center justify-center py-4 px-3 mt-4 border-t-2 border-[#D8CABE] bg-[#F7F3E9]/80 rounded-2xl select-none">
      
      {/* Newspaper Footer Header */}
      <div className="flex items-center gap-2 mb-2.5 text-[#5F503C]">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#EDE5D5] rounded-full border border-[#D5C7B0] text-xs font-amiri font-bold shadow-2xs">
          <Users className="w-3.5 h-3.5 text-[#8A631E]" />
          <span>عداد الزوار الفعلي المباشر (يبدأ من الصفر)</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" title="متصل بالخادم ويحسب فورياً" />
        </div>
      </div>

      {/* Mechanical Odometer Digits Box (شريط العداد الميكانيكي العتيق) */}
      <div className="flex items-center justify-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 bg-[#251E15] rounded-xl border-3 border-[#8D7349] shadow-lg">
        {paddedDigits.map((digit, idx) => (
          <div
            key={idx}
            className="relative w-7 h-10 sm:w-9 sm:h-12 bg-gradient-to-b from-[#1C160F] via-[#2A2217] to-[#140F0A] rounded-md border border-[#4A3D2A] flex items-center justify-center shadow-inner overflow-hidden"
          >
            {/* Top/Bottom Odometer Divider Line */}
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/60 shadow-xs z-10" />

            {/* Glowing Retro Number */}
            <span className="font-mono font-black text-xl sm:text-2xl text-[#FCE7B2] tracking-wider drop-shadow-md select-text">
              {digit}
            </span>

            {/* Subtle Metallic Specular Highlight */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-white/5 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Subtitle / Footer Note */}
      <div className="mt-2 text-center text-[11px] sm:text-xs text-[#7A6A55] font-amiri flex items-center gap-1.5">
        <Eye className="w-3.5 h-3.5 text-[#A37B28]" />
        <span>
          {visitorCount === 0 ? (
            <span>عداد حقيقي مسجل مباشرة من الصفر · أول زيارة مسجلة</span>
          ) : visitorCount === 1 ? (
            <span>
              تم تسجيل <strong className="font-mono text-[#382E20]">زائر حقيقي واحد</strong> حتى الآن
            </span>
          ) : (
            <span>
              إجمالي الزيارات الفعلية المسجلة: <strong className="font-mono text-[#382E20]">{visitorCount.toLocaleString('ar-MA')}</strong> زائر حقيقي
            </span>
          )}
        </span>
        <Sparkles className="w-3 h-3 text-amber-500" />
      </div>

      {/* Copyright & Traditional Print Mark */}
      <div className="mt-3 text-[10px] sm:text-[11px] text-[#938470] font-amiri tracking-wide text-center">
        <span>جريدة «أبو سلمى» الأسبوعية المصورة · جميع الحقوق محفوظة · فاس - الرباط - الدار البيضاء</span>
      </div>
    </div>
  );
};
