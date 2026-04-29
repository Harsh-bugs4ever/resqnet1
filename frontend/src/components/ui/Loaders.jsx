export const Spinner = ({ size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <svg className={`animate-spin ${sizes[size]} text-blue-400`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
};

export const PageLoader = () => (
  <div className="flex flex-col items-center justify-center h-screen gap-4 bg-[#060910]">
    <div className="relative">
      <div className="w-16 h-16 rounded-full border-2 border-red-500/30 flex items-center justify-center">
        <span className="text-2xl font-black text-red-400" style={{ fontFamily: 'Syne, sans-serif' }}>R</span>
      </div>
      <div className="absolute inset-0 rounded-full border-t-2 border-red-500 animate-spin" />
    </div>
    <p className="text-gray-500 text-sm font-mono">Initializing ResQNet...</p>
  </div>
);

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
    {Icon && <Icon size={40} className="text-gray-600" />}
    <p className="text-gray-300 font-semibold">{title}</p>
    {description && <p className="text-gray-500 text-sm max-w-xs">{description}</p>}
    {action}
  </div>
);

export const SectionLoader = () => (
  <div className="flex items-center justify-center py-12">
    <Spinner />
  </div>
);
