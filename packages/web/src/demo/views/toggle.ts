import { Update } from 'foldkit'
import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as toggle from '../../generated/registry/ui/toggle'
import { icon } from '../../generated/registry/lib/icons'
import { Bookmark, Bold, Italic, Underline } from 'lucide'
import { button } from '../../generated/registry/ui/button'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotToggleMessage: { message: toggle.Message },
})

const staticToggle = (
  h: HtmlBuilder<AppMessage>,
  label: Html | string,
  opts?: {
    variant?: toggle.ToggleVariant
    size?: toggle.ToggleSize
    pressed?: boolean
    disabled?: boolean
  },
): Html =>
  h.button(
    [
      h.Type('button'),
      h.DataAttribute('slot', 'toggle'),
      h.DataAttribute('state', opts?.pressed === true ? 'on' : 'off'),
      h.AriaPressed(opts?.pressed === true ? 'true' : 'false'),
      ...(opts?.disabled === true ? [h.Disabled(true)] : []),
      h.Class(
        [
          toggle.toggleBase,
          toggle.toggleVariants[opts?.variant ?? 'default'],
          toggle.toggleSizes[opts?.size ?? 'default'],
        ].join(' '),
      ),
    ],
    [label],
  )

export const toggleView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Basic']),
          h.div(
            [h.Class('flex flex-wrap items-center gap-2')],
            [
              staticToggle(h, icon(h, Bold, 'size-4'), { pressed: true }),
              staticToggle(h, icon(h, Italic, 'size-4')),
              staticToggle(h, icon(h, Underline, 'size-4')),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Outline']),
          h.div(
            [h.Class('flex flex-wrap items-center gap-2')],
            [
              staticToggle(h, h.span([], [icon(h, Italic, 'size-4'), ' Italic']), {
                variant: 'outline',
              }),
              staticToggle(h, h.span([], [icon(h, Bold, 'size-4'), ' Bold']), {
                variant: 'outline',
              }),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Sizes']),
          h.div(
            [h.Class('flex flex-wrap items-center gap-2')],
            [
              staticToggle(h, 'Small', { variant: 'outline', size: 'sm' }),
              staticToggle(h, 'Default', { variant: 'outline', size: 'default' }),
              staticToggle(h, 'Large', { variant: 'outline', size: 'lg' }),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Button']),
          h.div(
            [h.Class('flex flex-col gap-4')],
            [
              h.div(
                [h.Class('flex items-center gap-2')],
                [
                  button<AppMessage>({ size: 'sm', variant: 'outline' }, 'Button', h),
                  staticToggle(h, 'Toggle', { variant: 'outline', size: 'sm' }),
                ],
              ),
              h.div(
                [h.Class('flex items-center gap-2')],
                [
                  button<AppMessage>({ size: 'default', variant: 'outline' }, 'Button', h),
                  staticToggle(h, 'Toggle', { variant: 'outline', size: 'default' }),
                ],
              ),
              h.div(
                [h.Class('flex items-center gap-2')],
                [
                  button<AppMessage>({ size: 'lg', variant: 'outline' }, 'Button', h),
                  staticToggle(h, 'Toggle', { variant: 'outline', size: 'lg' }),
                ],
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Disabled']),
          h.div(
            [h.Class('flex flex-wrap items-center gap-2')],
            [
              staticToggle(h, 'Disabled', { disabled: true }),
              staticToggle(h, 'Disabled', { variant: 'outline', disabled: true }),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Icon']),
          h.div(
            [h.Class('flex flex-wrap items-center gap-2')],
            [
              staticToggle(
                h,
                icon(h, Bookmark, 'size-4 group-data-[state=on]/toggle:fill-accent-foreground'),
                { pressed: true },
              ),
              staticToggle(
                h,
                h.span(
                  [],
                  [
                    icon(h, Bookmark, 'size-4 group-data-[state=on]/toggle:fill-accent-foreground'),
                    ' Bookmark',
                  ],
                ),
                { variant: 'outline' },
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Interactive']),
          h.div(
            [h.Class('flex w-full max-w-sm flex-col gap-4')],
            [
              h.submodel({
                slotId: model.toggle.id,
                model: model.toggle,
                view: toggle.view,
                viewInputs: {
                  variant: 'outline',
                  size: 'sm',
                  ariaLabel: 'Toggle bookmark',
                  label: h.span(
                    [],
                    [
                      icon(
                        h,
                        Bookmark,
                        'size-4 shrink-0 group-aria-pressed/toggle:fill-foreground',
                      ),
                      ' Bookmark',
                    ],
                  ),
                },
                toParentMessage: (message) => Message.GotToggleMessage({ message }),
              }),
            ],
          ),
        ],
      ),
    ],
  )

const foldNoOp =
  <Out>(): ((out: Out) => Update.Step<State, unknown>) =>
  () =>
  (model) => ({ model })

const foldToggleOutMessage = M.type<toggle.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    ChangedPressed: foldNoOp(),
  }),
)

const foldToggle = Update.foldChild({
  update: toggle.update,
  read: (model: State) => Option.some(model.toggle),
  write: (model, next) => evo(model, { toggle: () => next }),
  toParentMessage: (message) => Message.GotToggleMessage({ message }),
  foldOutMessage: foldToggleOutMessage,
})

const fields = { toggle: toggle.Model }

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: { toggle: toggle.init({ id: 'toggle-demo' }) },
  messages: [Message.GotToggleMessage],
  handlers: (model: State) => ({
    GotToggleMessage: (payload: typeof Message.GotToggleMessage.Type): UpdateReturn =>
      foldToggle(model, payload.message),
  }),
  samples: [],
})
