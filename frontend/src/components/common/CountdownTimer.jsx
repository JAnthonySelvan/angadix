import React, { useState, useEffect } from 'react';

export const CountdownTimer = ({ targetHours = 24 }) => {
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

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center justify-center bg-black text-white rounded-xl px-3.5 py-2 min-w-[56px] border border-slate-800 shadow-md">
        <span className="text-xl font-black font-mono leading-none tracking-tight">{padZero(timeLeft.hours)}</span>
        <span className="text-[9px] font-bold tracking-widest uppercase opacity-80 mt-1">HRS</span>
      </div>
      <span className="text-black font-black text-2xl dark:text-white">:</span>
      <div className="flex flex-col items-center justify-center bg-black text-white rounded-xl px-3.5 py-2 min-w-[56px] border border-slate-800 shadow-md">
        <span className="text-xl font-black font-mono leading-none tracking-tight">{padZero(timeLeft.minutes)}</span>
        <span className="text-[9px] font-bold tracking-widest uppercase opacity-80 mt-1">MIN</span>
      </div>
      <span className="text-black font-black text-2xl dark:text-white">:</span>
      <div className="flex flex-col items-center justify-center bg-black text-white rounded-xl px-3.5 py-2 min-w-[56px] border border-slate-800 shadow-md">
        <span className="text-xl font-black font-mono leading-none tracking-tight">{padZero(timeLeft.seconds)}</span>
        <span className="text-[9px] font-bold tracking-widest uppercase opacity-80 mt-1">SEC</span>
      </div>
    </div>
  );
};
