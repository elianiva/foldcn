import { Match as M, Option, Schema as S } from 'effect'
import { Command, Subscription, Update } from 'foldkit'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { button } from '../../generated/registry/ui/button'
import * as Drawer from '../../generated/registry/ui/drawer'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotDrawerBasicMessage: { message: Drawer.Message },
  GotDrawerLeftMessage: { message: Drawer.Message },
  GotDrawerRightMessage: { message: Drawer.Message },
  GotDrawerUpMessage: { message: Drawer.Message },
  ClickedOpenBasicDrawer: {},
  ClickedOpenLeftDrawer: {},
  ClickedOpenRightDrawer: {},
  ClickedOpenUpDrawer: {},
})

type DrawerMessage =
  | typeof Message.GotDrawerBasicMessage.Type
  | typeof Message.GotDrawerLeftMessage.Type
  | typeof Message.GotDrawerRightMessage.Type
  | typeof Message.GotDrawerUpMessage.Type

type Render = Drawer.DrawerContent<AppMessage>

const deliveryContent = (
  { closeButton, title, description }: Render,
  h: HtmlBuilder<AppMessage>,
): ReadonlyArray<Html | string> => [
  Drawer.header(
    {},
    [
      Drawer.title({ attributes: title }, ['Pick a delivery time'], h),
      Drawer.description(
        { attributes: description },
        ['We’ll prepare your order as soon as possible.'],
        h,
      ),
    ],
    h,
  ),
  h.div(
    [h.Class('flex-1 overflow-y-auto p-4')],
    [
      h.div(
        [h.Class('grid gap-2')],
        [
          h.label(
            [
              h.Class(
                'flex items-center gap-3 rounded-lg border p-3 text-sm has-[input:checked]:border-primary has-[input:checked]:bg-accent',
              ),
              h.For('drawer-delivery-asap'),
            ],
            [
              h.div(
                [h.Class('flex flex-1 flex-col gap-0.5')],
                [
                  h.span(
                    [h.Class('flex items-center gap-2 font-medium')],
                    [
                      'Standard delivery',
                      h.span(
                        [
                          h.Class(
                            'inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground',
                          ),
                        ],
                        ['Fastest'],
                      ),
                    ],
                  ),
                  h.span(
                    [h.Class('text-xs text-muted-foreground')],
                    ['25–35 min · Driver assigned now'],
                  ),
                ],
              ),
              h.input([
                h.Attribute('type', 'radio'),
                h.Attribute('name', 'delivery-time'),
                h.Id('drawer-delivery-asap'),
                h.Attribute('value', 'asap'),
                h.Attribute('checked', ''),
                h.Class('size-4'),
              ]),
            ],
          ),
          h.label(
            [
              h.Class(
                'flex items-center gap-3 rounded-lg border p-3 text-sm has-[input:checked]:border-primary has-[input:checked]:bg-accent',
              ),
              h.For('drawer-delivery-5-00'),
            ],
            [
              h.div(
                [h.Class('flex flex-1 flex-col gap-0.5')],
                [
                  h.span([h.Class('font-medium')], ['5:00 PM – 5:15 PM']),
                  h.span([h.Class('text-xs text-muted-foreground')], ['Prep starts at 4:45 PM']),
                ],
              ),
              h.input([
                h.Attribute('type', 'radio'),
                h.Attribute('name', 'delivery-time'),
                h.Id('drawer-delivery-5-00'),
                h.Attribute('value', '5-00'),
                h.Class('size-4'),
              ]),
            ],
          ),
        ],
      ),
    ],
  ),
  Drawer.footer(
    {},
    [
      h.button(
        [
          h.Class(
            'inline-flex h-[34px] w-full items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90',
          ),
        ],
        ['Confirm Delivery Time'],
      ),
      Drawer.closeButton({ attributes: closeButton }, ['Cancel'], h),
    ],
    h,
  ),
]

const sideContent = (
  headline: string,
  subhead: string,
  { closeButton, title, description }: Render,
  h: HtmlBuilder<AppMessage>,
): ReadonlyArray<Html | string> => [
  Drawer.header(
    {},
    [
      Drawer.title({ attributes: title }, [headline], h),
      Drawer.description({ attributes: description }, [subhead], h),
    ],
    h,
  ),
  h.div(
    [h.Class('flex-1 p-4')],
    [
      h.div(
        [
          h.Class(
            'size-full rounded-2xl bg-muted group-data-[swipe-axis=x]/drawer-popup:size-full group-data-[swipe-axis=y]/drawer-popup:h-80 group-data-[swipe-axis=y]/drawer-popup:w-full',
          ),
        ],
        [],
      ),
    ],
  ),
  Drawer.footer({}, [Drawer.closeButton({ attributes: closeButton }, ['Close'], h)], h),
]

