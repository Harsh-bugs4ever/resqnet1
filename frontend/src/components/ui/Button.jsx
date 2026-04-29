export const Button = ({
  children, onClick, type = 'button', variant = 'primary',
  size = 'md', disabled = false, loading = false, className = '', icon: Icon,
}) => {
  const base = 'inline-flex items-center gap-2 font-medium rounded transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-400 text-white focus:ring-blue-500',
    danger: 'bg-red-500/80 hover:bg-red-500 text-white focus:ring-red-500',
    success: 'bg-green-600/80 hover:bg-green-600 text-white focus:ring-green-600',
    ghost: 'bg-transparent hover:bg-white/5 text-gray-300 hover:text-white border border-white/10 focus:ring-white/20',
    outline: 'bg-transparent border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 focus:ring-blue-500',
    warning: 'bg-orange-500/80 hover:bg-orange-500 text-white focus:ring-orange-500',
  };

  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  );
};
