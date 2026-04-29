import { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ title, onClose, children, size = 'md' }) => {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full ${widths[size]} bg-[#0d1117] border border-[#21262d] rounded-xl shadow-2xl`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262d]">
          <h2 className="text-base font-semibold text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};
