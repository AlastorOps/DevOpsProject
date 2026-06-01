export default function EmptyState({ icon = 'search_off', title = 'No results found', description = 'Try adjusting your filters or search terms.', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-2xl px-lg text-center">
      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-lg">
        <span className="material-symbols-outlined text-[32px] text-on-surface-variant opacity-50">{icon}</span>
      </div>
      <h3 className="text-headline-md text-on-surface">{title}</h3>
      <p className="text-body-md text-on-surface-variant mt-xs max-w-sm">{description}</p>
      {action && <div className="mt-lg">{action}</div>}
    </div>
  )
}
