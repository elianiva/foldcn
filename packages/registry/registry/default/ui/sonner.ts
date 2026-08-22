import { Schema as S } from 'effect'
import { Toast as FoldkitToast } from '@foldkit/ui'
import type { Html, HtmlBuilder } from 'foldkit/html'

type Child = Html | string

import { icon } from '@/lib/icons'
import { CircleCheck, Info, LoaderCircle, OctagonX, TriangleAlert, X } from 'lucide'
import { cn } from '@/lib/utils'

// Re-export the @foldkit/ui Toast surface. Sonner is a Toast variant: the same
// stacked, auto-dismissing notifications with compact entries, close
// affordance and per-variant icons.
//
// Derived from the shadcn v4 BASE registry:
// apps/v4/registry/bases/base/ui/sonner.tsx (surface tokens) — the entry
// card uses the cn-toast token like upstream's toastOptions.classNames.
//
// foldcn gaps vs upstream: no sonner-library passthrough props, no theme
// sync (--normal-* vars), no swipe; the Foldkit toast engine drives
// positioning/duration.

export const Variant = FoldkitToast.Variant
export type Variant = typeof Variant.Type
export const Position = FoldkitToast.Position
export type Position = typeof Position.Type
export type EntryHandlers = FoldkitToast.EntryHandlers
export type InitConfig = FoldkitToast.InitConfig
export type ShowInput<A> = FoldkitToast.ShowInput<A>

export const toastVariantClass = (variant: Variant): string =>
  variant === 'Error' ? 'text-destructive' : ''

export const sonnerContainerClass = 'flex w-full flex-col gap-2'

export const sonnerEntryClass =
  'w-full max-w-sm rounded-2xl bg-popover p-4 pr-8 text-popover-foreground shadow-lg will-change-transform outline-none select-none transition duration-200 ease-out data-[closed]:opacity-0 data-[closed]:translate-y-2'

export const sonnerTitleClass = 'text-sm font-medium'

export const sonnerDescriptionClass = 'text-sm text-muted-foreground'

export const sonnerDismissButtonClass =
  'absolute right-2 top-2 rounded-md p-1 text-muted-foreground opacity-70 transition-opacity hover:text-foreground hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 cursor-pointer after:absolute after:-inset-2 after:content-[\'\']'

const variantIconNode = (variant: Variant) => {
  switch (variant) {
    case 'Success':
      return CircleCheck
    case 'Info':
      return Info
    case 'Warning':
      return TriangleAlert
    case 'Error':
      return OctagonX
    default:
      return Info
  }
}

export const toastIcon = <M>(h: HtmlBuilder<M>, variant: Variant): Html =>
  h.span(
    [h.DataAttribute('slot', 'toast-icon'), h.Class('shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4')],
    [icon(h, variantIconNode(variant), cn('size-4 shrink-0', toastVariantClass(variant)))],
  )

export const toastLoadingIcon = <M>(h: HtmlBuilder<M>): Html =>
  h.span(
    [h.DataAttribute('slot', 'toast-icon'), h.Class('shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4')],
    [icon(h, LoaderCircle, 'size-4 shrink-0 animate-spin')],
  )

/** Bind a toast stack to your payload schema, plus a styled `entryView`. */
export const make = <A, I>(payloadSchema: S.Codec<A, I>) => {
  const Bound = FoldkitToast.make(payloadSchema)
  type Entry = typeof Bound.Entry.Type

  const entryView = <M2>(
    config: Readonly<{
      entry: Entry
      handlers: EntryHandlers
      h: HtmlBuilder<M2>
      toContent: (entry: Entry) => ReadonlyArray<Child>
      className?: string
      titleClass?: string
      descriptionClass?: string
    }>,
  ): Html => {
    const { entry, handlers, h } = config
    return h.div(
      [
        h.DataAttribute('slot', 'toast'),
        h.Class(cn('cn-toast group/toast relative flex w-full items-center gap-3 overflow-hidden', sonnerEntryClass, config.className)),
      ],
      [
        toastIcon(h, entry.variant),
        h.div([h.Class('flex min-w-0 flex-1 flex-col gap-1')], config.toContent(entry)),
        h.button(
          [...handlers.dismiss, h.Class(cn(sonnerDismissButtonClass)), h.AriaLabel('Close toast'), h.DataAttribute('slot', 'toast-close')],
          [icon(h, X)],
        ),
      ],
    )
  }

  return { ...Bound, entryView }
}
