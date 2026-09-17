export default function Card({ children, className = '', ...props }) {
  return (
    <div className={`rounded-lg border border-line bg-surface shadow-card ${className}`} {...props}>
      {children}
    </div>
  );
}
