import { useState, useRef } from 'react';

interface InputDockProps {
  onSubmit: (answer: string) => void;
  onExit: () => void;
  placeholder?: string;
  submitText?: string;
  exitText?: string;
}

export default function InputDock({ 
  onSubmit, 
  onExit,
  placeholder = "Type the combined word...",
  submitText = "Submit",
  exitText = "Exit"
}: InputDockProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

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
          />
          
          <div className="button-group">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={!inputValue.trim()}
            >
              {submitText}
            </button>
            
            <button 
              type="button" 
              onClick={onExit}
              className="exit-btn"
            >
              {exitText}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}