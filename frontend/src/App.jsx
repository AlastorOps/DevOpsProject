import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import EmployeeList from './pages/EmployeeList'
import AddEmployee from './pages/AddEmployee'
import EmployeeDetail from './pages/EmployeeDetail'
import EmployeeDashboard from './pages/EmployeeDashboard'
import Departments from './pages/Departments'
import Positions from './pages/Positions'
import AttendanceManagement from './pages/AttendanceManagement'
import LeaveManagement from './pages/LeaveManagement'
import RequestLeave from './pages/RequestLeave'
import PayrollManagement from './pages/PayrollManagement'
import PayslipView from './pages/PayslipView'
import PerformanceReviews from './pages/PerformanceReviews'
import SystemReports from './pages/SystemReports'
import UserManagement from './pages/UserManagement'
import RolesPermissions from './pages/RolesPermissions'
import PersonalProfile from './pages/PersonalProfile'
import SystemSettings from './pages/SystemSettings'

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
