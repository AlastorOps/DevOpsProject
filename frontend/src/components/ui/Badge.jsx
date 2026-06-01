const variants = {
  active:   'bg-secondary-container text-on-secondary-container',
  inactive: 'bg-error-container text-on-error-container',
  leave:    'bg-tertiary-fixed text-on-tertiary-fixed',
  pending:  'bg-primary/10 text-primary',
  approved: 'bg-secondary-container text-on-secondary-container',
  rejected: 'bg-error-container text-on-error-container',
  paid:     'bg-secondary-container text-on-secondary-container',
  unpaid:   'bg-error-container text-on-error-container',
  default:  'bg-surface-container text-on-surface-variant',
}

export default function Badge({ label, variant = 'default' }) {
  const style = variants[variant?.toLowerCase()] ?? variants.default
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-bold ${style}`}>
      {label}
    </span>
  )
}
