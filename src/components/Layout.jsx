import { Outlet } from 'react-router-dom'
import Toast from './Toast.jsx'
import { ToastProvider } from '../hooks/useToast.jsx'

export default function Layout() {
  return (
    <ToastProvider>
      <div className="layout">
        <Outlet />
        <Toast />
      </div>
    </ToastProvider>
  )
}
