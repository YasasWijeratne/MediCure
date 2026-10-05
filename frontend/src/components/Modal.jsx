import React from 'react';

export default function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest border border-surface-container-high/60 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-surface-container flex items-center justify-between sticky top-0 bg-surface-container-lowest/95 backdrop-blur-md z-10">
          <h3 className="font-headline-sm text-base md:text-lg font-bold text-on-surface">
            {title}
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {children}
        </div>

        {/* Optional Modal Footer */}
        {footer && (
          <div className="px-6 py-3.5 border-t border-surface-container flex items-center justify-end gap-3 bg-surface-container-low/30 sticky bottom-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
