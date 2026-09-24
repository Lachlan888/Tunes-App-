"use client"

export default function GlobalError({ reset }: { reset: () => void }) {
  return <html lang="en"><body style={{ fontFamily: "system-ui", padding: "2rem", color: "#25231f", background: "#fffdf8" }}>
    <main><h1>Tunes could not load</h1><p>Check your connection and try again. Your saved work remains on the server.</p><button style={{ minHeight: 44, padding: "0.75rem 1rem" }} onClick={reset}>Retry Tunes</button><p><a href="/login">Return to sign in</a></p></main>
  </body></html>
}
