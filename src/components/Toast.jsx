import { useToast } from '../hooks/useToast.jsx'
import { Info } from 'lucide-react'

export default function Toast() {
  const { toast } = useToast()

  if (!toast) return null

  return (
    <div className="toast-container" role="status" aria-live="polite">
      <div className="toast">
        <Info size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline' }} />
        {toast}
      </div>
    </div>
  )
}
