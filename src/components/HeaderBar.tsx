import { getString } from '../core/strings';

interface HeaderBarProps {
  title: string;
  score: string;
  timer?: string;
  timeLeft?: number;
  onModeChange?: (mode: string) => void;
  enabledModes?: string[];
  currentMode?: string;
}

export default function HeaderBar({ 
  title, 
  score, 
  timer, 
  timeLeft,
  onModeChange,
  enabledModes = ['untimed', 'timed'],
  currentMode = 'untimed'
}: HeaderBarProps) {
  // Determine timer state for styling
  const getTimerClass = () => {
    if (timeLeft === undefined) return 'timer';
    if (timeLeft <= 10) return 'timer timer-critical';
    if (timeLeft <= 30) return 'timer timer-warning';
    return 'timer';
  };

  return (
    <header className="header-bar">
      <div className="header-content">
        <h1 className="title">{title}</h1>
        
        <div className="header-controls">
          <select 
            className="mode-select"
            onChange={(e) => onModeChange?.(e.target.value)}
            value={currentMode}
            aria-label={getString('accessibility.modeSelector')}
          >
            {enabledModes.map(mode => (
              <option key={mode} value={mode}>
                {getString(`ui.modes.${mode}`)}
              </option>
            ))}
          </select>
          
          <div className="score-display">
            <span className="score">{score}</span>
            {timer && <span className={getTimerClass()}>{timer}</span>}
          </div>
        </div>
      </div>
    </header>
  );
}