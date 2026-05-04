export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="mb-6 flex justify-center gap-2">
          <span className="h-3 w-3 animate-bounce rounded-full bg-black [animation-delay:-0.3s]" />
          <span className="h-3 w-3 animate-bounce rounded-full bg-black [animation-delay:-0.15s]" />
          <span className="h-3 w-3 animate-bounce rounded-full bg-black" />
        </div>

        <h1 className="text-2xl font-bold">Loading your tunes...</h1>
        <p className="mt-3 text-sm text-gray-600">
          Getting your practice, lists, and repertoire ready.
        </p>

        <div className="mt-6 overflow-hidden rounded-full border">
          <div className="h-2 w-1/2 animate-pulse bg-black" />
        </div>
      </div>
    </main>
  )
}