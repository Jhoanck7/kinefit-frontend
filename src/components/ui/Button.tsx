interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'muted';
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseStyles = "px-6 py-3 font-bold transition-all active:scale-[0.98] cursor-pointer";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-emerald-700 shadow-md",
    muted: "bg-gray-100 text-muted hover:bg-gray-200"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} rounded-global ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
}