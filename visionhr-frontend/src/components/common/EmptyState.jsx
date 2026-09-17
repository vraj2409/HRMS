export default function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && <p className="text-sm text-ink-faint">{description}</p>}
    </div>
  );
}
