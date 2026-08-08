interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'muted';
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseStyles = "px-6 py-3 font-bold transition-colors cursor-pointer rounded-xl text-sm uppercase tracking-wider";
  
  const variants = {
    primary: "bg-brand-primary text-white hover:bg-brand-primary-hover border border-brand-primary",
    muted: "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
}