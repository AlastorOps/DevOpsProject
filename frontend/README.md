# Kinetic HR Frontend

React + Vite frontend for the Kinetic HR admin and employee management interface.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Project Structure

```text
src/
  app/
    App.jsx
  components/
    layout/
      Header.jsx
      Layout.jsx
      Sidebar.jsx
  features/
    admin/
    attendance/
    dashboard/
    employees/
    leave/
    organization/
    payroll/
    performance/
    profile/
    reports/
  index.css
  main.jsx
```

`src/app/App.jsx` owns route registration. Shared shell components live in
`src/components/layout`, and screen-level modules are grouped by business
feature under `src/features`.
