import { Nav as FoldkitNav } from '@foldkit/ui'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '@/lib/utils'

export const navClass =
  'flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-sm'

export const navLinkClass =
  'relative inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-[background-color,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[current]:bg-primary data-[current]:text-primary-foreground data-[current]:shadow-sm active:translate-y-0 active:scale-[.98] motion-reduce:transform-none motion-reduce:transition-none'

export type NavConfig<M, Value extends string = string> = Readonly<{
  items: ReadonlyArray<Value>
  ariaLabel: string
  toHref: (value: Value, index: number) => string
  isItemCurrent: (value: Value, index: number) => boolean
  onItemClick?: (value: Value, index: number) => M
  className?: string
  linkClass?: string
  toLabel: (value: Value, index: number) => Html | string
}>

/** Styled navigation landmark built on the @foldkit/ui Nav helper. The
 *  current destination is marked with `aria-current` and styled via the
 *  `data-current` attribute. */
export const nav = <M, Value extends string = string>(
  config: NavConfig<M, Value>,
  h: HtmlBuilder<M>,
): Html =>
  FoldkitNav.view<Value>({
    items: config.items,
    ariaLabel: config.ariaLabel,
    toHref: config.toHref,
    isItemCurrent: config.isItemCurrent,
    toView: ({ nav: navAttributes, items }) =>
      h.nav(
        [...navAttributes, h.Class(cn(navClass, config.className))],
        items.map((item, index) =>
          h.a(
            [
              ...item.link,
              ...(config.onItemClick === undefined ? [] : [h.OnClick(config.onItemClick(item.value, index))]),
              h.Class(cn(navLinkClass, config.linkClass)),
            ],
            [config.toLabel(item.value, index)],
          ),
        ),
      ),
  })
