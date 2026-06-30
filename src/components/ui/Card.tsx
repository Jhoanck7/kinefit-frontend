export function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  // v4 asocia de inmediato "bg-card" y "rounded-global"
  return (
    <div className={`bg-card border border-gray-100 p-6 shadow-sm rounded-global ${className}`}>
      {children}
    </div>
  );
}