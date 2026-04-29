const fieldBase = 'w-full rounded px-3 py-2 text-sm bg-[#0d1117] border border-[#21262d] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors';

export const Input = ({ label, error, className = '', ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs text-gray-400 font-medium">{label}</label>}
    <input className={`${fieldBase} ${error ? 'border-red-500' : ''} ${className}`} {...props} />
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

export const Select = ({ label, error, children, className = '', ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs text-gray-400 font-medium">{label}</label>}
    <select className={`${fieldBase} ${error ? 'border-red-500' : ''} ${className}`} {...props}>
      {children}
    </select>
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

export const Textarea = ({ label, error, className = '', ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs text-gray-400 font-medium">{label}</label>}
    <textarea
      rows={3}
      className={`${fieldBase} resize-none ${error ? 'border-red-500' : ''} ${className}`}
      {...props}
    />
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);
