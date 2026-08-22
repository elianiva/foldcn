import { Schema as S } from 'effect'
import { Toast as FoldkitToast } from '@foldkit/ui'
import type { Html, HtmlBuilder } from 'foldkit/html'

type Child = Html | string

import { icon } from '@/lib/icons'
import { CircleCheck, Info, LoaderCircle, OctagonX, TriangleAlert, X } from 'lucide'
import { cn } from '@/lib/utils'

// Re-export the @foldkit/ui Toast surface.
//
// Derived from the shadcn v4 BASE registry:
// apps/v4/registry/bases/base/ui/toast.tsx. Class strings are identical to
// upstream; visual styling lives in the central foldcn style definition.
//
// foldcn gaps vs upstream: no swipe-to-dismiss, no stacked scale/peek
// expansion (single static entry styling), no Action part — compose actions
// via your payload's toContent.

export const Variant = FoldkitToast.Variant
export type Variant = typeof Variant.Type
export const Position = FoldkitToast.Position
export type Position = typeof Position.Type
export type EntryHandlers = FoldkitToast.EntryHandlers
export type InitConfig = FoldkitToast.InitConfig
export type ShowInput<A> = FoldkitToast.ShowInput<A>

/** Accent for the per-variant icon. Only `Error` needs an explicit tint
 *  (`text-destructive`); the other variants inherit `currentColor` on the
 *  neutral popover surface, matching the reference `sonner.tsx` / `toast.tsx`
 *  where only the error icon is colored. */
export const toastVariantClass = (variant: Variant): string =>
  variant === 'Error' ? 'text-destructive' : ''

export const toastEntryClass = 'w-80'

export const toastTitleClass = 'text-sm font-medium'

export const toastDescriptionClass = 'text-sm text-muted-foreground'

export const toastDismissButtonClass =
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

/** Render the per-variant icon, mirroring the reference `ToastIcon` /
 *  `sonner.tsx` icons prop. `loading` is not a `Variant` in the Foldkit
 *  schema, so it is not handled here — render a spinner from your payload
 *  via `toContent` if you need a loading state. */
export const toastIcon = <M>(h: HtmlBuilder<M>, variant: Variant): Html =>
  h.span(
    [
      h.DataAttribute('slot', 'toast-icon'),
      h.Class('shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4'),
    ],
    [
      icon(
        h,
        variantIconNode(variant),
        cn('size-4 shrink-0', toastVariantClass(variant)),
      ),
    ],
  )

/** Spinner icon for ad-hoc loading toasts. Not driven by `Variant` — use
 *  from `toContent` when your payload represents a loading state. Mirrors the
 *  `loading: Loader2Icon animate-spin` entry in the reference `sonner.tsx`. */
export const toastLoadingIcon = <M>(h: HtmlBuilder<M>): Html =>
  h.span(
    [
      h.DataAttribute('slot', 'toast-icon'),
      h.Class('shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4'),
    ],
    [icon(h, LoaderCircle, 'size-4 shrink-0 animate-spin')],
  )

/** Bind a toast stack to your payload schema, exactly like
 *  `@foldkit/ui`'s `Toast.make`, plus a styled `entryView` renderer.
 *
 *  ```ts
 *  export const Toast = ToastModule.make(S.Struct({
 *    title: S.String,
 *    maybeDescription: S.Option(S.String),
 *  }))
 *  ```
 */
export const make = <A, I>(payloadSchema: S.Codec<A, I>) => {
  const Bound = FoldkitToast.make(payloadSchema)
  type Entry = typeof Bound.Entry.Type

  const entryView = <M2>(
    config: Readonly<{
      entry: Entry
      handlers: EntryHandlers
      h: HtmlBuilder<M2>
      /** Render the payload content (title, description, ...). */
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
        h.Class(
          cn(
            // Upstream Toast root string minus the stacking choreography
            // (--toast-index transforms, data-expanded/data-limited,
            // swipe exits) which needs primitive state; exit motion is a
            // simple fade/translate keyed on foldkit's data-closed window.
            'cn-toast group/toast pointer-events-auto relative flex w-full items-center gap-3 overflow-hidden rounded-md border bg-popover p-4 text-popover-foreground shadow-lg will-change-transform outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 transition duration-200 ease-out data-[closed]:opacity-0 data-[closed]:translate-y-2',
            config.className,
          ),
        ),
      ],
      [
        toastIcon(h, entry.variant),
        h.div([h.Class('flex min-w-0 flex-1 flex-col gap-1')], config.toContent(entry)),
        h.button(
          [
            ...handlers.dismiss,
            h.Class(cn(toastDismissButtonClass)),
            h.AriaLabel('Close toast'),
            h.DataAttribute('slot', 'toast-close'),
          ],
          [icon(h, X)],
        ),
      ],
    )
  }

  return { ...Bound, entryView }
}
