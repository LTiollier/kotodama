import { useState, useMemo, useEffect } from 'react'
import confetti from 'canvas-confetti'
import './App.css'

const AZERTY_LAYOUT = [
  ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
  ['W', 'X', 'C', 'V', 'B', 'N']
]

function App() {
  const [originalPhrase, setOriginalPhrase] = useState(() => localStorage.getItem('kotodama_original') || '')
  const [anagram, setAnagram] = useState(() => localStorage.getItem('kotodama_anagram') || '')
  const [notes, setNotes] = useState(() => localStorage.getItem('kotodama_notes') || '')
  const [error, setError] = useState<string | null>(null)
  const [isNotepadOpen, setIsNotepadOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  // Detect mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('kotodama_original', originalPhrase)
  }, [originalPhrase])

  useEffect(() => {
    localStorage.setItem('kotodama_anagram', anagram)
  }, [anagram])

  useEffect(() => {
    localStorage.setItem('kotodama_notes', notes)
  }, [notes])

  // Clear all data
  const clearAll = () => {
    if (window.confirm('Voulez-vous vraiment tout effacer ?')) {
      setOriginalPhrase('')
      setAnagram('')
      setNotes('')
      setError(null)
    }
  }

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
  const handleAnagramChange = (e: React.ChangeEvent<HTMLInputElement> | string) => {
    const newValue = typeof e === 'string' ? e : e.target.value
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

  const addLetter = (char: string) => {
    const count = remainingCounts[char] || 0
    if (count > 0) {
      handleAnagramChange(anagram + char)
    }
  }

  const addSpace = () => {
    setAnagram(anagram + ' ')
  }

  const backspace = () => {
    setAnagram(anagram.slice(0, -1))
  }

  // List of all unique letters in original phrase for the middle section
  const uniqueLetters = useMemo(() => {
    return Object.keys(originalCounts).sort()
  }, [originalCounts])

  const renderNotepad = () => (
    <div className={`notepad-section ${isMobile ? 'modal' : ''} ${isMobile && isNotepadOpen ? 'open' : ''}`}>
      <div className="notepad-header">
        <label htmlFor="notepad">Bloc-notes</label>
        {isMobile && (
          <button className="close-modal" onClick={() => setIsNotepadOpen(false)}>
            ✕
          </button>
        )}
      </div>
      <textarea
        id="notepad"
        placeholder="Mots de secours, idées..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        aria-label="Espace pour vos notes et brouillons"
      />
    </div>
  )

  return (
    <div className={`app-layout ${isMobile ? 'mobile-view' : ''}`}>
      <div className="container" role="main">
        <div className="header-row">
          <h1>Kotodama</h1>
          <div className="header-actions">
            {isMobile && (
              <button 
                className="icon-btn" 
                onClick={() => setIsNotepadOpen(true)} 
                aria-label="Ouvrir le bloc-notes"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            )}
            <button className="clear-btn" onClick={clearAll} aria-label="Tout effacer">
              Effacer
            </button>
          </div>
        </div>

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

        {!isMobile ? (
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
        ) : (
          <div className="mobile-keyboard-section">
             <div className="virtual-keyboard">
                {AZERTY_LAYOUT.map((row, rowIndex) => (
                  <div key={rowIndex} className="keyboard-row">
                    {row.map((char) => {
                      const count = remainingCounts[char] || 0
                      const isAvailable = count > 0
                      const isPresentInOriginal = originalCounts[char] > 0
                      return (
                        <button
                          key={char}
                          onClick={() => addLetter(char)}
                          disabled={!isAvailable}
                          className={`key ${isAvailable ? 'available' : 'unavailable'} ${!isPresentInOriginal ? 'not-in-phrase' : ''}`}
                        >
                          {char}
                          {isPresentInOriginal && count >= 0 && (
                            <span className={`key-count ${count === 0 ? 'zero' : ''}`}>{count}</span>
                          )}
                        </button>
                      )
                    })}
                    {rowIndex === 2 && (
                      <button className="key backspace" onClick={backspace} aria-label="Effacer">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                          <line x1="18" y1="9" x2="12" y2="15" />
                          <line x1="12" y1="9" x2="18" y2="15" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <div className="keyboard-row">
                  <button className="key space" onClick={addSpace} aria-label="Espace">
                    <span>␣</span>
                  </button>
                </div>
             </div>
          </div>
        )}
      </div>

      {!isMobile && renderNotepad()}
      {isMobile && isNotepadOpen && (
        <div className="modal-overlay" onClick={() => setIsNotepadOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {renderNotepad()}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
