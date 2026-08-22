import { Tabs as FoldkitTabs } from '@foldkit/ui'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '@/lib/utils'

// Re-export the @foldkit/ui Tabs surface. Create a bundle once per tab value
// type:
//
//   export const DemoTabs = Tabs.create<"Foldkit" | "React">()

export const create = FoldkitTabs.create
export const init = FoldkitTabs.init
export const Model = FoldkitTabs.Model
export type Model = typeof Model.Type
export const Message = FoldkitTabs.Message
export type Message = typeof Message.Type
export const OutMessage = FoldkitTabs.OutMessage
export type OutMessage = typeof OutMessage.Type

export type Bundle<Value extends string = string> = FoldkitTabs.Bundle<Value>
export type InitConfig = FoldkitTabs.InitConfig
export type ViewInputs<Value extends string = string> = FoldkitTabs.ViewInputs<Value>
export type RenderInfo<Value extends string = string> = FoldkitTabs.RenderInfo<Value>

// --- Class constants ---
//
// Derived from the shadcn v4 BASE registry:
// apps/v4/registry/bases/base/ui/tabs.tsx. Class strings are identical to
// upstream; visual styling lives in the central foldcn style definition.
//
// foldkit delta: foldkit emits data-selected (upstream Base UI emits
// data-active) — the copied trigger string keeps the semantics with the
// data-active prefix per docs/deriving-from-base.md. The group orientation
// hooks use data-horizontal/data-vertical attrs emitted by the styled view.

export type TabsListVariant = 'default' | 'line'

const tabsListBaseClass =
  'cn-tabs-list group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col'

const tabsListVariantClasses: Record<TabsListVariant, string> = {
  default: 'cn-tabs-list-variant-default bg-muted',
  line: 'cn-tabs-list-variant-line gap-1 bg-transparent',
}

export const tabsListClass = (variant: TabsListVariant = 'default') =>
  cn(tabsListBaseClass, tabsListVariantClasses[variant])

/** Upstream TabsTrigger string with data-active → data-selected prefix swaps
 *  (foldkit attr name). */
export const tabsTriggerClass = cn(
  'cn-tabs-trigger relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0',
  'group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-selected:bg-transparent dark:group-data-[variant=line]/tabs-list:data-selected:border-transparent dark:group-data-[variant=line]/tabs-list:data-selected:bg-transparent',
  'data-selected:bg-background data-selected:text-foreground dark:data-selected:border-input dark:data-selected:bg-input/30 dark:data-selected:text-foreground',
  'after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-selected:after:opacity-100',
)

export const tabsContentClass = 'cn-tabs-content flex-1 outline-none'

// --- Composable sub-components ---
//
// Use inside `styledViewInputs` panel callbacks:
//
//   panel: (tab, render, h) =>
//     Tabs.content({}, [h.p([], [`${tab} content`])], h)

type StyleConfig = Readonly<{ className?: string }>

/** Tab list wrapper. */
export const list = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Html | string>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.DataAttribute('slot', 'tabs-list'), h.Class(cn(tabsListClass(), config.className))],
    children,
  )

/** Individual tab trigger button. */
export const trigger = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Html | string>,
  h: HtmlBuilder<M>,
): Html =>
  h.button(
    [h.DataAttribute('slot', 'tabs-trigger'), h.Class(cn(tabsTriggerClass, config.className))],
    children,
  )

/** Tab content panel wrapper. */
export const content = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Html | string>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.DataAttribute('slot', 'tabs-content'), h.Class(cn(tabsContentClass, config.className))],
    children,
  )

// --- styledViewInputs factory ---

export type StyledViewInputs<M, Value extends string = string> = Readonly<{
  tabs: ReadonlyArray<Value>
  selectedValue: Value
  ariaLabel: string
  /** Renders each tab panel. Receives the tab value and the render-time
   *  attributes (tablist, tabs, activeIndex) so content can react to the
   *  active tab. */
  panel: (tab: Value, render: RenderInfo<Value>, h: HtmlBuilder<M>) => Html
  isTabDisabled?: (value: Value, index: number) => boolean
  orientation?: 'Horizontal' | 'Vertical'
  variant?: TabsListVariant
  listClass?: string
  triggerClass?: string
  contentClass?: string
}>

/** Build styled `Tabs.ViewInputs`. Pass your view's `h` so panel content can
 *  dispatch your app's own messages. */
export const styledViewInputs = <M, Value extends string = string>(
  viewInputs: StyledViewInputs<M, Value>,
  h: HtmlBuilder<M>,
): ViewInputs<Value> => {
  const isVertical = viewInputs.orientation === 'Vertical'
  const variant = viewInputs.variant ?? 'default'
  return {
    tabs: viewInputs.tabs,
    selectedValue: viewInputs.selectedValue,
    ariaLabel: viewInputs.ariaLabel,
    isTabDisabled: viewInputs.isTabDisabled,
    orientation: viewInputs.orientation,
    toView: ({ tablist, tabs, activeIndex }) =>
      h.div(
        [
          h.DataAttribute('slot', 'tabs'),
          h.DataAttribute('orientation', isVertical ? 'vertical' : 'horizontal'),
          ...(isVertical ? [h.DataAttribute('vertical', '')] : [h.DataAttribute('horizontal', '')]),
          h.Class(cn('group/tabs flex', isVertical ? 'w-full gap-2' : 'flex-col', viewInputs.variant === 'line' ? '' : '')),
        ],
        [
          h.div(
            [
              ...tablist,
              h.DataAttribute('slot', 'tabs-list'),
              h.Attribute('data-variant', variant),
              h.Class(cn(tabsListClass(variant), viewInputs.listClass)),
            ],
            tabs.map((tab) =>
              h.button(
                [
                  ...tab.tab,
                  h.DataAttribute('slot', 'tabs-trigger'),
                  h.Class(cn(tabsTriggerClass, viewInputs.triggerClass)),
                ],
                [h.span([], [tab.value])],
              ),
            ),
          ),
          ...tabs
            .filter((tab) => tab.index === activeIndex)
            .map((tab) =>
              h.div(
                [
                  ...tab.panel,
                  h.DataAttribute('slot', 'tabs-content'),
                  h.Class(cn(tabsContentClass, viewInputs.contentClass)),
                ],
                [viewInputs.panel(tab.value, { tablist, tabs, activeIndex }, h)],
              ),
            ),
        ],
      ),
  }
}
