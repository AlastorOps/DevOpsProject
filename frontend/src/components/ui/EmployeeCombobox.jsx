import { useState, useEffect, useRef } from 'react'

/**
 * Searchable employee combobox.
 * Props:
 *   employees    – array of { id, name, emp_id, position? }
 *   value        – selected employee_id string ('' for none)
 *   onChange     – (id: string) => void
 *   error        – optional error message string
 *   loading      – show loading state
 *   placeholder  – input placeholder
 *   showPosition – when true, show position title in dropdown items
 */
export default function EmployeeCombobox({
  employees,
  value,
  onChange,
  error,
  loading = false,
  placeholder = 'Search employee…',
  showPosition = false,
}) {
  const [search, setSearch] = useState('')
  const [open, setOpen]     = useState(false)
  const ref                 = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = search.trim()
    ? employees.filter(e =>
        `${e.name} ${e.emp_id} ${e.position?.title ?? ''}`.toLowerCase().includes(search.toLowerCase())
      )
    : employees

  const selected = employees.find(e => e.id === value)

  return (
    <div className="relative" ref={ref}>
      <input
        className={`w-full bg-surface border rounded-lg p-md text-body-md focus:ring-1 outline-none ${error ? 'border-error focus:ring-error' : 'border-outline-variant focus:ring-primary'}`}
        placeholder={loading ? 'Loading employees…' : placeholder}
        disabled={loading}
        value={open ? search : (selected ? `${selected.name} (${selected.emp_id})` : '')}
        onFocus={() => { setOpen(true); setSearch('') }}
        onChange={e => { setSearch(e.target.value); setOpen(true) }}
      />
      {open && (
        <ul className="absolute z-50 mt-1 w-full bg-surface border border-outline-variant rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {loading ? (
            <li className="px-md py-sm text-body-md text-on-surface-variant flex items-center gap-sm">
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              Loading employees…
            </li>
          ) : filtered.length === 0 ? (
            <li className="px-md py-sm text-body-md text-on-surface-variant">No employees found</li>
          ) : filtered.map(emp => (
            <li
              key={emp.id}
              className={`px-md py-sm text-body-md cursor-pointer hover:bg-surface-container transition-colors ${value === emp.id ? 'bg-primary/10 text-primary font-bold' : ''}`}
              onMouseDown={() => { onChange(emp.id); setSearch(''); setOpen(false) }}
            >
              <span>{emp.name}</span>
              <span className="text-on-surface-variant text-label-sm"> ({emp.emp_id})</span>
              {showPosition && emp.position?.title && (
                <span className="text-on-surface-variant text-label-sm"> · {emp.position.title}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
