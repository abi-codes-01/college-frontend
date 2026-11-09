import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  badge,
  subtitle,
  maxWidth = 'max-w-lg',
  children,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className={`bg-white rounded-3xl ${maxWidth} w-full max-h-[88vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-5 text-left`}
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-4 gap-4">
              <div>
                {badge && (
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-0.5">
                    {badge}
                  </span>
                )}
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
