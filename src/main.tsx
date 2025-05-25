import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Dashboard from './pages/Dashboard.tsx'
import AddBusSchedule from './pages/AddBusSchedule.tsx'
import ViewAllBusSchedules from './pages/ViewAllBusSchedules.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Dashboard />,
  },
  {
    path: '/addschedule',
    element: <AddBusSchedule />,
  },
  {
    path: '/viewallschedules',
    element: <ViewAllBusSchedules />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
