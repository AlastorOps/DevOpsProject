import { NavLink } from 'react-router-dom'

export default function Header({ onMenuClick }) {
  return (
    <header className="fixed top-0 right-0 left-0 lg:left-sidebar-width h-16 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant flex items-center justify-between gap-md px-margin-mobile md:px-margin-desktop shadow-sm">
      <button
        aria-label="Open navigation"
        className="lg:hidden shrink-0 rounded-lg p-2 text-on-surface-variant hover:bg-surface-container transition-colors"
        onClick={onMenuClick}
        type="button"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>
      <div className="flex items-center flex-1 min-w-0 max-w-xl">
        <div className="relative w-full group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">search</span>
          <input
            className="w-full bg-surface-container-low border-none rounded-full pl-10 pr-3 py-2 text-body-md focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            placeholder="Search..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-xs md:gap-md shrink-0">
        <button className="hidden sm:flex hover:bg-surface-container rounded-full p-2 text-on-surface-variant transition-all">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="hidden md:flex hover:bg-surface-container rounded-full p-2 text-on-surface-variant transition-all">
          <span className="material-symbols-outlined">language</span>
        </button>
        <button className="hidden md:flex hover:bg-surface-container rounded-full p-2 text-on-surface-variant transition-all">
          <span className="material-symbols-outlined">dark_mode</span>
        </button>
        <div className="hidden sm:block h-8 w-px bg-outline-variant mx-xs"></div>
        <NavLink
          to="/profile"
          className="flex items-center gap-sm cursor-pointer hover:bg-surface-container py-1 px-1 sm:px-2 rounded-full transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm">
            JD
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-label-md font-bold leading-tight">James Dalton</span>
            <span className="text-[10px] text-outline uppercase tracking-wider">HR Director</span>
          </div>
        </NavLink>
      </div>
    </header>
  )
}
