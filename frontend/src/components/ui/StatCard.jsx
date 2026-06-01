export default function StatCard({ icon, label, value, sub, subColor = 'text-outline', iconBg = 'bg-primary/10', iconColor = 'text-primary' }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm flex items-center gap-lg">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-label-sm text-outline uppercase tracking-wider truncate">{label}</p>
        <h3 className="text-headline-lg mt-xs">{value}</h3>
        {sub && <p className={`text-label-sm mt-xs ${subColor}`}>{sub}</p>}
      </div>
    </div>
  )
}
