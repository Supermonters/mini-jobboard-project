export default function Page() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
        Fries putter · v0.1
      </p>
      <h1 className="font-display text-5xl font-medium tracking-tight">
        Put them fries, in the <em className="italic text-accent">bags</em>.
      </h1>
      <p className="text-ink-soft max-w-md text-center">
        We help you find a place so you can put the fries in the bag,
      </p>
    </main>
  );
}