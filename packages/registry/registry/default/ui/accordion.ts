/** Stateful submodel — import the whole module as a namespace and wire its
 *  Model/Message/init/update into your app:
 *  `import * as Accordion from '@/components/ui/accordion'`
 */
import { Function, Schema as S } from 'effect'
import { Disclosure as FoldkitDisclosure } from '@foldkit/ui'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import type { Reflect } from 'foldkit/submodel'
import { defineView } from 'foldkit/submodel'
import { evo } from 'foldkit/struct'
import * as Update from 'foldkit/update'

type Child = Html | string

import { icon } from '@/lib/icons'
import { ChevronDown } from 'lucide'
import { cn } from '@/lib/utils'

// An accordion is a vertical stack of Disclosure items with shared single or
// multi-open semantics, owned by this Submodel: embed it with `h.submodel`
// and listen for `ChangedValue` to lift open-state changes into your own
// model. Conform an externally-driven open-state array (URL, storage) with
// `reflect`.
//
// foldcn gaps vs upstream: the chevron rotates instead of swapping icons.

export const buttonId = FoldkitDisclosure.buttonId

export const accordionWrapperClass = 'cn-accordion flex w-full flex-col'

export const accordionItemClass = 'cn-accordion-item'

export const accordionTriggerClass =
  'cn-accordion-trigger group/accordion-trigger relative flex flex-1 items-start justify-between border border-transparent transition-all outline-none aria-disabled:pointer-events-none aria-disabled:opacity-50'

export const accordionContentClass = 'cn-accordion-content overflow-hidden'

export const accordionAnimatedContentClass = 'cn-accordion-content overflow-hidden'

export const accordionContentInnerClass =
  'cn-accordion-content-inner h-(--accordion-panel-height) data-ending-style:h-0 data-starting-style:h-0 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4'

export const accordionChevronClass =
  'cn-accordion-trigger-icon pointer-events-none size-4 shrink-0 transition-transform group-aria-expanded/accordion-trigger:rotate-180'

export const Type = S.Literals(['single', 'multiple'])
export type AccordionType = typeof Type.Type

/** Computes the next open-state array for an accordion group. Pads the array
 *  so indexes beyond the current length are addressable. */
export const nextAccordionOpen = (
  current: ReadonlyArray<boolean>,
  index: number,
  isOpen: boolean,
  type: AccordionType = 'multiple',
): ReadonlyArray<boolean> => {
  const padded = Array.from(
    { length: Math.max(current.length, index + 1) },
    (_, itemIndex) => current[itemIndex] ?? false,
  )
  return type === 'single' && isOpen
    ? padded.map((_, itemIndex) => itemIndex === index)
    : padded.map((value, itemIndex) => (itemIndex === index ? isOpen : value))
}

// MODEL

export const Model = S.Struct({
  id: S.String,
  type: Type,
  /** Per-item open state, indexed like the view's items array. */
  value: S.Array(S.Boolean),
})
export type Model = typeof Model.Type

// MESSAGES

/** The user clicked an item's trigger. Flips that item's open state — closing
 *  every other item first when `type` is `single`. */
export const Message = defineMessageUnion({
  ToggledItem: { index: S.Number, isOpen: S.Boolean },
})
export type Message = typeof Message.Type

/** Emitted when the open-state array changes. */
export const OutMessage = defineMessageUnion({
  ChangedValue: { value: S.Array(S.Boolean) },
})
export type OutMessage = typeof OutMessage.Type

// INIT / UPDATE

export type InitConfig = Readonly<{
  id: string
  type?: AccordionType
  value?: ReadonlyArray<boolean>
}>

/** Creates an initial accordion model. */
export const init = (config: InitConfig): Model => ({
  id: config.id,
  type: config.type ?? 'multiple',
  value: config.value === undefined ? [] : [...config.value],
})

/** Conforms an externally-driven open-state array onto the model without
 *  emitting an OutMessage (the world is the source of truth). */
export const reflect: Reflect<Model, ReadonlyArray<boolean>> = Function.dual(
  2,
  (model: Model, value: ReadonlyArray<boolean>): Model => evo(model, { value: () => [...value] }),
)

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

/** Processes an accordion message and returns the next model, commands, and
 *  an optional out-message for the parent. */
export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'ToggledItem': {
      const value = nextAccordionOpen(model.value, message.index, message.isOpen, model.type)
      return {
        model: evo(model, { value: () => [...value] }),
        outMessage: OutMessage.ChangedValue({ value }),
      }
    }
  }
}

// VIEW

export type AccordionItemViewInput = Readonly<{
  id: string
  title: Child
  content: Child
  isDisabled?: boolean
  ariaLabel?: string
  ariaLabelledBy?: string
  isAnimated?: boolean
  triggerClass?: string
  contentClass?: string
  wrapperClass?: string
}>

export type ViewInputs = Readonly<{
  items: ReadonlyArray<AccordionItemViewInput>
  className?: string
}>

/** Renders the controlled accordion group. Embedded via `h.submodel`. */
export const view = defineView<Model, Message, ViewInputs>((model, viewInputs, h) =>
  h.div(
    [
      h.Class(cn(accordionWrapperClass, viewInputs.className)),
      h.DataAttribute('slot', 'accordion'),
    ],
    viewInputs.items.map((item, index) =>
      accordionItem(
        {
          ...item,
          isOpen: model.value[index] ?? false,
          onToggle: (isOpen) => Message.ToggledItem({ index, isOpen }),
        },
        h,
      ),
    ),
  ),
)

const accordionItem = (
  config: AccordionItemViewInput & {
    isOpen: boolean
    onToggle: (isOpen: boolean) => Message
  },
  h: HtmlBuilder<Message>,
): Html =>
  FoldkitDisclosure.view(
    {
      id: config.id,
      isOpen: config.isOpen,
      onToggle: config.onToggle,
      isDisabled: config.isDisabled,
      ariaLabel: config.ariaLabel,
      ariaLabelledBy: config.ariaLabelledBy,
      toView: ({ button, panel, animatePanel }) =>
        h.div(
          [
            h.Class(cn(accordionItemClass, config.wrapperClass)),
            h.DataAttribute('slot', 'accordion-item'),
          ],
          [
            h.div(
              [h.Class('flex'), h.DataAttribute('slot', 'accordion-header')],
              [
                h.button(
                  [
                    ...button,
                    h.Class(cn(accordionTriggerClass, config.triggerClass)),
                    h.DataAttribute('slot', 'accordion-trigger'),
                  ],
                  [
                    h.span([], [config.title]),
                    h.span(
                      [
                        h.Class(accordionChevronClass),
                        h.DataAttribute('slot', 'accordion-trigger-icon'),
                      ],
                      [icon(h, ChevronDown)],
                    ),
                  ],
                ),
              ],
            ),
            config.isAnimated === true
              ? animatePanel(
                  h.div(
                    [
                      ...panel,
                      h.Class(cn(accordionAnimatedContentClass, config.contentClass)),
                      h.DataAttribute('slot', 'accordion-content'),
                    ],
                    [h.div([h.Class(accordionContentInnerClass)], [config.content])],
                  ),
                )
              : config.isOpen
                ? h.div(
                    [
                      ...panel,
                      h.Class(cn(accordionContentClass, config.contentClass)),
                      h.DataAttribute('slot', 'accordion-content'),
                    ],
                    [h.div([h.Class(accordionContentInnerClass)], [config.content])],
                  )
                : h.empty,
          ],
        ),
    },
    h,
  )
