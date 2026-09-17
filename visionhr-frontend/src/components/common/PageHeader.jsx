export default function PageHeader({ title, description, actions, backButton }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {backButton && <div className="mb-3">{backButton}</div>}
        <h1 className="text-xl font-semibold text-ink">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-ink-faint">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  );
}
