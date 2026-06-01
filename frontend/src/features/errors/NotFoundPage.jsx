import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-margin-mobile">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-xl">
          <span className="material-symbols-outlined text-[48px] text-primary">error</span>
        </div>
        <h1 className="text-display text-on-surface">404</h1>
        <h2 className="text-headline-md text-on-surface mt-sm">Page Not Found</h2>
        <p className="text-body-md text-on-surface-variant mt-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-sm justify-center mt-xl">
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-sm px-lg py-md bg-primary text-on-primary rounded-lg text-label-md hover:brightness-110 active:scale-95 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-sm px-lg py-md bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg text-label-md hover:bg-surface-container-low active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Go Back
          </button>
        </div>
      </div>
    </main>
  )
}
