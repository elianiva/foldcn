import { Schema as S } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { defineView } from 'foldkit/submodel'
import * as Update from 'foldkit/update'

type Child = Html | string

import { cn } from '@/lib/utils'

/**
 * Known foldkit gap: upstream swaps image→fallback automatically via the
 * Base UI Avatar primitive; foldkit has no such primitive, so `Avatar.image`
 * always renders `<img>`. `Avatar.picture` (below) closes that gap itself —
 * a tiny submodel that swaps to the fallback on load error — so most
 * consumers never need to touch `Avatar.image`/`Avatar.fallback` directly.
 */

export const avatarSizeKeys = ['default', 'sm', 'lg'] as const
export type AvatarSize = (typeof avatarSizeKeys)[number]

export const avatarClass =
  'cn-avatar group/avatar relative flex shrink-0 select-none after:absolute after:inset-0 after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten'

export const avatarImageClass = 'cn-avatar-image aspect-square size-full object-cover'

export const avatarFallbackClass =
  'cn-avatar-fallback flex size-full items-center justify-center text-sm group-data-[size=sm]/avatar:text-xs'

export const avatarBadgeClass =
  'cn-avatar-badge absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-blend-color ring-2 select-none group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2 group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2'

export const avatarGroupClass =
  'cn-avatar-group group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background'

export const avatarGroupCountClass =
  'cn-avatar-group-count relative flex shrink-0 items-center justify-center ring-2 ring-background'

type StyleConfig = Readonly<{ className?: string }>

type AvatarConfig = Readonly<{ size?: AvatarSize; className?: string }>

type AvatarImageConfig = Readonly<{ src: string; alt?: string; className?: string }>

const avatarContainer = <M>(
  config: AvatarConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.span(
    [
      h.Class(cn(avatarClass, config.className)),
      h.DataAttribute('slot', 'avatar'),
      h.DataAttribute('size', config.size ?? 'default'),
    ],
    children,
  )

const avatarImage = <M>(config: AvatarImageConfig, h: HtmlBuilder<M>): Html =>
  h.img([
    h.Src(config.src),
    ...(config.alt === undefined ? [] : [h.Alt(config.alt)]),
    h.Class(cn(avatarImageClass, config.className)),
    h.DataAttribute('slot', 'avatar-image'),
  ])

/** `Avatar.picture`'s submodel — tracks whether the image has errored, so
 *  the fallback swap-in is owned by the component instead of the consumer. */
export const Model = S.Struct({ hasError: S.Boolean })
export type Model = typeof Model.Type

export const init: Model = { hasError: false }

export const Message = defineMessageUnion({
  ImageErrored: {},
})
export type Message = typeof Message.Type

export const update = (
  _model: Model,
  _message: Message,
): Update.Return<Model, Message> => ({ model: { hasError: true } })

export type PictureConfig = Readonly<{
  id: string
  src: string
  alt?: string
  fallback: ReadonlyArray<Child>
  className?: string
  fallbackClassName?: string
}>

const pictureView = defineView<Model, Message, PictureConfig>((model, config, h) =>
  model.hasError
    ? avatarFallback({ className: config.fallbackClassName }, config.fallback, h)
    : h.img([
        h.Src(config.src),
        ...(config.alt === undefined ? [] : [h.Alt(config.alt)]),
        h.Class(cn(avatarImageClass, config.className)),
        h.DataAttribute('slot', 'avatar-image'),
        h.OnError(Message.ImageErrored()),
      ]),
)

/** Image with an automatic fallback swap on load error — the piece upstream
 *  gets for free from the Base UI Avatar primitive. `model` is this
 *  instance's own `Model` (usually a field on the consumer's own state, one
 *  per avatar); `toParentMessage` maps this module's `Message` into the
 *  consumer's own message type, the same way `h.submodel`'s callers do
 *  elsewhere (see `Dialog`/`HoverCard`). */
const avatarPicture = <M>(
  config: PictureConfig,
  model: Model,
  toParentMessage: (message: Message) => M,
  h: HtmlBuilder<M>,
): Html =>
  h.submodel({
    slotId: config.id,
    model,
    view: pictureView,
    viewInputs: config,
    toParentMessage,
  })

const avatarFallback = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.span(
    [
      h.Class(cn(avatarFallbackClass, config.className)),
      h.DataAttribute('slot', 'avatar-fallback'),
    ],
    children,
  )

const avatarBadge = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.span(
    [h.Class(cn(avatarBadgeClass, config.className)), h.DataAttribute('slot', 'avatar-badge')],
    children,
  )

const avatarGroup = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.Class(cn(avatarGroupClass, config.className)), h.DataAttribute('slot', 'avatar-group')],
    children,
  )

const avatarGroupCount = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [
      h.Class(cn(avatarGroupCountClass, config.className)),
      h.DataAttribute('slot', 'avatar-group-count'),
    ],
    children,
  )

/** Styled avatar — image + fallback, with optional status badge and grouping.
 *  Mirrors the shadcn v4 `avatar.tsx` (no Radix primitive; the foldcn registry
 *  renders the same `data-slot` surface). */
export const Avatar = Object.assign(avatarContainer, {
  image: avatarImage,
  fallback: avatarFallback,
  badge: avatarBadge,
  group: avatarGroup,
  groupCount: avatarGroupCount,
  picture: avatarPicture,
})
