import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatCard from '../components/ui/StatCard'

describe('StatCard', () => {
  it('renders the label', () => {
    render(<StatCard label="Total Employees" value={42} icon="group" />)
    expect(screen.getByText('Total Employees')).toBeInTheDocument()
  })

  it('renders the numeric value', () => {
    render(<StatCard label="Active Users" value={99} icon="person" />)
    expect(screen.getByText('99')).toBeInTheDocument()
  })

  it('renders zero value correctly', () => {
    render(<StatCard label="Pending Requests" value={0} icon="pending" />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('renders string values', () => {
    render(<StatCard label="Status" value="Active" icon="check" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders sub text when provided', () => {
    render(<StatCard label="Revenue" value="$12,000" icon="attach_money" sub="+8% this month" />)
    expect(screen.getByText('$12,000')).toBeInTheDocument()
    expect(screen.getByText('+8% this month')).toBeInTheDocument()
  })
})
