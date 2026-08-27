import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Trophy, Lightbulb, Home, List } from 'lucide-react'
import { evaluateNumericAnswer } from '../../../domain/challenge/evaluator'
import { useProgress } from '../../../hooks/useProgress'
import './ChallengeCard.css'

export default function ChallengeCard({ challenge }) {
  const navigate = useNavigate()
  const { isChallengeCompleted, completeChallenge, recordAttempt } = useProgress()
  const [inputValue, setInputValue] = useState('')
  const [feedback, setFeedback] = useState(null) // null | 'correct' | 'incorrect'
  
  const isCompleted = isChallengeCompleted(challenge.id)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isCompleted || !inputValue.trim()) return

    const result = evaluateNumericAnswer({
      expected: challenge.answer.value,
      actual: inputValue,
      tolerance: challenge.answer.tolerance
    })

    if (result.isCorrect) {
      setFeedback('correct')
      completeChallenge(challenge.id, challenge.reward.xp)
    } else {
      setFeedback('incorrect')
      recordAttempt(challenge.id)
    }
  }

  const handleRetry = () => {
    setFeedback(null)
    setInputValue('')
  }

  return (
    <div className="challenge-card glass-card">
      <div className="challenge-header">
        <h3 className="challenge-title">
          <Lightbulb size={20} className="challenge-icon" />
          {challenge.title}
        </h3>
        {challenge.isPlaceholderData && (
          <span className="challenge-badge">Data Simulasi</span>
        )}
      </div>

      <div className="challenge-body">
        <p className="challenge-question">{challenge.question}</p>

        {isCompleted ? (
          <div className="challenge-success-state animate-fade-in">
            <CheckCircle size={48} className="success-icon" />
            <h4>Tantangan Selesai!</h4>
            <div className="xp-reward">
              <Trophy size={16} /> +{challenge.reward.xp} XP
            </div>
            <p>Kamu telah berhasil menyelesaikan tantangan ini.</p>
            <div className="challenge-success-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexDirection: 'column', width: '100%' }}>
              <button 
                className="btn btn-primary btn-large" 
                onClick={() => navigate('/missions')}
              >
                <List size={18} />
                Tantangan Lainnya
              </button>
              <button 
                className="btn btn-secondary btn-large" 
                onClick={() => navigate('/home')}
              >
                <Home size={18} />
                Kembali ke Home
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="challenge-form">
            <div className="input-group">
              <input
                type="text"
                inputMode="decimal"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Masukkan jawabanmu..."
                className="challenge-input"
                disabled={feedback === 'correct'}
              />
              <span className="input-unit">{challenge.answer.unit}</span>
            </div>

            {feedback === 'incorrect' && (
              <div className="feedback-message error animate-fade-in-up">
                <XCircle size={18} />
                <p>Belum tepat. Coba periksa kembali perhitunganmu.</p>
              </div>
            )}

            {feedback === 'correct' && (
              <div className="feedback-message success animate-fade-in-up">
                <CheckCircle size={18} />
                <p>Benar! Kamu mendapatkan +{challenge.reward.xp} XP.</p>
              </div>
            )}

            <div className="challenge-actions">
              {feedback === 'incorrect' ? (
                <button type="button" className="btn btn-secondary btn-large" onClick={handleRetry}>
                  Coba Lagi
                </button>
              ) : (
                <button 
                  type="submit" 
                  className="btn btn-primary btn-large"
                  disabled={!inputValue.trim() || feedback === 'correct'}
                >
                  Periksa Jawaban
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
