import { useState } from 'react'

const ratingStyle = {
  Excellent: 'bg-secondary-container text-on-secondary-container',
  Good:      'bg-surface-variant text-primary',
  Average:   'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  Poor:      'bg-error-container text-on-error-container',
}

const starsToRating = (s) => s >= 5 ? 'Excellent' : s >= 4 ? 'Good' : s >= 3 ? 'Average' : 'Poor'

const initialReviews = [
  { init: 'JS', name: 'Jordan Smith', dept: 'Engineering', position: 'Senior Frontend Dev', lastReview: 'Oct 12, 2023', rating: 'Excellent', reviewer: 'Maria Garcia' },
  { init: 'AL', name: 'Amara Lawson', dept: 'Marketing',   position: 'Growth Manager',       lastReview: 'Nov 04, 2023', rating: 'Good',      reviewer: 'Chris Evans' },
  { init: 'KT', name: 'Kevin Tuan',   dept: 'Sales',       position: 'Sales Associate',       lastReview: 'Dec 15, 2023', rating: 'Average',   reviewer: 'Sarah Blake' },
  { init: 'DM', name: 'Dianne Miles', dept: 'Design',      position: 'UI/UX Designer',        lastReview: 'Jan 02, 2024', rating: 'Poor',      reviewer: 'Maria Garcia' },
  { init: 'RR', name: 'Riley Reid',   dept: 'Engineering', position: 'QA Specialist',         lastReview: 'Dec 20, 2023', rating: 'Excellent', reviewer: 'Chris Evans' },
]

const emptyForm = { employee: '', cycle: 'Annual Review 2024', stars: 4, comments: '' }

