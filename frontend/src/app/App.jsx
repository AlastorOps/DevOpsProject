import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { AttendanceProvider } from '../context/AttendanceContext'
import Layout from '../components/layout/Layout'
import LoginPage from '../features/admin/LoginPage'
import NotFoundPage from '../features/errors/NotFoundPage'
import AdminDashboard from '../features/dashboard/AdminDashboard'
import EmployeeList from '../features/employees/EmployeeList'
import AddEmployee from '../features/employees/AddEmployee'
import EmployeeDetail from '../features/employees/EmployeeDetail'
import EmployeeDashboard from '../features/dashboard/EmployeeDashboard'
import Departments from '../features/organization/Departments'
import Positions from '../features/organization/Positions'
import AttendanceManagement from '../features/attendance/AttendanceManagement'
import LeaveManagement from '../features/leave/LeaveManagement'
import RequestLeave from '../features/leave/RequestLeave'
import PayrollManagement from '../features/payroll/PayrollManagement'
import PayslipView from '../features/payroll/PayslipView'
import PerformanceReviews from '../features/performance/PerformanceReviews'
import SystemReports from '../features/reports/SystemReports'
import UserManagement from '../features/admin/UserManagement'
import RolesPermissions from '../features/admin/RolesPermissions'
import PersonalProfile from '../features/profile/PersonalProfile'
import SystemSettings from '../features/admin/SystemSettings'

const ROLE_FALLBACK = (role) => role === 'Employee' ? '/my-dashboard' : '/dashboard'

function ProtectedLayout() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Layout />
}

function RoleRoute({ roles, children }) {
  const { user } = useAuth()
  if (!roles.includes(user?.role)) return <Navigate to={ROLE_FALLBACK(user?.role)} replace />
  return children
}

function DashboardRedirect() {
  const { user } = useAuth()
  return <Navigate to={ROLE_FALLBACK(user?.role)} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <AttendanceProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedLayout />}>
            <Route index element={<DashboardRedirect />} />

            {/* Manager+ */}
            <Route path="dashboard" element={
              <RoleRoute roles={['Admin', 'HR Manager', 'Manager']}>
                <AdminDashboard />
              </RoleRoute>
            } />

            {/* Employee only */}
            <Route path="my-dashboard" element={<EmployeeDashboard />} />

            {/* HR+ */}
            <Route path="employees" element={
              <RoleRoute roles={['Admin', 'HR Manager']}>
                <EmployeeList />
              </RoleRoute>
            } />
            <Route path="employees/new" element={
              <RoleRoute roles={['Admin', 'HR Manager']}>
                <AddEmployee />
              </RoleRoute>
            } />
            <Route path="employees/:id" element={
              <RoleRoute roles={['Admin', 'HR Manager']}>
                <EmployeeDetail />
              </RoleRoute>
            } />
            <Route path="departments" element={
              <RoleRoute roles={['Admin', 'HR Manager']}>
                <Departments />
              </RoleRoute>
            } />
            <Route path="positions" element={
              <RoleRoute roles={['Admin', 'HR Manager']}>
                <Positions />
              </RoleRoute>
            } />

            {/* All roles */}
            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="leave" element={<LeaveManagement />} />
            <Route path="leave/request" element={<RequestLeave />} />
            <Route path="payroll" element={<PayrollManagement />} />
            <Route path="payroll/payslip" element={<PayslipView />} />

            {/* Manager+ */}
            <Route path="performance" element={
              <RoleRoute roles={['Admin', 'HR Manager', 'Manager']}>
                <PerformanceReviews />
              </RoleRoute>
            } />
            <Route path="reports" element={
              <RoleRoute roles={['Admin', 'HR Manager', 'Manager']}>
                <SystemReports />
              </RoleRoute>
            } />

            {/* Admin only */}
            <Route path="users" element={
              <RoleRoute roles={['Admin']}>
                <UserManagement />
              </RoleRoute>
            } />
            <Route path="roles" element={
              <RoleRoute roles={['Admin']}>
                <RolesPermissions />
              </RoleRoute>
            } />
            <Route path="settings" element={
              <RoleRoute roles={['Admin']}>
                <SystemSettings />
              </RoleRoute>
            } />

            {/* All roles */}
            <Route path="profile" element={<PersonalProfile />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      </AttendanceProvider>
    </AuthProvider>
  )
}
