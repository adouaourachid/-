/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Hint Ad Popup Modal (صفحة منبثقة لعرض الإشهار عند طلب التلميح).
 * Displays Google AdSense banner with a countdown timer, then automatically
 * closes to grant the crossword hint to the user.
 */

import React, { useEffect, useState } from 'react';
import { Sparkles, X, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

interface HintAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdComplete: () => void;
}

export const HintAdModal: React.FC<HintAdModalProps> = ({
  isOpen,
  onClose,
  onAdComplete,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(4);
  const [canSkip, setCanSkip] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(4);
      setCanSkip(false);
      return;
    }

    // Try to trigger AdSense ad push
    try {
      // @ts-expect-error - adsbygoogle is added via external Google AdSense script
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        // @ts-expect-error - adsbygoogle push
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.warn('AdSense ad push notice:', e);
    }

    // Countdown timer for automatic closing & reward delivery
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Automatically close and give hint
          handleGrantReward();
          return 0;
        }
        if (prev <= 3) {
          setCanSkip(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleGrantReward = () => {
    onClose();
    onAdComplete();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs no-print select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FAF7F0] border-3 border-[#362E20] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Top Header */}
        <div className="bg-[#EDE5D5] border-b-2 border-[#C9BCA7] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FAF0D8] border border-[#CBA758] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#8C6218]" />
            </div>
            <div>
              <h3 className="font-amiri font-bold text-sm sm:text-base text-[#241E15] leading-tight">
                إشهار راعي التلميح المجاني
              </h3>
              <p className="text-[10px] text-[#71614C] font-amiri">
                شاهد الإشهار لدعم الجريدة وكشف الحرف المطلوب
              </p>
            </div>
          </div>

          {/* Skip / Close Button */}
          {canSkip ? (
            <button
              onClick={handleGrantReward}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#382F22] hover:bg-[#251F16] text-white text-xs font-bold cursor-pointer transition-colors"
              title="تخطي والحصول على التلميح"
            >
              <span>تخطي</span>
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#8C651F] bg-[#F3E7CC] px-2 py-0.5 rounded-md border border-[#D9C4A2]">
              <Clock className="w-3 h-3 animate-spin" />
              <span>{secondsRemaining}ث</span>
            </div>
          )}
        </div>

        {/* Ad Container Body */}
        <div className="p-4 flex flex-col items-center justify-center min-h-[260px] bg-white">
          <div className="w-full text-center">
            <span className="text-[9px] uppercase tracking-wider text-[#A09380] font-mono block mb-1">
              إعلان · Advertisement · Google AdSense
            </span>

            {/* Google AdSense Unit */}
            <div className="w-full min-h-[220px] bg-[#FAF8F5] border border-dashed border-[#D5C9B7] rounded-xl flex flex-col items-center justify-center p-3 relative overflow-hidden">
              <ins
                className="adsbygoogle"
                style={{ display: 'block', minWidth: '250px', minHeight: '200px' }}
                data-ad-client="ca-pub-3312377428939400"
                data-ad-slot="hint-reward-slot"
                data-ad-format="auto"
                data-full-width-responsive="true"
              />

              {/* Graceful Fallback if ad is loading or blocked */}
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 rounded-full bg-[#FAF0D8] border border-[#CCA95B] flex items-center justify-center mb-2 shadow-xs">
                  <ShieldCheck className="w-6 h-6 text-[#94691B]" />
                </div>
                <h4 className="font-amiri font-bold text-sm text-[#241E15] mb-1">
                  جاري تجهيز التلميح الخاص بك...
                </h4>
                <p className="font-amiri text-xs text-[#7A6A55] max-w-xs leading-relaxed">
                  شكراً لدعمك شبكة أبو سلمى المغربية. سيتم كشف الحرف في الخانة المحددة تلقائياً بعد ثوانٍ قليلة.
                </p>
              </div>
            </div>
          </div>

          {/* Progress countdown bar */}
          <div className="w-full mt-3">
            <div className="w-full bg-[#E8DEC9] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#D97706] h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${((4 - secondsRemaining) / 4) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#786751] font-amiri mt-1.5">
              <span>سيتم كشف التلميح وإغلاق النافذة تلقائياً</span>
              <span className="font-mono font-bold text-[#271E13]">
                {secondsRemaining > 0 ? `${secondsRemaining} ثانية` : 'اكتمل ✅'}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Action */}
        <div className="bg-[#EFE7D8] border-t border-[#D5C6AF] p-3 flex items-center justify-between gap-2">
          <span className="text-[11px] text-[#74644F] font-amiri">
            {canSkip ? 'يمكنك التخطي الآن أو الانتظار' : 'يرجى الانتظار لحظات...'}
          </span>

          <button
            onClick={handleGrantReward}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2E6B34] hover:bg-[#235328] active:scale-95 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
          >
            <span>الحصول على التلميح الآن</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
