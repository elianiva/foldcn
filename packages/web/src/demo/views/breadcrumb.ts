import { Update } from 'foldkit'
import { Match as M, Option } from 'effect'
import { Schema as S } from 'effect'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { Menu as FoldkitMenu } from '@foldkit/ui'

import { Breadcrumb } from '../../generated/registry/ui/breadcrumb'
import * as menu from '../../generated/registry/ui/menu'

import { DemoMenu } from '../bundles'
import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

export const Message = defineMessageUnion({
  GotBreadcrumbMenuMessage: { message: menu.Message },
})

export const breadcrumbView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Basic']),
          Breadcrumb(
            {},
            [
              Breadcrumb.list(
                {},
                [
                  Breadcrumb.item({}, [Breadcrumb.link({}, ['Home'], h)], h),
                  Breadcrumb.separator({}, [], h),
                  Breadcrumb.item({}, [Breadcrumb.link({}, ['Components'], h)], h),
                  Breadcrumb.separator({}, [], h),
                  Breadcrumb.item({}, [Breadcrumb.page({}, ['Breadcrumb'], h)], h),
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
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Dropdown']),
          Breadcrumb(
            {},
            [
              Breadcrumb.list(
                {},
                [
                  Breadcrumb.item({}, [Breadcrumb.link({}, ['Home'], h)], h),
                  Breadcrumb.separator({}, [], h),
                  Breadcrumb.item(
                    {},
                    [
                      h.submodel({
                        slotId: model.breadcrumbMenu.id,
                        model: model.breadcrumbMenu,
                        view: DemoMenu.view,
                        viewInputs: menu.viewInputs<string>({
                          items: ['Documentation', 'Themes', 'GitHub'],
                          buttonContent: h.span(
                            [],
                            [
                              Breadcrumb.ellipsis({}, [], h),
                              h.span([h.Class('sr-only')], ['Toggle menu']),
                            ],
                          ),
                          itemToConfig: (item) => ({
                            content: h.span([], [item]),
                          }),
                        }),
                        toParentMessage: (message) => Message.GotBreadcrumbMenuMessage({ message }),
                      }),
                    ],
                    h,
                  ),
                  Breadcrumb.separator({}, [], h),
                  Breadcrumb.item({}, [Breadcrumb.link({}, ['Components'], h)], h),
                  Breadcrumb.separator({}, [], h),
                  Breadcrumb.item({}, [Breadcrumb.page({}, ['Breadcrumb'], h)], h),
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
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Link']),
          Breadcrumb(
            {},
            [
              Breadcrumb.list(
                {},
                [
                  Breadcrumb.item({}, [Breadcrumb.link({}, ['Home'], h)], h),
                  Breadcrumb.separator({}, [], h),
                  Breadcrumb.ellipsis({}, [], h),
                  Breadcrumb.separator({}, [], h),
                  Breadcrumb.item({}, [Breadcrumb.link({}, ['Components'], h)], h),
                  Breadcrumb.separator({}, [], h),
                  Breadcrumb.item({}, [Breadcrumb.page({}, ['Breadcrumb'], h)], h),
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

const foldNoOp =
  <Out>(): ((out: Out) => Update.Step<State, unknown>) =>
  () =>
  (model) => ({ model })

const foldBreadcrumbMenuOutMessage = M.type<FoldkitMenu.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    Selected: foldNoOp(),
  }),
)

const foldBreadcrumbMenu = Update.foldChild({
  update: DemoMenu.update,
  read: (model: State) => Option.some(model.breadcrumbMenu),
  write: (model, next) => evo(model, { breadcrumbMenu: () => next }),
  toParentMessage: (message) => Message.GotBreadcrumbMenuMessage({ message }),
  foldOutMessage: foldBreadcrumbMenuOutMessage,
})

const fields = { breadcrumbMenu: menu.Model }

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: { breadcrumbMenu: menu.init({ id: 'breadcrumb-dropdown' }) },
  messages: [Message.GotBreadcrumbMenuMessage],
  handlers: (model: State) => ({
    GotBreadcrumbMenuMessage: (
      payload: typeof Message.GotBreadcrumbMenuMessage.Type,
    ): UpdateReturn => foldBreadcrumbMenu(model, payload.message),
  }),
  samples: [],
})
