type SharedListsErrorStateProps = {
  message: string
}

export default function SharedListsErrorState({
  message,
}: SharedListsErrorStateProps) {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Shared</h1>
      <p>Could not load shared lists.</p>
      <p className="mt-2 text-sm text-red-600">{message}</p>
    </main>
  )
}