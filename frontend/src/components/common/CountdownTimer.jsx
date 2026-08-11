import React, { useState, useEffect } from 'react';

export const CountdownTimer = ({ targetHours = 24, variant = 'default' }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const endTime = Date.now() + (8 * 3600 + 45 * 60 + 30) * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const difference = Math.max(0, endTime - now);

      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds });

      if (difference <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetHours]);

  const padZero = (num) => String(num).padStart(2, '0');

  if (variant === 'sharp' || variant === 'flash') {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex flex-col items-center justify-center bg-[#0a2540] dark:bg-[#050c18]/90 text-white rounded-none px-3.5 sm:px-5 py-2.5 sm:py-3 min-w-[64px] sm:min-w-[76px] border border-[#0a2540] dark:border-sky-500/35 shadow-md backdrop-blur-md">
          <span className="text-2xl sm:text-3xl font-black font-mono leading-none tracking-tight text-white dark:text-sky-400">
            {padZero(timeLeft.hours)}
          </span>
          <span className="text-[9px] font-extrabold tracking-[0.2em] uppercase mt-1.5 text-sky-200 dark:text-sky-200/80">HOURS</span>
        </div>
        <span className="text-[#0a2540] dark:text-sky-400 font-black text-xl sm:text-2xl animate-pulse">:</span>
        <div className="flex flex-col items-center justify-center bg-[#0a2540] dark:bg-[#050c18]/90 text-white rounded-none px-3.5 sm:px-5 py-2.5 sm:py-3 min-w-[64px] sm:min-w-[76px] border border-[#0a2540] dark:border-sky-500/35 shadow-md backdrop-blur-md">
          <span className="text-2xl sm:text-3xl font-black font-mono leading-none tracking-tight text-white dark:text-sky-400">
            {padZero(timeLeft.minutes)}
          </span>
          <span className="text-[9px] font-extrabold tracking-[0.2em] uppercase mt-1.5 text-sky-200 dark:text-sky-200/80">MINS</span>
        </div>
        <span className="text-[#0a2540] dark:text-sky-400 font-black text-xl sm:text-2xl animate-pulse">:</span>
        <div className="flex flex-col items-center justify-center bg-rose-600 dark:bg-[#050c18]/90 text-white rounded-none px-3.5 sm:px-5 py-2.5 sm:py-3 min-w-[64px] sm:min-w-[76px] border border-rose-600 dark:border-rose-500/40 shadow-md backdrop-blur-md">
          <span className="text-2xl sm:text-3xl font-black font-mono leading-none tracking-tight text-white dark:text-rose-400">
            {padZero(timeLeft.seconds)}
          </span>
          <span className="text-[9px] font-extrabold tracking-[0.2em] uppercase mt-1.5 text-rose-100 dark:text-rose-300/90">SECS</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center justify-center bg-[#0a2540] dark:bg-slate-950 text-white rounded-2xl px-4 py-2.5 min-w-[62px] border border-slate-800 dark:border-slate-700 shadow-md">
        <span className="text-2xl font-black font-mono leading-none tracking-tight text-white dark:text-sky-400">{padZero(timeLeft.hours)}</span>
        <span className="text-[9px] font-extrabold tracking-widest uppercase mt-1 text-slate-300 dark:text-slate-400">HRS</span>
      </div>
      <span className="text-[#0a2540] dark:text-sky-400 font-black text-2xl">:</span>
      <div className="flex flex-col items-center justify-center bg-[#0a2540] dark:bg-slate-950 text-white rounded-2xl px-4 py-2.5 min-w-[62px] border border-slate-800 dark:border-slate-700 shadow-md">
        <span className="text-2xl font-black font-mono leading-none tracking-tight text-white dark:text-sky-400">{padZero(timeLeft.minutes)}</span>
        <span className="text-[9px] font-extrabold tracking-widest uppercase mt-1 text-slate-300 dark:text-slate-400">MIN</span>
      </div>
      <span className="text-[#0a2540] dark:text-sky-400 font-black text-2xl">:</span>
      <div className="flex flex-col items-center justify-center bg-[#0a2540] dark:bg-slate-950 text-white rounded-2xl px-4 py-2.5 min-w-[62px] border border-slate-800 dark:border-slate-700 shadow-md">
        <span className="text-2xl font-black font-mono leading-none tracking-tight text-white dark:text-sky-400">{padZero(timeLeft.seconds)}</span>
        <span className="text-[9px] font-extrabold tracking-widest uppercase mt-1 text-slate-300 dark:text-slate-400">SEC</span>
      </div>
    </div>
  );
};
