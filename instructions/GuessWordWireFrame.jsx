import { useState, useRef, useEffect } from "react";

// NOTE: Updated wireframe: images are portrait-oriented for mobile (taller than wide) but remain responsive on desktop.
// Aspect ratio changed to 3/4 and layout adapts gracefully to larger screens.

export default function GuessWordWireframe() {
  const [showSummary, setShowSummary] = useState(false);
  const [mode, setMode] = useState("timed");
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode !== "timed") return;
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [timeLeft, mode]);

  const focusInput = () => inputRef.current?.focus();

  return (
    <div className="min-h-screen w-full bg-neutral-50 text-neutral-900 flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div aria-hidden className="size-9 rounded-2xl bg-neutral-900/5" />
          <h1 className="text-lg font-semibold tracking-tight">Gjett ord</h1>
        </div>
        <div className="flex items-center gap-3">
          <label className="sr-only" htmlFor="mode">Mode</label>
          <select
            id="mode"
            className="rounded-xl border px-3 py-1 text-sm"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="timed">Timed</option>
            <option value="untimed">Untimed</option>
          </select>
          <div className="flex items-center gap-4">
            <div aria-live="polite" className="text-sm font-medium">
              {mode === "timed" ? `⏱️ ${timeLeft}s` : "Practice"}
            </div>
            <div className="text-sm">✅ {score.correct} / {score.total}</div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-3xl grow p-4 pb-28">
        <p className="mb-3 text-sm text-neutral-600" aria-live="polite">
          Trykk på et bilde for hint. Skriv det sammensatte ordet.
        </p>

        {/* Portrait image layout */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label="Bilder">
          <button
            type="button"
            onClick={focusInput}
            className="group relative aspect-[3/4] w-full rounded-2xl border-2 border-dashed border-neutral-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-describedby="card1-desc"
          >
            <div className="absolute inset-0 m-2 rounded-xl bg-neutral-100 grid place-items-center text-neutral-400 text-sm">
              Image A (portrait placeholder)
            </div>
            <span id="card1-desc" className="sr-only">Bilde A – trykk for å fokusere på svaret</span>
          </button>

          <button
            type="button"
            onClick={focusInput}
            className="group relative aspect-[3/4] w-full rounded-2xl border-2 border-dashed border-neutral-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-describedby="card2-desc"
          >
            <div className="absolute inset-0 m-2 rounded-xl bg-neutral-100 grid place-items-center text-neutral-400 text-sm">
              Image B (portrait placeholder)
            </div>
            <span id="card2-desc" className="sr-only">Bilde B – trykk for å fokusere på svaret</span>
          </button>
        </section>

        <div className="mt-4 h-6 text-sm" aria-live="assertive" role="status" />
      </main>

      {/* Input dock */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white p-3">
        <form
          className="mx-auto flex w-full max-w-3xl items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setScore((s) => ({ correct: s.correct + 1, total: s.total + 1 }));
          }}
        >
          <label htmlFor="answer" className="sr-only">Svar</label>
          <input
            id="answer"
            ref={inputRef}
            type="text"
            inputMode="text"
            autoCapitalize="none"
            autoCorrect="off"
            className="flex-1 rounded-xl border px-3 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Skriv svaret her…"
          />
          <button
            type="submit"
            className="rounded-xl px-4 py-3 text-sm font-semibold bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Send inn
          </button>
          <button
            type="button"
            onClick={() => setShowSummary(true)}
            className="rounded-xl px-4 py-3 text-sm font-semibold bg-neutral-100 text-neutral-900 shadow-sm hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-400"
          >
            Avslutt
          </button>
        </form>
      </div>

      {showSummary && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="summary-title"
          className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 id="summary-title" className="text-lg font-semibold">Oppsummering</h2>
            <p className="mt-2 text-sm text-neutral-600">Riktig: {score.correct} / {score.total}</p>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                className="rounded-xl px-4 py-2 text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onClick={() => {
                  setScore({ correct: 0, total: 0 });
                  setTimeLeft(60);
                  setShowSummary(false);
                  inputRef.current?.focus();
                }}
              >
                Spill igjen
              </button>
              <button
                type="button"
                className="rounded-xl px-4 py-2 text-sm font-semibold bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                onClick={() => setShowSummary(false)}
              >
                Lukk
              </button>
            </div>

            <div className="mt-3">
              <label htmlFor="mode2" className="mr-2 text-sm">Bytt modus:</label>
              <select
                id="mode2"
                className="rounded-xl border px-3 py-1 text-sm"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="timed">Timed</option>
                <option value="untimed">Untimed</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <footer className="sr-only">
        Portrait-oriented wireframe layout for mobile; responsive to desktop width.
      </footer>
    </div>
  );
}
