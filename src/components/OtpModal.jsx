import { useState, useEffect, useRef } from "react";
import { X, ShieldCheck, RefreshCw, Loader2 } from "lucide-react";

export default function OtpModal({
  otpState,
  onClose,
  onVerify,
  onResend,
  t,
  lang,
}) {
  const [code, setCode] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);

  // Focus the first input box when modal opens
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Countdown timer for resending code
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Handle key input
  const handleChange = (index, val) => {
    const newVal = val.replace(/\D/g, ""); // Only allow digits
    if (!newVal) return;

    const updatedCode = [...code];
    // If user pasted a 6-digit code
    if (newVal.length === 6) {
      const digits = newVal.split("");
      setCode(digits);
      inputRefs.current[5]?.focus();
      return;
    }

    // Normal single-digit input
    updatedCode[index] = newVal[newVal.length - 1];
    setCode(updatedCode);

    // Shift focus to the next input box
    if (index < 5 && newVal) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace and deletion focus shift
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!code[index] && index > 0) {
        // Shift focus backwards
        const updatedCode = [...code];
        updatedCode[index - 1] = "";
        setCode(updatedCode);
        inputRefs.current[index - 1]?.focus();
      } else {
        const updatedCode = [...code];
        updatedCode[index] = "";
        setCode(updatedCode);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalCode = code.join("");
    if (finalCode.length === 6) {
      onVerify(finalCode);
    }
  };

  const handleResendClick = () => {
    setCode(Array(6).fill(""));
    setTimer(60);
    onResend();
    inputRefs.current[0]?.focus();
  };

  const formatPhone = (phone) => {
    if (!phone) return "";
    return phone.replace(/(\+\d{2})(\d{3})(\d{3})(\d+)/, "$1 $2 $3 $4");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with extreme glassmorphism */}
      <div 
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-xl transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/70 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:border-white/20 p-8 flex flex-col items-center">
        {/* Glow Effects */}
        <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-brand-orange/10 blur-3xl pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 h-40 w-40 rounded-full bg-brand-blue/10 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100/50 transition-all"
        >
          <X size={20} />
        </button>

        {/* Shield Icon Header */}
        <div className="mb-6 h-16 w-16 rounded-full bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20 animate-pulse">
          <ShieldCheck className="text-brand-orange" size={32} />
        </div>

        {/* Title & Desc */}
        <h3 className="text-xl font-black text-stone-800 mb-2 tracking-tight text-center">
          {t.enterOtpTitle || "Verify Your Phone"}
        </h3>
        <p className="text-xs text-stone-500 font-medium text-center mb-8 max-w-xs leading-relaxed">
          {t.enterOtpDesc ? t.enterOtpDesc.replace("{phone}", formatPhone(otpState.phone)) : `We sent a code to ${formatPhone(otpState.phone)}`}
        </p>

        {/* OTP Input Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <div className="flex gap-2.5 mb-6 justify-center" dir="ltr">
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 bg-white/80 border border-stone-200 focus:border-brand-orange text-center text-xl font-black rounded-2xl text-stone-800 focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all shadow-sm shadow-stone-100"
              />
            ))}
          </div>

          {/* Error Message */}
          {otpState.error && (
            <div className="text-xs font-bold text-red-500 mb-4 bg-red-50 border border-red-100 px-4 py-2 rounded-xl text-center w-full">
              {otpState.error}
            </div>
          )}

          {/* Verify Button */}
          <button
            type="submit"
            disabled={code.join("").length < 6 || otpState.loading}
            className="w-full bg-gradient-to-r from-brand-orange to-amber-500 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/35 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
          >
            {otpState.loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{t.loading || "Verifying..."}</span>
              </>
            ) : (
              <span>{t.verifyBtn || "Verify & Confirm"}</span>
            )}
          </button>
        </form>

        {/* Cooldown Timer / Resend Action */}
        <div className="mt-8 flex items-center gap-2">
          {timer > 0 ? (
            <span className="text-xs text-stone-400 font-bold flex items-center gap-1.5">
              <RefreshCw size={14} className="animate-spin text-stone-300" />
              {lang === "ar" ? `إعادة الإرسال بعد ${timer} ثانية` : `Resend in ${timer}s`}
            </span>
          ) : (
            <button
              onClick={handleResendClick}
              disabled={otpState.loading}
              className="text-xs font-black text-brand-orange hover:text-amber-600 transition-colors flex items-center gap-1 hover:underline"
            >
              <span>{t.resendBtn || "Resend Code"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
