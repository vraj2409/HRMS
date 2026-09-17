const TONES = {
  Pending: 'bg-amber-50 text-amber-600',
  Approved: 'bg-primary-50 text-primary-600',
  Rejected: 'bg-rose-50 text-rose-600',
  Cancelled: 'bg-canvas text-ink-faint',
  Draft: 'bg-canvas text-ink-soft',
  Processed: 'bg-primary-50 text-primary-600',
  Paid: 'bg-primary-50 text-primary-600',
};

export default function Badge({ children, tone }) {
  const cls = TONES[tone] || TONES[children] || 'bg-canvas text-ink-soft';
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {children}
    </span>
  );
}
