import { Disclosure as FoldkitDisclosure } from '@foldkit/ui'
import type { Html, HtmlBuilder } from 'foldkit/html'

type Child = Html | string

import { icon } from '@/lib/icons'
import { ChevronDown } from 'lucide'
import { cn } from '@/lib/utils'

// Re-export the @foldkit/ui Disclosure surface. An accordion is a vertical
// stack of Disclosure items with a shared exclusive-open convention (the parent
// keeps one open index). The primitive is stateless and controlled — the
// parent owns each item's open state and dispatches `onToggle`.

/** Derived from the shadcn v4 BASE registry:
 *  apps/v4/registry/bases/base/ui/accordion.tsx.
 *
 * foldcn gaps vs upstream: no single/multiple root semantics (parent-owned
 * state), and the chevron rotates instead of swapping icons. */

export const buttonId = FoldkitDisclosure.buttonId

/** Upstream Accordion root string (each foldcn item renders its own wrapper;
 *  consumers stack them inside a w-full flex-col container). */
export const accordionWrapperClass = 'cn-accordion flex w-full flex-col'

export const accordionItemClass = 'cn-accordion-item'

export const accordionTriggerClass =
  'cn-accordion-trigger group/accordion-trigger relative flex flex-1 items-start justify-between border border-transparent transition-all outline-none aria-disabled:pointer-events-none aria-disabled:opacity-50'

export const accordionContentClass = 'cn-accordion-content overflow-hidden text-sm'

export const accordionAnimatedContentClass =
  'overflow-hidden pb-4 text-sm text-muted-foreground'

export const accordionContentInnerClass =
  'cn-accordion-content-inner h-(--accordion-panel-height) data-ending-style:h-0 data-starting-style:h-0 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4'

export const accordionChevronClass =
  'cn-accordion-trigger-icon pointer-events-none size-4 shrink-0 transition-transform'


export type AccordionItemConfig<M> = Readonly<{
  id: string
  isOpen: boolean
  onToggle: (isOpen: boolean) => M
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

/** Styled accordion item built on the @foldkit/ui Disclosure helper. Mirrors
 *  the shadcn `accordion` trigger/content pair: a full-width trigger with a
 *  chevron that rotates when expanded, and a collapsible content region. */
export const accordionItem = <M>(config: AccordionItemConfig<M>, h: HtmlBuilder<M>): Html =>
  FoldkitDisclosure.view<M>(
    {
      id: config.id,
      isOpen: config.isOpen,
      onToggle: config.onToggle,
      isDisabled: config.isDisabled,
      ariaLabel: config.ariaLabel,
      ariaLabelledBy: config.ariaLabelledBy,
      toView: ({ button, panel, animatePanel }) =>
        h.div(
          [h.Class(cn(accordionWrapperClass, config.wrapperClass)), h.DataAttribute('slot', 'accordion-item')],
          [
            h.button(
              [...button, h.Class(cn(accordionTriggerClass, config.triggerClass)), h.DataAttribute('slot', 'accordion-trigger')],
              [
                h.span([], [config.title]),
                h.span([h.Class(accordionChevronClass)], [icon(h, ChevronDown)]),
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
