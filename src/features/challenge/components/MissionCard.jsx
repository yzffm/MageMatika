import { useNavigate } from 'react-router-dom'
import { Trophy, CheckCircle, ArrowRight } from 'lucide-react'
import './MissionCard.css'

/**
 * Reusable presentation component for a single mission (challenge).
 * Expects context to be passed in, rather than resolving it internally.
 */
export default function MissionCard({ 
  challenge, 
  culturalObjectName, 
  moduleTopic, 
  isCompleted 
}) {
  const navigate = useNavigate()

  return (
    <div 
      className={`mission-card glass-card ${isCompleted ? 'mission-card--completed' : ''}`}
      onClick={() => navigate(`/challenge/${challenge.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/challenge/${challenge.id}`)}
    >
      <div className="mission-card-header">
        <span className="mission-topic">{moduleTopic}</span>
        <div className="mission-reward">
          <Trophy size={14} className="reward-icon" />
          <span>+{challenge.reward.xp} XP</span>
        </div>
      </div>
      
      <div className="mission-card-body">
        <h3 className="mission-title">{challenge.title}</h3>
        <p className="mission-context">{culturalObjectName}</p>
      </div>
      
      <div className="mission-card-footer">
        {isCompleted ? (
          <div className="mission-status success">
            <CheckCircle size={16} />
            <span>Selesai</span>
          </div>
        ) : (
          <div className="mission-status pending">
            <span>Mulai Tantangan</span>
            <ArrowRight size={16} />
          </div>
        )}
      </div>
    </div>
  )
}
