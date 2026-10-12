"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-4">[ SYSTEM FAULT ]</div>
      <h1 className="font-display text-4xl md:text-6xl uppercase text-foreground mb-6">Something went <span className="text-accent">wrong</span></h1>
      <p className="font-mono text-xs text-foreground/60 uppercase mb-2 max-w-sm">We hit an unexpected problem. Please try again.</p>
      {error.digest && <p className="font-mono text-[10px] text-foreground/30 mb-8">Reference: {error.digest}</p>}
      <button onClick={reset} className="border border-accent text-accent px-8 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-accent/10">Try again</button>
    </main>
  );
}
