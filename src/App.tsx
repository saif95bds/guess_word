import { useState, useEffect } from 'react'
import './styles/styles.css'
import HeaderBar from './components/HeaderBar'
import ImageCard from './components/ImageCard'
import InputDock from './components/InputDock'
import SummaryModal from './components/SummaryModal'
import { loadAll, LoadError, type LoadedData } from './core/loader'
import { initStrings, getString } from './core/strings'
import { preloadImage } from './core/images'

function App() {
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [showModal, setShowModal] = useState(false)
  const [currentMode, setCurrentMode] = useState('untimed')
  const [loadedData, setLoadedData] = useState<LoadedData | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [currentPuzzleIndex, _setCurrentPuzzleIndex] = useState(0)

  // Load configuration and strings on mount
  useEffect(() => {
    async function initializeApp() {
      try {
        setIsLoading(true)
        const data = await loadAll()
        
        // Initialize strings module
        initStrings(data.strings)
        
        // Set default mode from config
        setCurrentMode(data.app.defaultMode)
        
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

  const handleImageTap = () => {
    // Focus the input when an image is tapped
    const inputElement = document.querySelector('.word-input') as HTMLInputElement
    if (inputElement) {
      inputElement.focus()
    }
  }

  const handleSubmit = (answer: string) => {
    console.log('Submitted answer:', answer)
    // Placeholder logic - increment total attempts
    setScore(prev => ({ ...prev, total: prev.total + 1 }))
  }

  const handleExit = () => {
    setShowModal(true)
  }

  const handleReplay = () => {
    setScore({ correct: 0, total: 0 })
    setShowModal(false)
  }

  const handleChangeMode = () => {
    setShowModal(false)
    // Mode change logic would go here
  }

  const handleModeChange = (mode: string) => {
    setCurrentMode(mode)
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
  const currentPuzzle = puzzles[currentPuzzleIndex] || puzzles[0]
  const timerEnabled = currentMode === 'timed' && config.timer.enabled

  return (
    <div className="app">
      <HeaderBar
        title={getString('ui.title')}
        score={getString('ui.correctOfTotal', { 
          correct: score.correct.toString(), 
          total: score.total.toString() 
        })}
        timer={timerEnabled ? getString('ui.timeLeft', { time: '1:30' }) : undefined}
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
        onSubmit={handleSubmit}
        onExit={handleExit}
        placeholder={getString('ui.placeholder')}
        submitText={getString('ui.submit')}
        exitText={getString('ui.exit')}
      />
      
      <SummaryModal
        isVisible={showModal}
        score={score}
        onReplay={handleReplay}
        onChangeMode={handleChangeMode}
        onClose={() => setShowModal(false)}
        title={getString('summary.title')}
        scoreText={getString('summary.scoreText', {
          correct: score.correct.toString(),
          total: score.total.toString()
        })}
        replayText={getString('ui.replay')}
        changeModeText={getString('ui.changeMode')}
      />
    </div>
  )
}

export default App
