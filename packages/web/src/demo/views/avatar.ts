import { Option } from 'effect'
import { Schema as S } from 'effect'
import { modifyFields } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'
import * as Update from 'foldkit/update'

import * as AvatarModule from '../../generated/registry/ui/avatar'
import { Empty } from '../../generated/registry/ui/empty'
import { button } from '../../generated/registry/ui/button'
import { icon } from '../../generated/registry/lib/icons'
import { Check, Plus } from 'lucide'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Avatar = AvatarModule.Avatar

const Message = defineMessageUnion({
  GotSizeShadcnSmMessage: { message: AvatarModule.Message },
  GotSizeShadcnDefaultMessage: { message: AvatarModule.Message },
  GotSizeShadcnLgMessage: { message: AvatarModule.Message },
  GotBadgeJzSmMessage: { message: AvatarModule.Message },
  GotBadgeJzDefaultMessage: { message: AvatarModule.Message },
  GotBadgeJzLgMessage: { message: AvatarModule.Message },
  GotBadgeIconPpSmMessage: { message: AvatarModule.Message },
  GotBadgeIconPpDefaultMessage: { message: AvatarModule.Message },
  GotBadgeIconPpLgMessage: { message: AvatarModule.Message },
  GotGroupShadcnMessage: { message: AvatarModule.Message },
  GotGroupMaxleiterMessage: { message: AvatarModule.Message },
  GotGroupEvilrabbitMessage: { message: AvatarModule.Message },
  GotGroupCountShadcnMessage: { message: AvatarModule.Message },
  GotGroupCountMaxleiterMessage: { message: AvatarModule.Message },
  GotGroupCountEvilrabbitMessage: { message: AvatarModule.Message },
  GotEmptyShadcnMessage: { message: AvatarModule.Message },
  GotEmptyMaxleiterMessage: { message: AvatarModule.Message },
  GotEmptyEvilrabbitMessage: { message: AvatarModule.Message },
})

const avatarWithImage = (
  id: string,
  src: string,
  alt: string,
  fallback: string,
  size: 'sm' | 'default' | 'lg',
  model: AvatarModule.Model,
  toParent: (m: AvatarModule.Message) => AppMessage,
  h: HtmlBuilder<AppMessage>,
  badge?: Html,
): Html =>
  Avatar<AppMessage>(
    { size },
    [
      Avatar.picture({ id, src, alt, fallback: [fallback] }, model, toParent, h),
      ...(badge ? [badge] : []),
    ],
    h,
  )

const avatarFallbackOnly = (
  fallback: string,
  size: 'sm' | 'default' | 'lg',
  h: HtmlBuilder<AppMessage>,
  badge?: Html,
): Html =>
  Avatar<AppMessage>(
    { size },
    [Avatar.fallback<AppMessage>({}, [fallback], h), ...(badge ? [badge] : [])],
    h,
  )

