export function PlaceholderPage({ title }: { title: string }) {
  return (
    <main className="mx-auto min-h-[calc(100vh-4.5rem)] max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-primary">MedBridge</p>
        <h1 className="mt-3 text-4xl font-semibold text-foreground sm:text-5xl">{title}</h1>
      </div>
    </main>
  );
}