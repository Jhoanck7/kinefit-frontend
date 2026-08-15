export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-slate-50 border border-slate-300 p-6 rounded-xl ${className}`}
    >
      {children}
    </div>
  );
}