export default function PerformanceReviews() {
  const [reviewList, setReviewList]   = useState(initialReviews)
  const [showModal, setShowModal]     = useState(false)
  const [form, setForm]               = useState(emptyForm)
  const [hoverStar, setHoverStar]     = useState(0)
  const [toast, setToast]             = useState(null)
  const [search, setSearch]           = useState('')
  const [filterDept, setFilterDept]   = useState('All Departments')
  const [filterRating, setFilterRating] = useState('All Ratings')

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const openModal = (employeeName = '') => {
    setForm({ ...emptyForm, employee: employeeName })
    setHoverStar(0)
    setShowModal(true)
  }

  const handleSubmit = () => {
    if (!form.employee) return
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    const init  = form.employee.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    setReviewList(prev => [
      { init, name: form.employee, dept: '—', position: form.cycle, lastReview: today, rating: starsToRating(form.stars), reviewer: 'You' },
      ...prev,
    ])
    setShowModal(false)
    setForm(emptyForm)
    showToast(`Review for ${form.employee} submitted.`)
  }

  const handleReset = () => {
    setSearch('')
    setFilterDept('All Departments')
    setFilterRating('All Ratings')
  }

  const filtered = reviewList.filter(r => {
    const matchSearch  = `${r.name} ${r.position}`.toLowerCase().includes(search.toLowerCase())
    const matchDept    = filterDept   === 'All Departments' || r.dept   === filterDept
    const matchRating  = filterRating === 'All Ratings'     || r.rating === filterRating
    return matchSearch && matchDept && matchRating
  })

  const activeStar = hoverStar || form.stars

  return (
    <div className="p-margin-mobile md:p-margin-desktop space-y-lg">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-md px-lg py-md rounded-xl shadow-lg border text-label-md font-bold bg-secondary-container text-on-secondary-container border-secondary/30">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          {toast}
        </div>
      )}

      <div className="flex flex-col gap-md md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-display text-on-background">Performance Reviews</h2>
          <p className="text-body-lg text-on-surface-variant">Track and manage employee growth and evaluations.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-xs px-lg py-md bg-primary text-on-primary rounded-lg text-label-md hover:opacity-90 transition-all active:scale-95 shadow-md"
        >
          <span className="material-symbols-outlined">add</span>
          Add Review
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        <div className="md:col-span-1 p-lg bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
          <p className="text-label-md text-outline">Avg. Performance Score</p>
          <div className="mt-sm flex items-end gap-xs">
            <span className="text-display text-primary">4.2</span>
            <span className="text-body-md text-secondary mb-1">/ 5.0</span>
          </div>
          <div className="mt-md flex items-center text-secondary">
            <span className="material-symbols-outlined text-[18px]">trending_up</span>
            <span className="text-label-sm ml-1">+8% from last quarter</span>
          </div>
        </div>
        <div className="md:col-span-1 p-lg bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
          <p className="text-label-md text-outline">Pending Reviews</p>
          <div className="mt-sm">
            <span className="text-display text-on-background">12</span>
          </div>
          <div className="mt-md flex items-center text-tertiary">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            <span className="text-label-sm ml-1">Due within 7 days</span>
          </div>
        </div>
        <div className="md:col-span-2 p-lg bg-primary-container text-on-primary-container rounded-xl shadow-sm flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-headline-md font-bold">Quarterly Review Season</h3>
            <p className="text-body-md mt-xs max-w-[280px] opacity-90">65% of reviews completed. Let's reach the goal by Friday!</p>
            <div className="mt-md w-48 h-2 bg-on-primary-container/20 rounded-full">
              <div className="h-full bg-on-primary-container rounded-full w-[65%]"></div>
            </div>
          </div>
          <span className="material-symbols-outlined text-[120px] absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">star</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center gap-md p-md bg-surface-container-low rounded-lg border border-outline-variant">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">person_search</span>
          <input
            className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-body-md outline-none focus:ring-1 focus:ring-primary"
            placeholder="Search by name or position..."
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="w-full md:w-48 py-2 px-md border border-outline-variant rounded-lg bg-surface-container-lowest text-body-md"
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
        >
          <option>All Departments</option>
          <option>Engineering</option>
          <option>Marketing</option>
          <option>Sales</option>
          <option>Human Resources</option>
          <option>Design</option>
        </select>
        <select
          className="w-full md:w-48 py-2 px-md border border-outline-variant rounded-lg bg-surface-container-lowest text-body-md"
          value={filterRating}
          onChange={e => setFilterRating(e.target.value)}
        >
          <option>All Ratings</option>
          <option>Excellent</option>
          <option>Good</option>
          <option>Average</option>
          <option>Poor</option>
        </select>
        <button
          onClick={handleReset}
          className="w-full md:w-auto px-lg py-2 bg-surface-container-highest border border-outline text-on-surface rounded-lg text-label-md hover:bg-surface-container-high transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high text-on-surface-variant text-label-md">
                <th className="px-lg py-md uppercase">Employee Name</th>
                <th className="px-lg py-md uppercase">Department</th>
                <th className="px-lg py-md uppercase">Position</th>
                <th className="px-lg py-md uppercase">Last Review</th>
                <th className="px-lg py-md uppercase">Rating</th>
                <th className="px-lg py-md uppercase">Reviewer</th>
                <th className="px-lg py-md uppercase text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-lg py-xl text-center text-on-surface-variant text-body-md">
                    No reviews match the current filters.
                  </td>
                </tr>
              ) : filtered.map(r => (
                <tr key={r.name + r.lastReview} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-sm">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-label-sm">{r.init}</div>
                      <p className="text-body-md font-bold text-on-surface">{r.name}</p>
                    </div>
                  </td>
                  <td className="px-lg py-md text-body-md">{r.dept}</td>
                  <td className="px-lg py-md text-body-md text-on-surface-variant">{r.position}</td>
                  <td className="px-lg py-md text-body-md text-on-surface-variant">{r.lastReview}</td>
                  <td className="px-lg py-md">
                    <span className={`px-sm py-1 rounded-full text-label-sm ${ratingStyle[r.rating]}`}>{r.rating}</span>
                  </td>
                  <td className="px-lg py-md text-body-md text-on-surface-variant">{r.reviewer}</td>
                  <td className="px-lg py-md text-center">
                    <button
                      onClick={() => openModal(r.name)}
                      className="text-primary hover:bg-primary/10 px-md py-1 rounded transition-colors text-label-md"
                    >
                      Add Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-lg py-md flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between border-t border-outline-variant">
          <p className="text-body-md text-on-surface-variant">
            {search || filterDept !== 'All Departments' || filterRating !== 'All Ratings'
              ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} found`
              : `Showing 1 to ${reviewList.length} of ${reviewList.length} employees`}
          </p>
          <div className="flex items-center gap-xs">
            <button className="p-2 rounded-lg hover:bg-surface-container-low text-outline opacity-50" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded-lg bg-primary text-on-primary text-label-md">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-surface-container-low text-on-surface-variant text-label-md">2</button>
            <button className="w-8 h-8 rounded-lg hover:bg-surface-container-low text-on-surface-variant text-label-md">3</button>
            <button className="p-2 rounded-lg hover:bg-surface-container-low text-outline">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-margin-mobile">
          <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-surface-container-lowest w-full max-w-xl p-xl rounded-2xl shadow-2xl space-y-lg border border-outline-variant">
            <div className="flex items-center justify-between">
              <h3 className="text-headline-md font-bold">New Performance Review</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-surface-container rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-md">
              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface">Employee</label>
                  <select
                    className="w-full py-2 px-md border border-outline-variant rounded-lg focus:ring-1 focus:ring-primary outline-none"
                    value={form.employee}
                    onChange={e => setForm(prev => ({ ...prev, employee: e.target.value }))}
                  >
                    <option value="">Select employee…</option>
                    {initialReviews.map(r => (
                      <option key={r.name} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface">Review Cycle</label>
                  <select
                    className="w-full py-2 px-md border border-outline-variant rounded-lg focus:ring-1 focus:ring-primary outline-none"
                    value={form.cycle}
                    onChange={e => setForm(prev => ({ ...prev, cycle: e.target.value }))}
                  >
                    <option>Annual Review 2024</option>
                    <option>Q1 Mid-Year</option>
                  </select>
                </div>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface">Rating Score</label>
                <div className="flex items-center gap-xs">
                  {[1, 2, 3, 4, 5].map(i => (
                    <button
                      key={i}
                      onClick={() => setForm(prev => ({ ...prev, stars: i }))}
                      onMouseEnter={() => setHoverStar(i)}
                      onMouseLeave={() => setHoverStar(0)}
                      className={i <= activeStar ? 'text-primary' : 'text-outline'}
                    >
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: i <= activeStar ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                    </button>
                  ))}
                  <span className="ml-md text-body-md font-bold text-on-surface">
                    {activeStar}.0 — {starsToRating(activeStar)}
                  </span>
                </div>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface">Review Comments</label>
                <textarea
                  className="w-full p-md border border-outline-variant rounded-lg focus:ring-1 focus:ring-primary outline-none text-body-md resize-none"
                  placeholder="Provide detailed feedback on strengths and areas for improvement..."
                  rows={4}
                  value={form.comments}
                  onChange={e => setForm(prev => ({ ...prev, comments: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-md pt-md">
              <button onClick={() => setShowModal(false)} className="px-lg py-md text-on-surface-variant text-label-md hover:bg-surface-container rounded-lg">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={!form.employee}
                className="px-xl py-md bg-primary text-on-primary text-label-md rounded-lg shadow-md hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
