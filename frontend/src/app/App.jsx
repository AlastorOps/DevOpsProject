import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import LoginPage from '../features/admin/LoginPage'
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="my-dashboard" element={<EmployeeDashboard />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="employees/new" element={<AddEmployee />} />
          <Route path="employees/:id" element={<EmployeeDetail />} />
          <Route path="departments" element={<Departments />} />
          <Route path="positions" element={<Positions />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="leave" element={<LeaveManagement />} />
          <Route path="leave/request" element={<RequestLeave />} />
          <Route path="payroll" element={<PayrollManagement />} />
          <Route path="payroll/payslip" element={<PayslipView />} />
          <Route path="performance" element={<PerformanceReviews />} />
          <Route path="reports" element={<SystemReports />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="roles" element={<RolesPermissions />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="profile" element={<PersonalProfile />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