export const avatarView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Sizes']),
          h.div(
            [h.Class('flex flex-wrap items-center gap-2')],
            [
              avatarWithImage(
                'avatar-size-shadcn-sm',
                'https://github.com/shadcn.png',
                '@shadcn',
                'CN',
                'sm',
                model.avatarSizeShadcnSm,
                (m) => Message.GotSizeShadcnSmMessage({ message: m }),
                h,
              ),
              avatarWithImage(
                'avatar-size-shadcn-default',
                'https://github.com/shadcn.png',
                '@shadcn',
                'CN',
                'default',
                model.avatarSizeShadcnDefault,
                (m) => Message.GotSizeShadcnDefaultMessage({ message: m }),
                h,
              ),
              avatarWithImage(
                'avatar-size-shadcn-lg',
                'https://github.com/shadcn.png',
                '@shadcn',
                'CN',
                'lg',
                model.avatarSizeShadcnLg,
                (m) => Message.GotSizeShadcnLgMessage({ message: m }),
                h,
              ),
            ],
          ),
          h.div(
            [h.Class('flex flex-wrap items-center gap-2')],
            [
              avatarFallbackOnly('CN', 'sm', h),
              avatarFallbackOnly('CN', 'default', h),
              avatarFallbackOnly('CN', 'lg', h),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Badge']),
          h.div(
            [h.Class('flex flex-wrap items-center gap-2')],
            [
              avatarWithImage(
                'avatar-badge-jz-sm',
                'https://github.com/jorgezreik.png',
                '@jorgezreik',
                'JZ',
                'sm',
                model.avatarBadgeJzSm,
                (m) => Message.GotBadgeJzSmMessage({ message: m }),
                h,
                Avatar.badge<AppMessage>({}, [], h),
              ),
              avatarWithImage(
                'avatar-badge-jz-default',
                'https://github.com/jorgezreik.png',
                '@jorgezreik',
                'JZ',
                'default',
                model.avatarBadgeJzDefault,
                (m) => Message.GotBadgeJzDefaultMessage({ message: m }),
                h,
                Avatar.badge<AppMessage>({}, [], h),
              ),
              avatarWithImage(
                'avatar-badge-jz-lg',
                'https://github.com/jorgezreik.png',
                '@jorgezreik',
                'JZ',
                'lg',
                model.avatarBadgeJzLg,
                (m) => Message.GotBadgeJzLgMessage({ message: m }),
                h,
                Avatar.badge<AppMessage>({}, [], h),
              ),
            ],
          ),
          h.div(
            [h.Class('flex flex-wrap items-center gap-2')],
            [
              avatarFallbackOnly('JZ', 'sm', h, Avatar.badge<AppMessage>({}, [], h)),
              avatarFallbackOnly('JZ', 'default', h, Avatar.badge<AppMessage>({}, [], h)),
              avatarFallbackOnly('JZ', 'lg', h, Avatar.badge<AppMessage>({}, [], h)),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Badge with Icon']),
          h.div(
            [h.Class('flex flex-wrap items-center gap-2')],
            [
              avatarWithImage(
                'avatar-badgeicon-pp-sm',
                'https://github.com/pranathip.png',
                '@pranathip',
                'PP',
                'sm',
                model.avatarBadgeIconPpSm,
                (m) => Message.GotBadgeIconPpSmMessage({ message: m }),
                h,
                Avatar.badge<AppMessage>({}, [icon(h, Plus, 'size-3')], h),
              ),
              avatarWithImage(
                'avatar-badgeicon-pp-default',
                'https://github.com/pranathip.png',
                '@pranathip',
                'PP',
                'default',
                model.avatarBadgeIconPpDefault,
                (m) => Message.GotBadgeIconPpDefaultMessage({ message: m }),
                h,
                Avatar.badge<AppMessage>({}, [icon(h, Plus, 'size-3')], h),
              ),
              avatarWithImage(
                'avatar-badgeicon-pp-lg',
                'https://github.com/pranathip.png',
                '@pranathip',
                'PP',
                'lg',
                model.avatarBadgeIconPpLg,
                (m) => Message.GotBadgeIconPpLgMessage({ message: m }),
                h,
                Avatar.badge<AppMessage>({}, [icon(h, Plus, 'size-3')], h),
              ),
            ],
          ),
          h.div(
            [h.Class('flex flex-wrap items-center gap-2')],
            [
              avatarFallbackOnly(
                'PP',
                'sm',
                h,
                Avatar.badge<AppMessage>({}, [icon(h, Check, 'size-3')], h),
              ),
              avatarFallbackOnly(
                'PP',
                'default',
                h,
                Avatar.badge<AppMessage>({}, [icon(h, Check, 'size-3')], h),
              ),
              avatarFallbackOnly(
                'PP',
                'lg',
                h,
                Avatar.badge<AppMessage>({}, [icon(h, Check, 'size-3')], h),
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Group']),
          Avatar.group<AppMessage>(
            {},
            [
              avatarWithImage(
                'avatar-group-shadcn',
                'https://github.com/shadcn.png',
                '@shadcn',
                'CN',
                'default',
                model.avatarGroupShadcn,
                (m) => Message.GotGroupShadcnMessage({ message: m }),
                h,
              ),
              avatarWithImage(
                'avatar-group-maxleiter',
                'https://github.com/maxleiter.png',
                '@maxleiter',
                'LR',
                'default',
                model.avatarGroupMaxleiter,
                (m) => Message.GotGroupMaxleiterMessage({ message: m }),
                h,
              ),
              avatarWithImage(
                'avatar-group-evilrabbit',
                'https://github.com/evilrabbit.png',
                '@evilrabbit',
                'ER',
                'default',
                model.avatarGroupEvilrabbit,
                (m) => Message.GotGroupEvilrabbitMessage({ message: m }),
                h,
              ),
            ],
            h,
          ),
          Avatar.group<AppMessage>(
            { className: 'data-[slot=avatar-group]:gap-0' },
            [
              Avatar<AppMessage>({ size: 'sm' }, [Avatar.fallback<AppMessage>({}, ['CN'], h)], h),
              Avatar<AppMessage>({ size: 'sm' }, [Avatar.fallback<AppMessage>({}, ['LR'], h)], h),
              Avatar<AppMessage>({ size: 'sm' }, [Avatar.fallback<AppMessage>({}, ['ER'], h)], h),
            ],
            h,
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Group with Count']),
          Avatar.group<AppMessage>(
            {},
            [
              avatarWithImage(
                'avatar-groupcount-shadcn',
                'https://github.com/shadcn.png',
                '@shadcn',
                'CN',
                'default',
                model.avatarGroupCountShadcn,
                (m) => Message.GotGroupCountShadcnMessage({ message: m }),
                h,
              ),
              avatarWithImage(
                'avatar-groupcount-maxleiter',
                'https://github.com/maxleiter.png',
                '@maxleiter',
                'LR',
                'default',
                model.avatarGroupCountMaxleiter,
                (m) => Message.GotGroupCountMaxleiterMessage({ message: m }),
                h,
              ),
              avatarWithImage(
                'avatar-groupcount-evilrabbit',
                'https://github.com/evilrabbit.png',
                '@evilrabbit',
                'ER',
                'default',
                model.avatarGroupCountEvilrabbit,
                (m) => Message.GotGroupCountEvilrabbitMessage({ message: m }),
                h,
              ),
              Avatar.groupCount<AppMessage>({}, ['+3'], h),
            ],
            h,
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div(
            [h.Class('px-1 text-xs font-medium text-muted-foreground')],
            ['Group with Icon Count'],
          ),
          Avatar.group<AppMessage>(
            {},
            [
              Avatar<AppMessage>({ size: 'sm' }, [Avatar.fallback<AppMessage>({}, ['CN'], h)], h),
              Avatar<AppMessage>({ size: 'sm' }, [Avatar.fallback<AppMessage>({}, ['LR'], h)], h),
              Avatar<AppMessage>({ size: 'sm' }, [Avatar.fallback<AppMessage>({}, ['ER'], h)], h),
              Avatar.groupCount<AppMessage>({}, [icon(h, Plus, 'size-4')], h),
            ],
            h,
          ),
          Avatar.group<AppMessage>(
            {},
            [
              Avatar<AppMessage>({}, [Avatar.fallback<AppMessage>({}, ['CN'], h)], h),
              Avatar<AppMessage>({}, [Avatar.fallback<AppMessage>({}, ['LR'], h)], h),
              Avatar<AppMessage>({}, [Avatar.fallback<AppMessage>({}, ['ER'], h)], h),
              Avatar.groupCount<AppMessage>({}, [icon(h, Plus, 'size-4')], h),
            ],
            h,
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['In Empty']),
          Empty<AppMessage>(
            { className: 'w-full flex-none border' },
            [
              Empty.header<AppMessage>(
                {},
                [
                  Empty.media<AppMessage>(
                    {},
                    [
                      Avatar.group<AppMessage>(
                        {},
                        [
                          avatarWithImage(
                            'avatar-empty-shadcn',
                            'https://github.com/shadcn.png',
                            '@shadcn',
                            'CN',
                            'lg',
                            model.avatarEmptyShadcn,
                            (m) => Message.GotEmptyShadcnMessage({ message: m }),
                            h,
                          ),
                          avatarWithImage(
                            'avatar-empty-maxleiter',
                            'https://github.com/maxleiter.png',
                            '@maxleiter',
                            'LR',
                            'lg',
                            model.avatarEmptyMaxleiter,
                            (m) => Message.GotEmptyMaxleiterMessage({ message: m }),
                            h,
                          ),
                          avatarWithImage(
                            'avatar-empty-evilrabbit',
                            'https://github.com/evilrabbit.png',
                            '@evilrabbit',
                            'ER',
                            'lg',
                            model.avatarEmptyEvilrabbit,
                            (m) => Message.GotEmptyEvilrabbitMessage({ message: m }),
                            h,
                          ),
                          Avatar.groupCount<AppMessage>({}, [icon(h, Plus, 'size-4')], h),
                        ],
                        h,
                      ),
                    ],
                    h,
                  ),
                  Empty.title<AppMessage>({}, ['No Team Members'], h),
                  Empty.description<AppMessage>(
                    {},
                    ['Invite your team to collaborate on this project.'],
                    h,
                  ),
                ],
                h,
              ),
              Empty.content<AppMessage>(
                {},
                [
                  button<AppMessage>(
                    {},
                    h.span(
                      [h.Class('inline-flex items-center gap-1.5')],
                      [icon(h, Plus, 'size-4'), 'Invite Members'],
                    ),
                    h,
                  ),
                ],
                h,
              ),
            ],
            h,
          ),
        ],
      ),
    ],
  )

const fields = {
  avatarSizeShadcnSm: AvatarModule.Model,
  avatarSizeShadcnDefault: AvatarModule.Model,
  avatarSizeShadcnLg: AvatarModule.Model,
  avatarBadgeJzSm: AvatarModule.Model,
  avatarBadgeJzDefault: AvatarModule.Model,
  avatarBadgeJzLg: AvatarModule.Model,
  avatarBadgeIconPpSm: AvatarModule.Model,
  avatarBadgeIconPpDefault: AvatarModule.Model,
  avatarBadgeIconPpLg: AvatarModule.Model,
  avatarGroupShadcn: AvatarModule.Model,
  avatarGroupMaxleiter: AvatarModule.Model,
  avatarGroupEvilrabbit: AvatarModule.Model,
  avatarGroupCountShadcn: AvatarModule.Model,
  avatarGroupCountMaxleiter: AvatarModule.Model,
  avatarGroupCountEvilrabbit: AvatarModule.Model,
  avatarEmptyShadcn: AvatarModule.Model,
  avatarEmptyMaxleiter: AvatarModule.Model,
  avatarEmptyEvilrabbit: AvatarModule.Model,
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

const makeFold = (
  read: (m: State) => Option.Option<AvatarModule.Model>,
  write: (m: State, n: AvatarModule.Model) => State,
  toParent: (m: AvatarModule.Message) => AppMessage,
) =>
  Update.foldChild({
    update: AvatarModule.update,
    read: (model: State): Option.Option<AvatarModule.Model> => read(model),
    write,
    toParentMessage: toParent,
  })

const folds = {
  sizeSm: makeFold(
    (m) => Option.some(m.avatarSizeShadcnSm),
    (m, n) => modifyFields(m, { avatarSizeShadcnSm: () => n }),
    (msg) => Message.GotSizeShadcnSmMessage({ message: msg }),
  ),
  sizeDefault: makeFold(
    (m) => Option.some(m.avatarSizeShadcnDefault),
    (m, n) => modifyFields(m, { avatarSizeShadcnDefault: () => n }),
    (msg) => Message.GotSizeShadcnDefaultMessage({ message: msg }),
  ),
  sizeLg: makeFold(
    (m) => Option.some(m.avatarSizeShadcnLg),
    (m, n) => modifyFields(m, { avatarSizeShadcnLg: () => n }),
    (msg) => Message.GotSizeShadcnLgMessage({ message: msg }),
  ),
  badgeSm: makeFold(
    (m) => Option.some(m.avatarBadgeJzSm),
    (m, n) => modifyFields(m, { avatarBadgeJzSm: () => n }),
    (msg) => Message.GotBadgeJzSmMessage({ message: msg }),
  ),
  badgeDefault: makeFold(
    (m) => Option.some(m.avatarBadgeJzDefault),
    (m, n) => modifyFields(m, { avatarBadgeJzDefault: () => n }),
    (msg) => Message.GotBadgeJzDefaultMessage({ message: msg }),
  ),
  badgeLg: makeFold(
    (m) => Option.some(m.avatarBadgeJzLg),
    (m, n) => modifyFields(m, { avatarBadgeJzLg: () => n }),
    (msg) => Message.GotBadgeJzLgMessage({ message: msg }),
  ),
  badgeIconSm: makeFold(
    (m) => Option.some(m.avatarBadgeIconPpSm),
    (m, n) => modifyFields(m, { avatarBadgeIconPpSm: () => n }),
    (msg) => Message.GotBadgeIconPpSmMessage({ message: msg }),
  ),
  badgeIconDefault: makeFold(
    (m) => Option.some(m.avatarBadgeIconPpDefault),
    (m, n) => modifyFields(m, { avatarBadgeIconPpDefault: () => n }),
    (msg) => Message.GotBadgeIconPpDefaultMessage({ message: msg }),
  ),
  badgeIconLg: makeFold(
    (m) => Option.some(m.avatarBadgeIconPpLg),
    (m, n) => modifyFields(m, { avatarBadgeIconPpLg: () => n }),
    (msg) => Message.GotBadgeIconPpLgMessage({ message: msg }),
  ),
  groupShadcn: makeFold(
    (m) => Option.some(m.avatarGroupShadcn),
    (m, n) => modifyFields(m, { avatarGroupShadcn: () => n }),
    (msg) => Message.GotGroupShadcnMessage({ message: msg }),
  ),
  groupMaxleiter: makeFold(
    (m) => Option.some(m.avatarGroupMaxleiter),
    (m, n) => modifyFields(m, { avatarGroupMaxleiter: () => n }),
    (msg) => Message.GotGroupMaxleiterMessage({ message: msg }),
  ),
  groupEvilrabbit: makeFold(
    (m) => Option.some(m.avatarGroupEvilrabbit),
    (m, n) => modifyFields(m, { avatarGroupEvilrabbit: () => n }),
    (msg) => Message.GotGroupEvilrabbitMessage({ message: msg }),
  ),
  groupCountShadcn: makeFold(
    (m) => Option.some(m.avatarGroupCountShadcn),
    (m, n) => modifyFields(m, { avatarGroupCountShadcn: () => n }),
    (msg) => Message.GotGroupCountShadcnMessage({ message: msg }),
  ),
  groupCountMaxleiter: makeFold(
    (m) => Option.some(m.avatarGroupCountMaxleiter),
    (m, n) => modifyFields(m, { avatarGroupCountMaxleiter: () => n }),
    (msg) => Message.GotGroupCountMaxleiterMessage({ message: msg }),
  ),
  groupCountEvilrabbit: makeFold(
    (m) => Option.some(m.avatarGroupCountEvilrabbit),
    (m, n) => modifyFields(m, { avatarGroupCountEvilrabbit: () => n }),
    (msg) => Message.GotGroupCountEvilrabbitMessage({ message: msg }),
  ),
  emptyShadcn: makeFold(
    (m) => Option.some(m.avatarEmptyShadcn),
    (m, n) => modifyFields(m, { avatarEmptyShadcn: () => n }),
    (msg) => Message.GotEmptyShadcnMessage({ message: msg }),
  ),
  emptyMaxleiter: makeFold(
    (m) => Option.some(m.avatarEmptyMaxleiter),
    (m, n) => modifyFields(m, { avatarEmptyMaxleiter: () => n }),
    (msg) => Message.GotEmptyMaxleiterMessage({ message: msg }),
  ),
  emptyEvilrabbit: makeFold(
    (m) => Option.some(m.avatarEmptyEvilrabbit),
    (m, n) => modifyFields(m, { avatarEmptyEvilrabbit: () => n }),
    (msg) => Message.GotEmptyEvilrabbitMessage({ message: msg }),
  ),
}

export const slice = defineSlice({
  fields,
  init: {
    avatarSizeShadcnSm: AvatarModule.init,
    avatarSizeShadcnDefault: AvatarModule.init,
    avatarSizeShadcnLg: AvatarModule.init,
    avatarBadgeJzSm: AvatarModule.init,
    avatarBadgeJzDefault: AvatarModule.init,
    avatarBadgeJzLg: AvatarModule.init,
    avatarBadgeIconPpSm: AvatarModule.init,
    avatarBadgeIconPpDefault: AvatarModule.init,
    avatarBadgeIconPpLg: AvatarModule.init,
    avatarGroupShadcn: AvatarModule.init,
    avatarGroupMaxleiter: AvatarModule.init,
    avatarGroupEvilrabbit: AvatarModule.init,
    avatarGroupCountShadcn: AvatarModule.init,
    avatarGroupCountMaxleiter: AvatarModule.init,
    avatarGroupCountEvilrabbit: AvatarModule.init,
    avatarEmptyShadcn: AvatarModule.init,
    avatarEmptyMaxleiter: AvatarModule.init,
    avatarEmptyEvilrabbit: AvatarModule.init,
  },
  messages: [
    Message.GotSizeShadcnSmMessage,
    Message.GotSizeShadcnDefaultMessage,
    Message.GotSizeShadcnLgMessage,
    Message.GotBadgeJzSmMessage,
    Message.GotBadgeJzDefaultMessage,
    Message.GotBadgeJzLgMessage,
    Message.GotBadgeIconPpSmMessage,
    Message.GotBadgeIconPpDefaultMessage,
    Message.GotBadgeIconPpLgMessage,
    Message.GotGroupShadcnMessage,
    Message.GotGroupMaxleiterMessage,
    Message.GotGroupEvilrabbitMessage,
    Message.GotGroupCountShadcnMessage,
    Message.GotGroupCountMaxleiterMessage,
    Message.GotGroupCountEvilrabbitMessage,
    Message.GotEmptyShadcnMessage,
    Message.GotEmptyMaxleiterMessage,
    Message.GotEmptyEvilrabbitMessage,
  ],
  handlers: (model: State) => ({
    GotSizeShadcnSmMessage: (p: typeof Message.GotSizeShadcnSmMessage.Type): UpdateReturn =>
      folds.sizeSm(model, p.message),
    GotSizeShadcnDefaultMessage: (
      p: typeof Message.GotSizeShadcnDefaultMessage.Type,
    ): UpdateReturn => folds.sizeDefault(model, p.message),
    GotSizeShadcnLgMessage: (p: typeof Message.GotSizeShadcnLgMessage.Type): UpdateReturn =>
      folds.sizeLg(model, p.message),
    GotBadgeJzSmMessage: (p: typeof Message.GotBadgeJzSmMessage.Type): UpdateReturn =>
      folds.badgeSm(model, p.message),
    GotBadgeJzDefaultMessage: (p: typeof Message.GotBadgeJzDefaultMessage.Type): UpdateReturn =>
      folds.badgeDefault(model, p.message),
    GotBadgeJzLgMessage: (p: typeof Message.GotBadgeJzLgMessage.Type): UpdateReturn =>
      folds.badgeLg(model, p.message),
    GotBadgeIconPpSmMessage: (p: typeof Message.GotBadgeIconPpSmMessage.Type): UpdateReturn =>
      folds.badgeIconSm(model, p.message),
    GotBadgeIconPpDefaultMessage: (
      p: typeof Message.GotBadgeIconPpDefaultMessage.Type,
    ): UpdateReturn => folds.badgeIconDefault(model, p.message),
    GotBadgeIconPpLgMessage: (p: typeof Message.GotBadgeIconPpLgMessage.Type): UpdateReturn =>
      folds.badgeIconLg(model, p.message),
    GotGroupShadcnMessage: (p: typeof Message.GotGroupShadcnMessage.Type): UpdateReturn =>
      folds.groupShadcn(model, p.message),
    GotGroupMaxleiterMessage: (p: typeof Message.GotGroupMaxleiterMessage.Type): UpdateReturn =>
      folds.groupMaxleiter(model, p.message),
    GotGroupEvilrabbitMessage: (p: typeof Message.GotGroupEvilrabbitMessage.Type): UpdateReturn =>
      folds.groupEvilrabbit(model, p.message),
    GotGroupCountShadcnMessage: (p: typeof Message.GotGroupCountShadcnMessage.Type): UpdateReturn =>
      folds.groupCountShadcn(model, p.message),
    GotGroupCountMaxleiterMessage: (
      p: typeof Message.GotGroupCountMaxleiterMessage.Type,
    ): UpdateReturn => folds.groupCountMaxleiter(model, p.message),
    GotGroupCountEvilrabbitMessage: (
      p: typeof Message.GotGroupCountEvilrabbitMessage.Type,
    ): UpdateReturn => folds.groupCountEvilrabbit(model, p.message),
    GotEmptyShadcnMessage: (p: typeof Message.GotEmptyShadcnMessage.Type): UpdateReturn =>
      folds.emptyShadcn(model, p.message),
    GotEmptyMaxleiterMessage: (p: typeof Message.GotEmptyMaxleiterMessage.Type): UpdateReturn =>
      folds.emptyMaxleiter(model, p.message),
    GotEmptyEvilrabbitMessage: (p: typeof Message.GotEmptyEvilrabbitMessage.Type): UpdateReturn =>
      folds.emptyEvilrabbit(model, p.message),
  }),
  samples: [Message.GotSizeShadcnSmMessage({ message: AvatarModule.Message.ImageErrored() })],
})
