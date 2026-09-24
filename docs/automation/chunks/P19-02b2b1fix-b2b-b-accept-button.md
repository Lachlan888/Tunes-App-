# P19-02b2b1fix-b2b-b-accept-button — Button departure scroll restoration

Split from P19-02b2b1fix-b2b-b-accept before implementation on 2026-09-15. Depends P19-02b2b1fix-b2b-b-fix. Next P19-02b2b1fix-b2b-b-accept-remaining.
Confirmed authenticated localhost:3000 failure: overview at scrollY 1602.75 → Bryan Sutton /52 via Read the list button → Back to Lists returns scrollY 0. Prior title anchor lifecycle passed 2026-09-15.
Scope: allow existing navigation buttons to participate in validated list-origin capture, preserve anchor guards and existing changes. Test real component behavior with regression RED/GREEN; focused lint/typecheck and authenticated nonzero button round trip. No production mutations. Stop after this focused fix.
