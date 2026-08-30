import { Update } from 'foldkit'
import { Bold, Italic, Underline, Star, Heart, Bookmark } from 'lucide'
import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as toggleGroup from '../../generated/registry/ui/toggle-group'
import * as toggle from '../../generated/registry/ui/toggle'
import { icon } from '../../generated/registry/lib/icons'
import { field, fieldDescription, fieldLabel } from '../../generated/registry/ui/fieldset'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotToggleGroupMessage: { message: toggleGroup.Message },
})

const staticGroup = (
  h: HtmlBuilder<AppMessage>,
  items: ReadonlyArray<{ value: string; label: string; icon?: typeof Bold }>,
  opts?: {
    variant?: toggle.ToggleVariant
    size?: toggle.ToggleSize
    spacing?: number
    orientation?: string
  },
): Html => {
  const variant = opts?.variant ?? 'default'
  const size = opts?.size ?? 'default'
  const spacing = opts?.spacing ?? 2
  const orientation = opts?.orientation ?? 'horizontal'
  return h.div(
    [
      h.Role('group'),
      h.Class(toggleGroup.toggleGroupClass),
      h.DataAttribute('slot', 'toggle-group'),
      h.DataAttribute('orientation', orientation),
      h.DataAttribute('spacing', String(spacing)),
      h.DataAttribute('variant', variant),
      h.DataAttribute('size', size),
      ...(orientation === 'vertical'
        ? [h.DataAttribute('vertical', '')]
        : [h.DataAttribute('horizontal', '')]),
      h.Style({ '--gap': String(spacing) }),
    ],
    items.map((item) =>
      h.button(
        [
          h.Type('button'),
          h.DataAttribute('slot', 'toggle-group-item'),
          h.DataAttribute('variant', variant),
          h.DataAttribute('size', size),
          h.DataAttribute('spacing', String(spacing)),
          h.DataAttribute('state', 'off'),
          h.AriaPressed('false'),
          h.Class(
            [
              toggle.toggleBase,
              toggle.toggleVariants[variant],
              toggle.toggleSizes[size],
              toggleGroup.toggleGroupItemClass,
            ].join(' '),
          ),
        ],
        [
          item.icon === undefined
            ? item.label
            : h.span([], [icon(h, item.icon, 'size-4'), ` ${item.label}`.trimStart()]),
        ],
      ),
    ),
  )
}

export const toggleGroupView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Basic']),
          h.submodel({
            slotId: model.toggleGroup.id,
            model: model.toggleGroup,
            view: toggleGroup.view,
            viewInputs: {
              variant: 'outline',
              items: [
                { value: 'bold', label: 'Bold', icon: Bold },
                { value: 'italic', label: 'Italic', icon: Italic },
                { value: 'strikethrough', label: 'Strikethrough', icon: Underline },
              ],
            },
            toParentMessage: (message) => Message.GotToggleGroupMessage({ message }),
          }),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Outline']),
          staticGroup(
            h,
            [
              { value: 'all', label: 'All' },
              { value: 'missed', label: 'Missed' },
            ],
            { variant: 'outline' },
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Sizes']),
          h.div(
            [h.Class('flex flex-col gap-4')],
            [
              staticGroup(
                h,
                [
                  { value: 'top', label: 'Top' },
                  { value: 'bottom', label: 'Bottom' },
                  { value: 'left', label: 'Left' },
                  { value: 'right', label: 'Right' },
                ],
                { variant: 'outline', size: 'sm' },
              ),
              staticGroup(
                h,
                [
                  { value: 'top', label: 'Top' },
                  { value: 'bottom', label: 'Bottom' },
                  { value: 'left', label: 'Left' },
                  { value: 'right', label: 'Right' },
                ],
                { variant: 'outline', size: 'default' },
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Icons']),
          staticGroup(
            h,
            [
              { value: 'star', label: 'Star', icon: Star },
              { value: 'heart', label: 'Heart', icon: Heart },
              { value: 'bookmark', label: 'Bookmark', icon: Bookmark },
            ],
            { variant: 'outline', spacing: 2, size: 'sm' },
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Filter']),
          staticGroup(
            h,
            [
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'completed', label: 'Completed' },
              { value: 'archived', label: 'Archived' },
            ],
            { variant: 'outline', size: 'sm' },
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Sort']),
          staticGroup(
            h,
            [
              { value: 'newest', label: 'Newest' },
              { value: 'oldest', label: 'Oldest' },
              { value: 'popular', label: 'Popular' },
            ],
            { variant: 'outline', size: 'sm' },
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Vertical']),
          staticGroup(
            h,
            [
              { value: 'bold', label: '', icon: Bold },
              { value: 'italic', label: '', icon: Italic },
              { value: 'underline', label: '', icon: Underline },
            ],
            { orientation: 'vertical', spacing: 1 },
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div(
            [h.Class('px-1 text-xs font-medium text-muted-foreground')],
            ['Font Weight Selector'],
          ),
          field<AppMessage>(
            {},
            [
              fieldLabel<AppMessage>({}, ['Font Weight'], h),
              staticGroup(
                h,
                [
                  { value: 'light', label: 'Light' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'bold', label: 'Bold' },
                ],
                { variant: 'outline', spacing: 2, size: 'default' },
              ),
              fieldDescription<AppMessage>({}, ['Use font-normal to set the font weight.'], h),
            ],
            h,
          ),
        ],
      ),
    ],
  )

const foldNoOp =
  <Out>(): ((out: Out) => Update.Step<State, unknown>) =>
  () =>
  (model) => ({ model })

const foldToggleGroupOutMessage = M.type<toggleGroup.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    ChangedValue: foldNoOp(),
  }),
)

const foldToggleGroup = Update.foldChild({
  update: toggleGroup.update,
  read: (model: State) => Option.some(model.toggleGroup),
  write: (model, next) => evo(model, { toggleGroup: () => next }),
  toParentMessage: (message) => Message.GotToggleGroupMessage({ message }),
  foldOutMessage: foldToggleGroupOutMessage,
})

const fields = { toggleGroup: toggleGroup.Model }

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: {
    toggleGroup: toggleGroup.init({ id: 'toggle-group-demo', type: 'multiple', value: ['bold'] }),
  },
  messages: [Message.GotToggleGroupMessage],
  handlers: (model: State) => ({
    GotToggleGroupMessage: (payload: typeof Message.GotToggleGroupMessage.Type): UpdateReturn =>
      foldToggleGroup(model, payload.message),
  }),
  samples: [
    Message.GotToggleGroupMessage({
      message: toggleGroup.Message.ToggledItem({ value: 'italic' }),
    }),
  ],
})
