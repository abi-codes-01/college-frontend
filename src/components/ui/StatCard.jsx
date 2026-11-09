import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function AnimatedNumber({ value = 0, suffix = '' }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    if (target === 0) {
      setDisplay(0);
      return;
    }
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 20));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setDisplay(target);
        clearInterval(timer);
      } else {
        setDisplay(current);
      }
    }, 24);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}

export default function StatCard({
  label,
  value,
  suffix = '',
  subtitle,
  icon: Icon,
  iconBg = 'bg-indigo-50 text-indigo-600',
  borderClass = 'border-slate-200',
  valueClass = 'text-slate-900',
  onClick,
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`bg-white p-5 sm:p-6 rounded-2xl border ${borderClass} shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex items-start justify-between gap-4 text-left ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="space-y-1 min-w-0">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          {label}
        </span>
        <div className={`text-2xl sm:text-3xl font-extrabold ${valueClass}`}>
          {typeof value === 'number' ? (
            <AnimatedNumber value={value} suffix={suffix} />
          ) : (
            value
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 font-medium pt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>

      {Icon && (
        <div
          className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shrink-0 shadow-sm`}
        >
          <Icon className="w-6 h-6" />
        </div>
      )}
    </motion.div>
  );
}
