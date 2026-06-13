import { useState, useMemo, useEffect } from 'react'
import confetti from 'canvas-confetti'
import './App.css'

function App() {
  const [originalPhrase, setOriginalPhrase] = useState('')
  const [anagram, setAnagram] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Helper to count letters in a string, ignoring accents
  const getLetterCounts = (str: string) => {
    const counts: Record<string, number> = {}
    // Normalize to NFD and remove diacritics
    const normalized = str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
    
    // Only keep A-Z
    const cleaned = normalized.replace(/[^A-Z]/g, '')
    
    for (const char of cleaned) {
      counts[char] = (counts[char] || 0) + 1
    }
    return counts
  }

  // Original letter counts
  const originalCounts = useMemo(() => getLetterCounts(originalPhrase), [originalPhrase])

  // Current anagram letter counts
  const anagramCounts = useMemo(() => getLetterCounts(anagram), [anagram])

  // Remaining letters
  const remainingCounts = useMemo(() => {
    const remaining: Record<string, number> = { ...originalCounts }
    for (const [char, count] of Object.entries(anagramCounts)) {
      if (remaining[char]) {
        remaining[char] -= count
      } else {
        remaining[char] = -count
      }
    }
    return remaining
  }, [originalCounts, anagramCounts])

  // Check if everything is filled
  const isComplete = useMemo(() => {
    if (originalPhrase.length === 0) return false
    const totalOriginal = Object.values(originalCounts).reduce((a, b) => a + b, 0)
    const totalAnagram = Object.values(anagramCounts).reduce((a, b) => a + b, 0)
    return totalOriginal > 0 && totalOriginal === totalAnagram
  }, [originalCounts, anagramCounts, originalPhrase])

  // Fireworks effect
  useEffect(() => {
    if (isComplete) {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return

      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
      }, 250)
    }
  }, [isComplete])

  // Handle anagram input change
  const handleAnagramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    const newCounts = getLetterCounts(newValue)
    
    // Check if any letter exceeds availability
    for (const [char, count] of Object.entries(newCounts)) {
      const maxAvailable = originalCounts[char] || 0
      if (count > maxAvailable) {
        setError(`Oups ! Tu as utilisé trop de "${char}".`)
        return
      }
    }

    setError(null)
    setAnagram(newValue)
  }

  // List of all unique letters in original phrase for the middle section
  const uniqueLetters = useMemo(() => {
    return Object.keys(originalCounts).sort()
  }, [originalCounts])

  // Notepad state
  const [notes, setNotes] = useState('')

  return (
    <div className="app-layout">
      <div className="container" role="main">
        <h1>Kotodama</h1>

        <div className="input-section">
          <label htmlFor="original">Phrase de départ</label>
          <input
            id="original"
            type="text"
            placeholder="Entrez votre texte ici..."
            value={originalPhrase}
            onChange={(e) => {
              setOriginalPhrase(e.target.value)
              setAnagram('') 
              setError(null)
            }}
            aria-label="Phrase originale à transformer en anagramme"
          />
        </div>

        <div 
          className={`letter-pool-wrapper ${isComplete ? 'complete' : ''}`}
          aria-live="polite"
          aria-label="Pool de lettres disponibles"
        >
          <div className="letter-pool">
            {uniqueLetters.length === 0 && (
              <p style={{ opacity: 0.5, fontStyle: 'italic', color: 'var(--color-sumi)' }}>
                Les caractères s'afficheront ici...
              </p>
            )}
            {uniqueLetters.map((char) => {
              const count = remainingCounts[char] || 0
              const isAvailable = count > 0
              return (
                <div
                  key={char}
                  className={`letter-box ${isAvailable ? 'available' : 'unavailable'}`}
                  aria-label={`Lettre ${char}, ${count} restante(s)`}
                >
                  {char}
                  {count > 0 && <span className="count-superscript" aria-hidden="true">{count}</span>}
                </div>
              )
            })}
          </div>
        </div>

        <div className="input-section">
          <label htmlFor="anagram">Votre Anagramme</label>
          <input
            id="anagram"
            type="text"
            className={error ? 'error' : ''}
            placeholder="Composez votre anagramme..."
            value={anagram}
            onChange={handleAnagramChange}
            aria-invalid={!!error}
            aria-errormessage="anagram-error"
          />
          <div className="error-message" id="anagram-error" role="alert">{error}</div>
        </div>
      </div>

      <div className="notepad-section">
        <label htmlFor="notepad">Bloc-notes</label>
        <textarea
          id="notepad"
          placeholder="Mots de secours, idées..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          aria-label="Espace pour vos notes et brouillons"
        />
      </div>
    </div>
  )
}

export default App