const drawerSubmodel = (
  model: Drawer.Model,
  content: (render: Render, h: HtmlBuilder<AppMessage>) => ReadonlyArray<Html | string>,
  toParentMessage: (message: Drawer.Message) => DrawerMessage,
  h: HtmlBuilder<AppMessage>,
): Html =>
  h.submodel({
    slotId: model.id,
    model,
    view: Drawer.view,
    viewInputs: Drawer.styledViewInputs({ content }, h),
    toParentMessage,
  })

export const drawerView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Basic']),
          h.div(
            [h.Class('flex flex-col items-start gap-4')],
            [
              button<AppMessage>(
                { variant: 'outline', onClick: Message.ClickedOpenBasicDrawer() },
                'Open Drawer',
                h,
              ),
              drawerSubmodel(
                model.drawerBasic,
                deliveryContent,
                (message) => Message.GotDrawerBasicMessage({ message }),
                h,
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['With Handle']),
          h.div(
            [h.Class('flex flex-col items-start gap-4')],
            [
              h.p(
                [h.Class('text-sm text-muted-foreground')],
                ['Drag the handle to dismiss. Release past the threshold to close.'],
              ),
              button<AppMessage>(
                { variant: 'outline', onClick: Message.ClickedOpenBasicDrawer() },
                'Open Drawer With Handle',
                h,
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Sides']),
          h.div(
            [h.Class('flex flex-wrap gap-2')],
            [
              button<AppMessage>(
                { variant: 'outline', onClick: Message.ClickedOpenLeftDrawer() },
                'Open Left Drawer',
                h,
              ),
              button<AppMessage>(
                { variant: 'outline', onClick: Message.ClickedOpenRightDrawer() },
                'Open Right Drawer',
                h,
              ),
              button<AppMessage>(
                { variant: 'outline', onClick: Message.ClickedOpenUpDrawer() },
                'Open Top Drawer',
                h,
              ),
              drawerSubmodel(
                model.drawerLeft,
                (render, h) => sideContent('Move Goal', 'Set your daily activity goal.', render, h),
                (message) => Message.GotDrawerLeftMessage({ message }),
                h,
              ),
              drawerSubmodel(
                model.drawerRight,
                (render, h) =>
                  sideContent('Notifications', 'Choose what you hear about.', render, h),
                (message) => Message.GotDrawerRightMessage({ message }),
                h,
              ),
              drawerSubmodel(
                model.drawerUp,
                (render, h) =>
                  sideContent('Filters', 'Narrow the list without losing context.', render, h),
                (message) => Message.GotDrawerUpMessage({ message }),
                h,
              ),
            ],
          ),
        ],
      ),
    ],
  )

const fields = {
  drawerBasic: Drawer.Model,
  drawerLeft: Drawer.Model,
  drawerRight: Drawer.Model,
  drawerUp: Drawer.Model,
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

const foldDrawerOutMessage = M.type<Drawer.OutMessage>().pipe(
  M.withReturnType<Update.Step<State, unknown>>(),
  M.tagsExhaustive({
    Opened: () => (state) => ({ model: state }),
    Closed: () => (state) => ({ model: state }),
  }),
)

const foldDrawer = (
  read: (state: State) => Drawer.Model,
  write: (state: State, next: Drawer.Model) => State,
  toParentMessage: (message: Drawer.Message) => DrawerMessage,
) =>
  Update.foldChild({
    update: Drawer.update,
    read: (state: State) => Option.some(read(state)),
    write: (state, next) => write(state, next),
    toParentMessage,
    foldOutMessage: foldDrawerOutMessage,
  })

const openDrawer = (
  read: (state: State) => Drawer.Model,
  write: (state: State, next: Drawer.Model) => State,
  toParentMessage: (message: Drawer.Message) => DrawerMessage,
  model: State,
): UpdateReturn => {
  const { model: next, commands = [] } = Drawer.open(read(model))
  return {
    model: write(model, next),
    commands: Command.mapMessages(commands, (message) => toParentMessage(message)),
  }
}

const liftDrawerSubscriptions = (
  name: string,
  read: (model: State) => Drawer.Model,
  toParentMessage: (message: Drawer.Message) => DrawerMessage,
) => {
  const lifted = Subscription.lift({
    dragPointer: Drawer.subscriptions.dragPointer,
    dragEscape: Drawer.subscriptions.dragEscape,
  })<State, DrawerMessage>({
    toChildModel: read,
    toParentMessage,
  })
  return {
    [`${name}DragPointer`]: lifted.dragPointer,
    [`${name}DragEscape`]: lifted.dragEscape,
  }
}

const drawerSubscriptions = Subscription.aggregate<State, DrawerMessage>()(
  liftDrawerSubscriptions(
    'drawerBasic',
    (model) => model.drawerBasic,
    (message) => Message.GotDrawerBasicMessage({ message }),
  ),
  liftDrawerSubscriptions(
    'drawerLeft',
    (model) => model.drawerLeft,
    (message) => Message.GotDrawerLeftMessage({ message }),
  ),
  liftDrawerSubscriptions(
    'drawerRight',
    (model) => model.drawerRight,
    (message) => Message.GotDrawerRightMessage({ message }),
  ),
  liftDrawerSubscriptions(
    'drawerUp',
    (model) => model.drawerUp,
    (message) => Message.GotDrawerUpMessage({ message }),
  ),
)

export { drawerSubscriptions as subscriptions }

export const slice = defineSlice({
  fields,
  init: {
    drawerBasic: Drawer.init({ id: 'drawer-basic', swipeDirection: 'down', isHandleVisible: true }),
    drawerLeft: Drawer.init({ id: 'drawer-left', swipeDirection: 'left', isHandleVisible: true }),
    drawerRight: Drawer.init({
      id: 'drawer-right',
      swipeDirection: 'right',
      isHandleVisible: true,
    }),
    drawerUp: Drawer.init({ id: 'drawer-up', swipeDirection: 'up', isHandleVisible: true }),
  },
  messages: [
    Message.GotDrawerBasicMessage,
    Message.GotDrawerLeftMessage,
    Message.GotDrawerRightMessage,
    Message.GotDrawerUpMessage,
    Message.ClickedOpenBasicDrawer,
    Message.ClickedOpenLeftDrawer,
    Message.ClickedOpenRightDrawer,
    Message.ClickedOpenUpDrawer,
  ],
  handlers: (model: State) => ({
    GotDrawerBasicMessage: (payload: typeof Message.GotDrawerBasicMessage.Type): UpdateReturn =>
      foldDrawer(
        (state) => state.drawerBasic,
        (state, next) => evo(state, { drawerBasic: () => next }),
        (message) => Message.GotDrawerBasicMessage({ message }),
      )(model, payload.message),
    GotDrawerLeftMessage: (payload: typeof Message.GotDrawerLeftMessage.Type): UpdateReturn =>
      foldDrawer(
        (state) => state.drawerLeft,
        (state, next) => evo(state, { drawerLeft: () => next }),
        (message) => Message.GotDrawerLeftMessage({ message }),
      )(model, payload.message),
    GotDrawerRightMessage: (payload: typeof Message.GotDrawerRightMessage.Type): UpdateReturn =>
      foldDrawer(
        (state) => state.drawerRight,
        (state, next) => evo(state, { drawerRight: () => next }),
        (message) => Message.GotDrawerRightMessage({ message }),
      )(model, payload.message),
    GotDrawerUpMessage: (payload: typeof Message.GotDrawerUpMessage.Type): UpdateReturn =>
      foldDrawer(
        (state) => state.drawerUp,
        (state, next) => evo(state, { drawerUp: () => next }),
        (message) => Message.GotDrawerUpMessage({ message }),
      )(model, payload.message),
    ClickedOpenBasicDrawer: (): UpdateReturn =>
      openDrawer(
        (state) => state.drawerBasic,
        (state, next) => evo(state, { drawerBasic: () => next }),
        (message) => Message.GotDrawerBasicMessage({ message }),
        model,
      ),
    ClickedOpenLeftDrawer: (): UpdateReturn =>
      openDrawer(
        (state) => state.drawerLeft,
        (state, next) => evo(state, { drawerLeft: () => next }),
        (message) => Message.GotDrawerLeftMessage({ message }),
        model,
      ),
    ClickedOpenRightDrawer: (): UpdateReturn =>
      openDrawer(
        (state) => state.drawerRight,
        (state, next) => evo(state, { drawerRight: () => next }),
        (message) => Message.GotDrawerRightMessage({ message }),
        model,
      ),
    ClickedOpenUpDrawer: (): UpdateReturn =>
      openDrawer(
        (state) => state.drawerUp,
        (state, next) => evo(state, { drawerUp: () => next }),
        (message) => Message.GotDrawerUpMessage({ message }),
        model,
      ),
  }),
  samples: [Message.ClickedOpenBasicDrawer()],
})
