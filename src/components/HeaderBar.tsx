interface HeaderBarProps {
  title: string;
  score: string;
  timer?: string;
  onModeChange?: (mode: string) => void;
  enabledModes?: string[];
  currentMode?: string;
}

export default function HeaderBar({ 
  title, 
  score, 
  timer, 
  onModeChange,
  enabledModes = ['untimed', 'timed'],
  currentMode = 'untimed'
}: HeaderBarProps) {
  return (
    <header className="header-bar">
      <div className="header-content">
        <h1 className="title">{title}</h1>
        
        <div className="header-controls">
          <select 
            className="mode-select"
            onChange={(e) => onModeChange?.(e.target.value)}
            value={currentMode}
          >
            {enabledModes.map(mode => (
              <option key={mode} value={mode}>
                {mode === 'untimed' ? 'Uten tid' : 'Med tid'}
              </option>
            ))}
          </select>
          
          <div className="score-display">
            <span className="score">{score}</span>
            {timer && <span className="timer">{timer}</span>}
          </div>
        </div>
      </div>
    </header>
  );
}