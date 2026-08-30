// The demo slice contract: every demo file owns everything about itself —
// its state fields, its messages, its update handlers, its initial model, its
// subscriptions, and its view. `assemble.ts` spreads all slices into the
// single shared demo Model/Message/update, preserving compile-time
// exhaustiveness (verified: tagsExhaustive keeps per-tag payload narrowing
// through spread records, and a missing handler is a compile error).
//
// Conventions:
//  - Export the slice as `export const slice = defineSlice({ ... })` — never
//    annotate it with DemoSlice; the literal type of `handlers` must survive
//    inference for the assembly's exhaustiveness check to work.
//  - Hoist fields to a `const fields = { … }` and derive the handler state
//    from it: `type State = typeof S.Struct(fields).Type`. Handlers then
//    close over `model: State` — structurally satisfied by the assembled
//    Model at dispatch, without creating an inference cycle back into
//    assemble.ts.
//  - Narrow payloads inside handlers via the slice's own local message
//    schemas (`({ value }: typeof Renamed.Type)`).
import type * as Update from 'foldkit/update'

/** `{ model, commands? }` — the shape every foldkit update returns. Typed
 *  loosely here so slices never reference the assembled Model/Message (that
 *  would re-create the inference cycle); assemble.ts re-tightens at the
 *  dispatch site. */
export type UpdateReturn = Update.Return<unknown, unknown>

export type DemoSlice = {
  /** Schema fields contributed to the shared demo Model struct. */
  fields: Record<string, import('effect').Schema.Schema<unknown>>
  /** Initial values for this slice's fields (validated by the smoke test). */
  init: Record<string, unknown>
  /** Message schemas contributed to the shared demo Message union. */
  messages: ReadonlyArray<import('effect').Schema.Schema<unknown>>
  /**
   * Handler factory closing over this slice's state. Keep the returned
   * object a literal (no `Record<string, …>` annotation): tagsExhaustive
   * reads the literal keys for narrowing and exhaustiveness. Annotate the
   * parameter with the slice's own derived state
   * (`typeof S.Struct(fields).Type`) — never the assembled Model.
   */
  handlers: (model: never) => object
  /** Sample messages for the harness smoke test (1–3 per slice). */
  samples?: ReadonlyArray<unknown>
  /** Global subscriptions (document listeners etc.) owned by this slice;
   *  re-tightened to Model/Message at the aggregation site. */
  subscriptions?: object
}

/** Identity helper — marks a slice and keeps its literal types intact. */
export const defineSlice = <T extends DemoSlice>(slice: T): T => slice
