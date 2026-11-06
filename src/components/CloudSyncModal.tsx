/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Cloud Sync Modal for Abu Salma Crossword.
 * Allows users to choose between Local Storage and Firebase Firestore cross-device synchronization.
 */

import React, { useState } from 'react';
import { Cloud, CloudCheck, HardDrive, LogIn, LogOut, RefreshCw, X, ShieldCheck, Smartphone, Laptop } from 'lucide-react';
import { User } from 'firebase/auth';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSignInWithGoogle: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onManualSync: () => Promise<void>;
  lastSyncedAt: Date | null;
  isSyncing: boolean;
  storageMode: 'local' | 'cloud';
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignInWithGoogle,
  onSignOut,
  onManualSync,
  lastSyncedAt,
  isSyncing,
  storageMode,
}) => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async () => {
    setAuthError(null);
    setIsAuthenticating(true);
    try {
      await onSignInWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'تعذر تسجيل الدخول';
      setAuthError(msg);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    setAuthError(null);
    try {
      await onSignOut();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'تعذر تسجيل الخروج';
      setAuthError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-amiri" dir="rtl">
      <div className="bg-[#FAF7F0] border-3 border-[#2A2318] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[#EDE5D5] border-b-2 border-[#D8CCB7]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#3A3123] rounded-lg text-amber-300">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-kufi text-lg text-[#251E15]">
                مزامنة التقدم عبر الأجهزة
              </h3>
              <p className="text-xs text-[#6E5F4A]">
                Firebase Firestore & التخزين المحلي
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#DDD2C0] text-[#554736] cursor-pointer transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-4">
          {/* Storage Mode Selector Card */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold text-[#554736]">
              وضع حفظ التقدم الحالي:
            </span>

            {/* Cloud Firestore Card */}
            <div className={`p-3.5 rounded-xl border-2 transition-all ${
              currentUser 
                ? 'bg-[#EBF7EE] border-[#489456] shadow-xs' 
                : 'bg-white border-[#D6CAB6]'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${currentUser ? 'bg-[#2E7D32] text-white' : 'bg-[#EFE7D8] text-[#695B47]'}`}>
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1F1912] flex items-center gap-1.5">
                      <span>المزامنة السحابية (Firebase Firestore)</span>
                      {currentUser && (
                        <span className="text-[10px] bg-[#2E7D32] text-white px-2 py-0.5 rounded-full font-sans font-bold">
                          مفعلة
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-[#635543] mt-0.5">
                      تتيح لك بدء حل اللغز على هاتفك وإكماله من حاسوبك أو جهاز لوحي بنفس التقدم تلقائياً.
                    </p>
                  </div>
                </div>
              </div>

              {/* Logged in state */}
              {currentUser ? (
                <div className="mt-3 pt-3 border-t border-[#CCE5D2] flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#3A7545] font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>متصل بحساب: <strong>{currentUser.displayName || currentUser.email}</strong></span>
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-xs text-[#A83232] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>خروج</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#635543]">
                    <span>
                      {lastSyncedAt 
                        ? `آخر مزامنة: ${lastSyncedAt.toLocaleTimeString('ar-SA')}` 
                        : 'جاري المزامنة...'}
                    </span>
                    <button
                      onClick={onManualSync}
                      disabled={isSyncing}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#387C44] hover:bg-[#2B6135] text-white text-xs font-bold cursor-pointer transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'مزامنة...' : 'مزامنة الآن'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Not logged in prompt */
                <div className="mt-3 pt-3 border-t border-[#E8DDCC]">
                  <button
                    onClick={handleLogin}
                    disabled={isAuthenticating}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#2A2317] hover:bg-[#1C160E] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <LogIn className="w-4 h-4 text-amber-300" />
                    <span>{isAuthenticating ? 'جاري الاتصال...' : 'تسجيل الدخول بحساب Google لتفعيل المزامنة'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Local Storage Card (Always active as offline baseline) */}
            <div className={`p-3 rounded-xl border transition-all ${
              !currentUser 
                ? 'bg-[#FFF9EC] border-[#D4A328]' 
                : 'bg-white border-[#E5DAC8] opacity-80'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#EFE7D8] text-[#695B47]">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#2A2317] flex items-center gap-1.5">
                    <span>التخزين المحلي (Local Storage)</span>
                    {!currentUser && (
                      <span className="text-[10px] bg-[#75591A] text-white px-1.5 py-0.5 rounded-full font-sans">
                        الوضع الافتراضي
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-[#716350]">
                    يتم حفظ تقدمك تلقائياً على هذا المتصفح دون الحاجة لتسجيل الدخول أو الاتصال بالإنترنت.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {authError && (
            <div className="p-2.5 rounded-lg bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-xs">
              ⚠️ {authError}
            </div>
          )}

          {/* Device illustration */}
          <div className="flex items-center justify-center gap-3 p-3 bg-[#EFE8D9] rounded-xl text-[#635543] text-xs">
            <Smartphone className="w-4 h-4 text-[#3B3224]" />
            <span className="font-mono text-sm">⇄</span>
            <Laptop className="w-4 h-4 text-[#3B3224]" />
            <span className="text-[11px] font-semibold">حل اللغز ينتقل معك أينما كنت فورياً</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#EDE5D5] border-t border-[#DDD1BE] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#3A3123] text-white text-xs font-bold hover:bg-[#261F15] transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
