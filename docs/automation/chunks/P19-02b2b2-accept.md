# P19-02b2b2-accept — Lists view-switch side effects
Dependency: P19-02b2b2-setup. Parent: P19-02b2b2. Prompt 19 items 6–7.
Carry forward prior shell/cards/actions/navigation/filter/pager/scroll evidence.
Use tests/integration/list-side-effect-harness.mjs and its setup result. Start a fresh disposable harness so positive-control attempts do not contaminate browser evidence. Exercise all five Lists views through actual navigation; compare before/after fixture snapshots and require no write/database-attempt events. Confirm relevant membership/bookmark/publication fixtures are represented; extend fixture coverage if needed. A blocked attempted write is a failure, even if state is unchanged. Do not call immutable fixture equality alone persistence proof. Explicit mutation acceptance, if necessary, requires a separate disposable data implementation; no production mutations.
Gate: focused browser acceptance, targeted checks for any fixes. Record limitations honestly. Next: P19-02c.

Split before implementation on 22 September: complete P19-02b2b2-accept-coverage, then P19-02b2b2-accept-browser. This parent stays pending until browser acceptance passes.
