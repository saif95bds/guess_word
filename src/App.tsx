import { useState, useEffect, useRef } from 'react'
import './styles/styles.css'
import HeaderBar from './components/HeaderBar'
import ImageCard from './components/ImageCard'
import InputDock, { type InputDockRef } from './components/InputDock'
import SummaryModal from './components/SummaryModal'
import AnswerCard from './components/AnswerCard'
import { loadAll, LoadError, type LoadedData } from './core/loader'
import { initStrings, getString } from './core/strings'
import { preloadImage } from './core/images'
import { Engine } from './core/engine'
import type { GameState, Summary } from './types/config'

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showAnswerCard, setShowAnswerCard] = useState(false)
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(true)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loadedData, setLoadedData] = useState<LoadedData | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Ref for InputDock to access focus method
  const inputDockRef = useRef<InputDockRef>(null)
  // Ref to hold the engine instance
  const engineRef = useRef<Engine | null>(null)
  // Ref to hold the auto-advance timer
  const advanceTimerRef = useRef<number | null>(null)

  // Load configuration and strings on mount
  useEffect(() => {
    async function initializeApp() {
      try {
        setIsLoading(true)
        const data = await loadAll()
        
        // Initialize strings module
        initStrings(data.strings)
        
        setLoadedData(data)
        setLoadError(null)
        
        // Preload first puzzle images for better performance
        if (data.puzzles.length > 0) {
          const firstPuzzle = data.puzzles[0]
          preloadImage(firstPuzzle.image1.srcBase, data.app)
          preloadImage(firstPuzzle.image2.srcBase, data.app)
          if (firstPuzzle.answerImage) {
            preloadImage(firstPuzzle.answerImage.srcBase, data.app)
          }
        }
      } catch (error) {
        console.error('Failed to load app data:', error)
        if (error instanceof LoadError) {
          setLoadError(`Failed to load ${error.file}: ${error.message}`)
        } else {
          setLoadError('Failed to initialize application')
        }
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  // Initialize engine when data is loaded
  useEffect(() => {
    if (!loadedData) return

    // Create engine with callbacks
    const engine = new Engine(
      loadedData.app,
      loadedData.puzzles,
      {
        onRender: (state: GameState) => {
          setGameState(state)
        },
        onCorrect: (state: GameState) => {
          console.log('Correct answer!', state)
        },
        onIncorrect: (state: GameState) => {
          console.log('Incorrect answer!', state)
        },
        onComplete: (summaryData: Summary) => {
          setSummary(summaryData)
          setShowModal(true)
        },
        onTick: (state: GameState) => {
          setGameState({ ...state })
        }
      }
    )

    engineRef.current = engine

    // Start the game with default mode
    engine.start(loadedData.app.defaultMode)

    // Cleanup: only complete if we have actual game state
    // This prevents StrictMode's double-mount from showing the modal
    return () => {
      if (engineRef.current) {
        const state = engineRef.current.getState()
        // Only complete if the game has actually started (has attempts or time elapsed)
        if (state && (state.total > 0 || (state.timeLeft !== undefined && state.timeLeft < loadedData.app.timer.default))) {
          engineRef.current.complete('exit')
        }
      }
    }
  }, [loadedData])

  const handleImageTap = () => {
    // Focus the input when an image is tapped using the ref
    inputDockRef.current?.focus()
  }

  const handleSubmit = (answer: string) => {
    if (!engineRef.current || !loadedData) return
    
    // Submit answer to engine for evaluation
    const isCorrect = engineRef.current.submit(answer)
    console.log('Answer submitted:', answer, 'Correct:', isCorrect)
    
    // Store whether the answer was correct for display in AnswerCard
    setLastAnswerCorrect(isCorrect)
    
    // Show answer card immediately after submission
    setShowAnswerCard(true)
    
    // Get the transition duration from config
    const answerCardDuration = loadedData.app.answerCard.durationMs
    const totalDelay = answerCardDuration + 1000 // Show answer card + 1s extra
    
    // Clear any existing timer
    if (advanceTimerRef.current !== null) {
      clearTimeout(advanceTimerRef.current)
    }
    
    // Hide answer card and advance to next puzzle after delay
    advanceTimerRef.current = window.setTimeout(() => {
      setShowAnswerCard(false)
      
      // Small delay before moving to next puzzle
      setTimeout(() => {
        if (engineRef.current) {
          engineRef.current.next()
        }
      }, 300)
    }, totalDelay)
  }

  const handleAnswerCardDismiss = () => {
    // Clear the auto-advance timer
    if (advanceTimerRef.current !== null) {
      clearTimeout(advanceTimerRef.current)
      advanceTimerRef.current = null
    }
    
    // Hide answer card immediately
    setShowAnswerCard(false)
    
    // Small delay before moving to next puzzle
    setTimeout(() => {
      if (engineRef.current) {
        engineRef.current.next()
      }
    }, 300)
  }

  const handleExit = () => {
    if (engineRef.current) {
      engineRef.current.complete('exit')
    }
  }

  const handleReplay = () => {
    setShowModal(false)
    // Restart the game with the same mode
    if (engineRef.current && loadedData) {
      const currentMode = gameState?.mode || loadedData.app.defaultMode
      engineRef.current.start(currentMode)
    }
  }

  const handleChangeMode = () => {
    setShowModal(false)
    // Mode change logic - for now just restart with default mode
    if (engineRef.current && loadedData) {
      engineRef.current.start(loadedData.app.defaultMode)
    }
  }

  const handleModeChange = (mode: string) => {
    // Restart the game with the new mode
    if (engineRef.current) {
      engineRef.current.complete('exit')
      engineRef.current.start(mode)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="app">
        <div className="loading-state">
          <h1>Loading...</h1>
          <p>Loading game configuration...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (loadError) {
    return (
      <div className="app">
        <div className="error-state">
          <h1>Error</h1>
          <p>{loadError}</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Main app - data is loaded
  const config = loadedData!.app
  const puzzles = loadedData!.puzzles
  
  // Use current puzzle from game state, or fallback to first puzzle
  const currentPuzzle = gameState?.current || puzzles[0]
  const currentMode = gameState?.mode || config.defaultMode
  const timerEnabled = currentMode === 'timed' && config.timer.enabled
  
  // Score from game state
  const score = gameState 
    ? { correct: gameState.correct, total: gameState.total }
    : { correct: 0, total: 0 }
  
  // Format timer display
  const timeLeftDisplay = gameState?.timeLeft !== undefined 
    ? `${Math.floor(gameState.timeLeft / 60)}:${(gameState.timeLeft % 60).toString().padStart(2, '0')}`
    : '0:00'

  return (
    <div className="app">
      {/* ARIA live region for announcing score updates */}
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {score.total > 0 && getString('ui.correctOfTotal', { 
          correct: score.correct.toString(), 
          total: score.total.toString() 
        })}
      </div>
      
      <HeaderBar
        title={getString('ui.title')}
        score={getString('ui.correctOfTotal', { 
          correct: score.correct.toString(), 
          total: score.total.toString() 
        })}
        timer={timerEnabled ? getString('ui.timeLeft', { time: timeLeftDisplay }) : undefined}
        onModeChange={handleModeChange}
        enabledModes={config.enabledModes}
        currentMode={currentMode}
      />
      
      <main className="game-area">
        <div className="cards-container">
          <ImageCard
            srcBase={currentPuzzle.image1.srcBase}
            alt={currentPuzzle.image1.alt}
            wordPart={currentPuzzle.image1.wordPart}
            onTap={handleImageTap}
            config={config}
          />
          
          <ImageCard
            srcBase={currentPuzzle.image2.srcBase}
            alt={currentPuzzle.image2.alt}
            wordPart={currentPuzzle.image2.wordPart}
            onTap={handleImageTap}
            config={config}
          />
        </div>
      </main>
      
      <InputDock
        ref={inputDockRef}
        onSubmit={handleSubmit}
        onExit={handleExit}
        placeholder={getString('ui.placeholder')}
        submitText={getString('ui.submit')}
        exitText={getString('ui.exit')}
      />
      
      <SummaryModal
        isVisible={showModal}
        score={summary || score}
        onReplay={handleReplay}
        onChangeMode={handleChangeMode}
        onClose={() => setShowModal(false)}
        title={getString('summary.title')}
        scoreText={getString('summary.scoreText', {
          correct: (summary?.correct || score.correct).toString(),
          total: (summary?.total || score.total).toString()
        })}
        replayText={getString('ui.replay')}
        changeModeText={getString('ui.changeMode')}
      />
      
      {/* Answer Card - Shows after submission */}
      {showAnswerCard && currentPuzzle.answerImage && (
        <AnswerCard
          answerImage={currentPuzzle.answerImage}
          config={config}
          isVisible={showAnswerCard}
          isCorrect={lastAnswerCorrect}
          onDismiss={handleAnswerCardDismiss}
        />
      )}
    </div>
  )
}

export default App
