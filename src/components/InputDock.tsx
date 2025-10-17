import { useState, useRef, forwardRef, useImperativeHandle } from 'react';

interface InputDockProps {
  onSubmit: (answer: string) => void;
  onExit: () => void;
  placeholder?: string;
  submitText?: string;
  exitText?: string;
}

export interface InputDockRef {
  focus: () => void;
}

const InputDock = forwardRef<InputDockRef, InputDockProps>(({ 
  onSubmit, 
  onExit,
  placeholder = "Type the combined word...",
  submitText = "Submit",
  exitText = "Exit"
}, ref) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Expose focus method to parent components via ref
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    }
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmit(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="input-dock">
      <form onSubmit={handleSubmit} className="input-form">
        <div className="input-group">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="word-input"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            aria-label={placeholder}
          />
          
          <div className="button-group">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={!inputValue.trim()}
              aria-label="Submit answer"
            >
              {submitText}
            </button>
            
            <button 
              type="button" 
              onClick={onExit}
              className="exit-btn"
              aria-label="Exit game"
            >
              {exitText}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
});

InputDock.displayName = 'InputDock';

export default InputDock;