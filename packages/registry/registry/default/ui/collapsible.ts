/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update into your app:
 *  `import * as Collapsible from '@/components/ui/collapsible'`
 */
import { Function, Schema as S } from 'effect'
import { Disclosure as FoldkitDisclosure } from '@foldkit/ui'
import type { Html } from 'foldkit/html'
import * as Update from 'foldkit/update'
import { defineMessageUnion } from 'foldkit/message'
import type { Reflect } from 'foldkit/submodel'
import { defineView } from 'foldkit/submodel'
import { evo } from 'foldkit/struct'

type Child = Html | string

import { icon } from '@/lib/icons'
import { ChevronDown, ChevronUp } from 'lucide'
import { cn } from '@/lib/utils'

// A single collapsible section — mirrors shadcn's `collapsible`
// (apps/v4/registry/bases/base/ui/collapsible.tsx): a trigger that toggles
// one panel open/closed. The open state is owned by this Submodel: embed it
// with `h.submodel` and listen for `ChangedOpen` if your app needs to react.
// For a stack of sections with exclusive or multi-open semantics, see
// `accordion`.

export const buttonId = FoldkitDisclosure.buttonId

export const collapsibleWrapperClass = 'w-full'

export const collapsibleTriggerClass =
  'group/collapsible-trigger flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left text-sm font-medium text-foreground transition-[background-color,color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-disabled:pointer-events-none aria-disabled:opacity-50 select-none data-[open]:rounded-b-none motion-reduce:transition-none'

export const collapsibleContentClass =
  'overflow-hidden rounded-b-lg border border-t-0 border-border bg-card px-4 py-3 text-sm text-muted-foreground [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4'

export const collapsibleAnimatedContentClass =
  'overflow-hidden rounded-b-lg border-x border-b border-t-0 border-border bg-card px-4 py-3 text-sm text-muted-foreground [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4'

export const collapsibleChevronClass = 'size-4 shrink-0 text-muted-foreground pointer-events-none'

// MODEL

export const Model = S.Struct({
  id: S.String,
  isOpen: S.Boolean,
  /** Animates the panel height via the @foldkit/ui Disclosure helper's
   *  `animatePanel` transition. */
  isAnimated: S.Boolean,
})
export type Model = typeof Model.Type

// MESSAGES

/** The user clicked the trigger. Flips the open state. */
export const Message = defineMessageUnion({
  Toggled: {},
})
export type Message = typeof Message.Type

/** Emitted when the open state changes. */
export const OutMessage = defineMessageUnion({
  ChangedOpen: { isOpen: S.Boolean },
})
export type OutMessage = typeof OutMessage.Type

// INIT / UPDATE

export type InitConfig = Readonly<{
  id: string
  isOpen?: boolean
  isAnimated?: boolean
}>

/** Creates an initial collapsible model. */
export const init = (config: InitConfig): Model => ({
  id: config.id,
  isOpen: config.isOpen ?? false,
  isAnimated: config.isAnimated ?? false,
})

/** Conforms an externally-driven open state onto the model without emitting
 *  an OutMessage (the world is the source of truth). */
export const reflect: Reflect<Model, boolean> = Function.dual(
  2,
  (model: Model, isOpen: boolean): Model => evo(model, { isOpen: () => isOpen }),
)

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

/** Processes a collapsible message and returns the next model, commands, and
 *  an optional out-message for the parent. */
export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'Toggled': {
      const isOpen = !model.isOpen
      return {
        model: evo(model, { isOpen: () => isOpen }),
        outMessage: OutMessage.ChangedOpen({ isOpen }),
      }
    }
  }
}

// VIEW

export type ViewInputs = Readonly<{
  title: Child
  content: Child
  isDisabled?: boolean
  ariaLabel?: string
  ariaLabelledBy?: string
  triggerClass?: string
  contentClass?: string
  wrapperClass?: string
}>

/** Renders the styled collapsible section built on the @foldkit/ui Disclosure
 *  helper. Embedded via `h.submodel`. */
export const view = defineView<Model, Message, ViewInputs>((model, viewInputs, h) =>
  FoldkitDisclosure.view(
    {
      id: model.id,
      isOpen: model.isOpen,
      onToggle: () => Message.Toggled(),
      isDisabled: viewInputs.isDisabled,
      ariaLabel: viewInputs.ariaLabel,
      ariaLabelledBy: viewInputs.ariaLabelledBy,
      toView: ({ button, panel, animatePanel }) =>
        h.div(
          [
            h.Class(cn(collapsibleWrapperClass, viewInputs.wrapperClass)),
            h.DataAttribute('slot', 'collapsible'),
          ],
          [
            h.button(
              [
                ...button,
                h.Class(cn(collapsibleTriggerClass, viewInputs.triggerClass)),
                h.DataAttribute('slot', 'collapsible-trigger'),
              ],
              [
                h.div(
                  [h.Class('flex w-full items-center justify-between gap-2')],
                  [
                    h.span([], [viewInputs.title]),
                    h.span(
                      [h.Class('flex shrink-0 items-center gap-1')],
                      [
                        /* ChevronDown shown when collapsed; hidden while the trigger is expanded. */
                        h.span(
                          [
                            h.Class(
                              cn(
                                collapsibleChevronClass,
                                'group-aria-expanded/collapsible-trigger:hidden',
                              ),
                            ),
                          ],
                          [icon(h, ChevronDown)],
                        ),
                        /* ChevronUp shown when expanded; hidden while the trigger is collapsed. */
                        h.span(
                          [
                            h.Class(
                              cn(
                                collapsibleChevronClass,
                                'hidden group-aria-expanded/collapsible-trigger:inline',
                              ),
                            ),
                          ],
                          [icon(h, ChevronUp)],
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
            model.isAnimated
              ? animatePanel(
                  h.div(
                    [
                      ...panel,
                      h.Class(cn(collapsibleAnimatedContentClass, viewInputs.contentClass)),
                      h.DataAttribute('slot', 'collapsible-content'),
                    ],
                    [viewInputs.content],
                  ),
                )
              : model.isOpen
                ? h.div(
                    [
                      ...panel,
                      h.Class(cn(collapsibleContentClass, viewInputs.contentClass)),
                      h.DataAttribute('slot', 'collapsible-content'),
                    ],
                    [viewInputs.content],
                  )
                : h.empty,
          ],
        ),
    },
    h,
  ),
)
