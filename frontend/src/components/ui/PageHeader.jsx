export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl">
      <div>
        <h1 className="text-headline-lg text-on-surface">{title}</h1>
        {subtitle && <p className="text-body-md text-on-surface-variant mt-xs">{subtitle}</p>}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-sm">
          {children}
        </div>
      )}
    </div>
  )
}
