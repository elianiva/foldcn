import { Update } from 'foldkit'
import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as collapsible from '../../generated/registry/ui/collapsible'
import { Card } from '../../generated/registry/ui/card'
import { icon } from '../../generated/registry/lib/icons'
import { ChevronRight, File as FileIcon, Folder } from 'lucide'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotCollapsibleMessage: { message: collapsible.Message },
  GotCollapsibleComponentsMessage: { message: collapsible.Message },
  GotCollapsibleLibMessage: { message: collapsible.Message },
  GotCollapsibleSettingsMessage: { message: collapsible.Message },
})

const fileLeaf = (name: string, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full items-center gap-2 rounded-md px-2 py-1 text-sm')],
    [icon(h, FileIcon, 'size-4'), h.span([], [name])],
  )

export const collapsibleView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['File Tree']),
          Card<AppMessage>(
            { className: 'mx-auto w-full max-w-sm gap-2' },
            [
              Card.header<AppMessage>(
                {},
                [h.div([h.Class('text-sm font-medium')], ['Explorer'])],
                h,
              ),
              Card.content<AppMessage>(
                {},
                [
                  h.div(
                    [h.Class('flex flex-col gap-1')],
                    [
                      h.submodel({
                        slotId: model.collapsibleComponents.id,
                        model: model.collapsibleComponents,
                        view: collapsible.view,
                        viewInputs: {
                          title: h.span(
                            [h.Class('inline-flex items-center gap-1.5')],
                            [
                              icon(h, ChevronRight, 'size-3.5'),
                              icon(h, Folder, 'size-4'),
                              'components',
                            ],
                          ),
                          content: h.div(
                            [h.Class('ml-5 flex flex-col gap-1')],
                            [
                              fileLeaf('button.tsx', h),
                              fileLeaf('card.tsx', h),
                              fileLeaf('dialog.tsx', h),
                            ],
                          ),
                        },
                        toParentMessage: (message) =>
                          Message.GotCollapsibleComponentsMessage({ message }),
                      }),
                      h.submodel({
                        slotId: model.collapsibleLib.id,
                        model: model.collapsibleLib,
                        view: collapsible.view,
                        viewInputs: {
                          title: h.span(
                            [h.Class('inline-flex items-center gap-1.5')],
                            [icon(h, ChevronRight, 'size-3.5'), icon(h, Folder, 'size-4'), 'lib'],
                          ),
                          content: h.div(
                            [h.Class('ml-5 flex flex-col gap-1')],
                            [fileLeaf('utils.ts', h), fileLeaf('cn.ts', h)],
                          ),
                        },
                        toParentMessage: (message) => Message.GotCollapsibleLibMessage({ message }),
                      }),
                      fileLeaf('app.tsx', h),
                      fileLeaf('package.json', h),
                    ],
                  ),
                ],
                h,
              ),
            ],
            h,
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Settings']),
          Card<AppMessage>(
            { className: 'mx-auto w-full max-w-xs' },
            [
              Card.header<AppMessage>(
                {},
                [
                  Card.title<AppMessage>({}, ['Radius'], h),
                  Card.description<AppMessage>({}, ['Set the corner radius of the element.'], h),
                ],
                h,
              ),
              Card.content<AppMessage>(
                {},
                [
                  h.submodel({
                    slotId: model.collapsibleSettings.id,
                    model: model.collapsibleSettings,
                    view: collapsible.view,
                    viewInputs: {
                      title: 'Order #4189 - Shipped',
                      content:
                        'Shipping address: 100 Market St, San Francisco - Items: 2x Studio Headphones',
                    },
                    toParentMessage: (message) =>
                      Message.GotCollapsibleSettingsMessage({ message }),
                  }),
                ],
                h,
              ),
            ],
            h,
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Single']),
          h.div(
            [h.Class('flex w-[350px] flex-col gap-2')],
            [
              h.submodel({
                slotId: model.collapsible.id,
                model: model.collapsible,
                view: collapsible.view,
                viewInputs: {
                  title: 'Order #4189 - Shipped',
                  content:
                    'Shipping address: 100 Market St, San Francisco - Items: 2x Studio Headphones',
                },
                toParentMessage: (message) => Message.GotCollapsibleMessage({ message }),
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

const foldOut = M.type<collapsible.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({ ChangedOpen: foldNoOp() }),
)

const makeFold = (
  read: (m: State) => Option.Option<collapsible.Model>,
  write: (m: State, n: collapsible.Model) => State,
  toParent: (m: collapsible.Message) => AppMessage,
) =>
  Update.foldChild({
    update: collapsible.update,
    read: (model: State): Option.Option<collapsible.Model> => read(model),
    write,
    toParentMessage: toParent,
    foldOutMessage: foldOut,
  })

const folds = {
  main: makeFold(
    (m) => Option.some(m.collapsible),
    (m, n) => evo(m, { collapsible: () => n }),
    (msg) => Message.GotCollapsibleMessage({ message: msg }),
  ),
  components: makeFold(
    (m) => Option.some(m.collapsibleComponents),
    (m, n) => evo(m, { collapsibleComponents: () => n }),
    (msg) => Message.GotCollapsibleComponentsMessage({ message: msg }),
  ),
  lib: makeFold(
    (m) => Option.some(m.collapsibleLib),
    (m, n) => evo(m, { collapsibleLib: () => n }),
    (msg) => Message.GotCollapsibleLibMessage({ message: msg }),
  ),
  settings: makeFold(
    (m) => Option.some(m.collapsibleSettings),
    (m, n) => evo(m, { collapsibleSettings: () => n }),
    (msg) => Message.GotCollapsibleSettingsMessage({ message: msg }),
  ),
}

const fields = {
  collapsible: collapsible.Model,
  collapsibleComponents: collapsible.Model,
  collapsibleLib: collapsible.Model,
  collapsibleSettings: collapsible.Model,
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: {
    collapsible: collapsible.init({ id: 'collapsible-demo', isAnimated: true }),
    collapsibleComponents: collapsible.init({
      id: 'collapsible-components',
      isAnimated: true,
      isOpen: true,
    }),
    collapsibleLib: collapsible.init({ id: 'collapsible-lib', isAnimated: true }),
    collapsibleSettings: collapsible.init({ id: 'collapsible-settings', isAnimated: true }),
  },
  messages: [
    Message.GotCollapsibleMessage,
    Message.GotCollapsibleComponentsMessage,
    Message.GotCollapsibleLibMessage,
    Message.GotCollapsibleSettingsMessage,
  ],
  handlers: (model: State) => ({
    GotCollapsibleMessage: (p: typeof Message.GotCollapsibleMessage.Type): UpdateReturn =>
      folds.main(model, p.message),
    GotCollapsibleComponentsMessage: (
      p: typeof Message.GotCollapsibleComponentsMessage.Type,
    ): UpdateReturn => folds.components(model, p.message),
    GotCollapsibleLibMessage: (p: typeof Message.GotCollapsibleLibMessage.Type): UpdateReturn =>
      folds.lib(model, p.message),
    GotCollapsibleSettingsMessage: (
      p: typeof Message.GotCollapsibleSettingsMessage.Type,
    ): UpdateReturn => folds.settings(model, p.message),
  }),
  samples: [],
})
