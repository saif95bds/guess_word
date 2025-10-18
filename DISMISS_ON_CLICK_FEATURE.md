# AnswerCard dismissOnClick Feature

## Overview

Added a new configurable option to allow players to dismiss the AnswerCard by clicking on it, which immediately advances to the next puzzle instead of waiting for the auto-advance timer.

## Configuration

### In `src/types/config.ts`:

```typescript
answerCard: {
  showImage: boolean;
  transition: 'fade' | 'slide' | 'none';
  durationMs: number;
  dismissOnClick: boolean;  // ✅ NEW
};
```

### In `public/data/app.config.json`:

```json
{
  "answerCard": {
    "showImage": true,
    "transition": "fade",
    "durationMs": 500,
    "dismissOnClick": true
  }
}
```

## Behavior

### When `dismissOnClick: true` (Enabled):
1. **AnswerCard becomes clickable**
   - Cursor changes to pointer on hover
   - Card scales slightly on hover (1.02x)
   - Card scales down slightly on click (0.98x)
   - Backdrop is also clickable

2. **On Click**:
   - Cancels the auto-advance timer
   - Immediately hides the AnswerCard
   - Advances to next puzzle after 300ms delay
   - Player has full control over pace

3. **Visual Feedback**:
   - `cursor: pointer` on card and backdrop
   - Hover effect: slight scale up + shadow increase
   - Active effect: slight scale down (click feedback)

### When `dismissOnClick: false` (Disabled):
1. **AnswerCard is not clickable**
   - Default cursor (no pointer)
   - No hover effects
   - Clicking has no effect
   - Auto-advance timer runs normally

2. **Behavior**:
   - Card displays for full duration (durationMs + 1000ms)
   - Auto-advances after timer expires
   - Player must wait for automatic progression

## Implementation Details

### Component Updates

#### `AnswerCard.tsx`:
- Added `onDismiss?: () => void` prop
- Reads `dismissOnClick` from config
- Conditionally applies click handlers
- Adds `answer-card-clickable` class when enabled
- Makes backdrop clickable with same handler

#### `App.tsx`:
- Added `advanceTimerRef` to track auto-advance timer
- Created `handleAnswerCardDismiss()` function
- Updates `handleSubmit()` to use clearable timer
- Passes `onDismiss` handler to AnswerCard

#### `styles.css`:
- Added `.answer-card-clickable` styles
- Hover effect: `scale(1.02)` + increased shadow
- Active effect: `scale(0.98)` for click feedback
- Smooth transitions (0.2s ease)

### Timer Management

```typescript
// Store timer reference
const advanceTimerRef = useRef<number | null>(null)

// In handleSubmit:
advanceTimerRef.current = window.setTimeout(() => {
  // Auto-advance logic
}, totalDelay)

// In handleAnswerCardDismiss:
if (advanceTimerRef.current !== null) {
  clearTimeout(advanceTimerRef.current)  // Cancel auto-advance
  advanceTimerRef.current = null
}
setShowAnswerCard(false)  // Hide immediately
// Advance to next puzzle
```

## User Experience

### Fast Learners:
- Can click to dismiss immediately after reading
- Faster game pace
- More control over learning speed

### Careful Readers:
- Can still wait for auto-advance
- Timer still works as before
- No pressure to click

### Configurable:
- Developers can enable/disable per game type
- Kids game: disable for paced learning
- Adult game: enable for faster gameplay
- Practice mode: enable for self-paced review

## Testing

### Test Case 1: dismissOnClick = true

```bash
# In app.config.json
"dismissOnClick": true
```

1. Submit an answer (correct or incorrect)
2. AnswerCard appears
3. Hover over card → cursor changes to pointer, card scales up
4. Click anywhere on card or backdrop
5. ✅ Card disappears immediately
6. ✅ Next puzzle loads after 300ms
7. ✅ Auto-advance timer is cancelled

### Test Case 2: dismissOnClick = false

```bash
# In app.config.json
"dismissOnClick": false
```

1. Submit an answer
2. AnswerCard appears
3. Hover over card → cursor stays default, no scale effect
4. Click on card or backdrop
5. ✅ Nothing happens
6. ✅ Card stays visible for full duration
7. ✅ Auto-advances after timer expires

### Test Case 3: Mixed Interaction

```bash
# With dismissOnClick: true
```

1. Submit answer
2. Wait 0.5 seconds (don't click)
3. Then click the card
4. ✅ Card dismisses immediately
5. ✅ Advances to next puzzle
6. ✅ No double-advance (timer properly cancelled)

## CSS Styles

```css
.answer-card-clickable {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.answer-card-clickable:hover {
  transform: translate(-50%, -50%) scale(1.02);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.6);
}

.answer-card-clickable:active {
  transform: translate(-50%, -50%) scale(0.98);
}
```

**Note**: The `translate(-50%, -50%)` maintains the centered positioning while applying the scale effect.

## Accessibility Considerations

### Screen Readers:
- Card maintains `role="status"` and `aria-live="polite"`
- Click action is implicit (no need for button role)
- Keyboard users can still wait for auto-advance

### Visual Feedback:
- Clear cursor change (pointer)
- Hover effect provides visual affordance
- Active state confirms click registration

### Future Enhancement Ideas:
- Add keyboard shortcut (Space/Enter) to dismiss
- Add visual indicator text "Click to continue"
- Add aria-label describing click action

## Configuration Examples

### Educational (Paced Learning):
```json
{
  "answerCard": {
    "showImage": true,
    "transition": "slide",
    "durationMs": 800,
    "dismissOnClick": false  // Force students to read
  }
}
```

### Speed Challenge:
```json
{
  "answerCard": {
    "showImage": false,
    "transition": "none",
    "durationMs": 200,
    "dismissOnClick": true  // Fast-paced gameplay
  }
}
```

### Standard Game:
```json
{
  "answerCard": {
    "showImage": true,
    "transition": "fade",
    "durationMs": 500,
    "dismissOnClick": true  // Player choice
  }
}
```

## Files Modified

1. ✅ `src/types/config.ts` - Added `dismissOnClick: boolean`
2. ✅ `public/data/app.config.json` - Added `"dismissOnClick": true`
3. ✅ `src/components/AnswerCard.tsx` - Added click handling
4. ✅ `src/App.tsx` - Added timer management & dismiss handler
5. ✅ `src/styles/styles.css` - Added clickable styles

## Status

✅ **Feature Complete**
- Config option added
- Click handling implemented
- Timer cancellation working
- Visual feedback added
- No TypeScript errors
- No runtime errors
- Running on http://localhost:5173

## Demo

**Try it now:**
1. Open http://localhost:5173
2. Type `skoledag` and submit
3. Green card appears
4. **Click anywhere on the card** → Instantly advances to next puzzle
5. Or wait ~1.5 seconds → Auto-advances

**To disable:**
1. Edit `public/data/app.config.json`
2. Set `"dismissOnClick": false`
3. Save (page auto-reloads)
4. Now clicking has no effect, must wait for timer
