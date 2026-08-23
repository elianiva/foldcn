import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { cn } from '@/lib/utils'
import { Avatar, avatarImageClass } from '@foldcn/registry/styles/default/ui/avatar'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  AvatarImageErrored: { key: S.String },
})

/**
 * foldkit's `Avatar.image` always renders an `<img>` — it never auto-swaps
 * to the fallback on load error (see the registry component's doc comment).
 * This wires that swap up ourselves: track per-avatar error state and
 * render the fallback instead of a broken `<img>` once it errors.
 */
const avatarPicture = (
  key: string,
  src: string,
  alt: string,
  fallback: string,
  model: Model,
  h: HtmlBuilder<AppMessage>,
  className?: string,
): Html =>
  model.avatarImageErrors[key]
    ? Avatar.fallback<AppMessage>({}, [fallback], h)
    : h.img([
        h.Src(src),
        h.Alt(alt),
        h.Class(cn(avatarImageClass, className)),
        h.DataAttribute('slot', 'avatar-image'),
        h.OnError(Message.AvatarImageErrored({ key })),
      ])

export const avatarView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex flex-row flex-wrap items-center gap-6 md:gap-12')],
    [
      Avatar<AppMessage>(
        {},
        [avatarPicture('top-shadcn', 'https://github.com/shadcn.png', '@shadcn', 'CN', model, h, 'grayscale')],
        h,
      ),
      Avatar<AppMessage>(
        {},
        [
          avatarPicture('top-evilrabbit', 'https://github.com/evilrabbit.png', '@evilrabbit', 'ER', model, h),
          Avatar.badge<AppMessage>({ className: 'bg-green-600 dark:bg-green-800' }, [], h),
        ],
        h,
      ),
      Avatar.group<AppMessage>(
        { className: 'grayscale' },
        [
          Avatar<AppMessage>(
            {},
            [avatarPicture('group-shadcn', 'https://github.com/shadcn.png', '@shadcn', 'CN', model, h)],
            h,
          ),
          Avatar<AppMessage>(
            {},
            [avatarPicture('group-maxleiter', 'https://github.com/maxleiter.png', '@maxleiter', 'LR', model, h)],
            h,
          ),
          Avatar<AppMessage>(
            {},
            [avatarPicture('group-evilrabbit', 'https://github.com/evilrabbit.png', '@evilrabbit', 'ER', model, h)],
            h,
          ),
          Avatar.groupCount<AppMessage>({}, ['+3'], h),
        ],
        h,
      ),
    ],
  )

const fields = { avatarImageErrors: S.Record(S.String, S.Boolean) }

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: { avatarImageErrors: {} },
  messages: [Message.AvatarImageErrored],
  handlers: (model: State) => ({
    AvatarImageErrored: ({ key }: typeof Message.AvatarImageErrored.Type): UpdateReturn => [
      evo(model, { avatarImageErrors: (errors) => ({ ...errors, [key]: true }) }),
      [],
    ],
  }),
  samples: [Message.AvatarImageErrored({ key: 'top-shadcn' })],
})
