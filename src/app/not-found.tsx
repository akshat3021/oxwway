import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-4">[ ERROR 404 // SIGNAL LOST ]</div>
      <h1 className="font-display text-5xl md:text-7xl uppercase text-foreground mb-6">Not <span className="text-accent">Found</span></h1>
      <p className="font-mono text-xs text-foreground/60 uppercase mb-8 max-w-sm">The page you are looking for does not exist or has been removed.</p>
      <Link href="/" className="border border-accent text-accent px-8 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-accent/10">Return home</Link>
    </main>
  );
}
