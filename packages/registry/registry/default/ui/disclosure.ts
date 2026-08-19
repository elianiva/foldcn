import { Disclosure as FoldkitDisclosure } from '@foldkit/ui'
import type { Html, HtmlBuilder } from 'foldkit/html'

type Child = Html | string

import { icon } from '@/lib/icons'
import { ChevronDown } from 'lucide'
import { cn } from '@/lib/utils'

export const disclosureButtonClass =
  'flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left text-sm font-medium text-foreground transition-[background-color,color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 select-none data-[open]:rounded-b-none motion-reduce:transition-none'

export const disclosurePanelClass =
  'overflow-hidden rounded-b-lg border border-t-0 border-border bg-card px-4 py-3 text-sm text-muted-foreground'

export const disclosureAnimatedPanelClass =
  'overflow-hidden rounded-b-lg border-x border-b border-t-0 border-border bg-card px-4 py-3 text-sm text-muted-foreground'

export const disclosureChevronClass =
  'size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none'

export const disclosureWrapperClass = 'w-full'

export const disclosureButtonId = FoldkitDisclosure.buttonId

export type DisclosureConfig<M> = Readonly<{
  id: string
  isOpen: boolean
  onToggle: (isOpen: boolean) => M
  title: Child
  content: Child
  isDisabled?: boolean
  ariaLabel?: string
  ariaLabelledBy?: string
  isAnimated?: boolean
  buttonClass?: string
  panelClass?: string
  wrapperClass?: string
}>

/** Styled collapsible section built on the @foldkit/ui Disclosure helper.
 *  When `isAnimated` is true the panel is animated with the helper's
 *  `animatePanel` transition. */
export const disclosure = <M>(config: DisclosureConfig<M>, h: HtmlBuilder<M>): Html =>
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
          [h.Class(cn(disclosureWrapperClass, config.wrapperClass))],
          [
            h.button(
              [...button, h.Class(cn(disclosureButtonClass, config.buttonClass))],
              [
                h.div(
                  [h.Class('flex w-full items-center justify-between gap-2')],
                  [
                    h.span([], [config.title]),
                    h.span(
                      [
                        h.Class(
                          cn(disclosureChevronClass, config.isOpen ? 'rotate-180' : 'rotate-0'),
                        ),
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
                    [...panel, h.Class(cn(disclosureAnimatedPanelClass, config.panelClass))],
                    [config.content],
                  ),
                )
              : config.isOpen
                ? h.div(
                    [...panel, h.Class(cn(disclosurePanelClass, config.panelClass))],
                    [config.content],
                  )
                : h.empty,
          ],
        ),
    },
    h,
  )
