import { Subscription, Update } from 'foldkit'
import * as RuntimeCommand from 'foldkit/command'
import { Option, Schema as S } from 'effect'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as Command from '../../generated/registry/ui/command'
import { button } from '../../generated/registry/ui/button'
import { icon } from '../../generated/registry/lib/icons'
import { Calculator, Calendar, CreditCard, Settings, Smile, User } from 'lucide'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotInlineCommandMessage: { message: Command.Message },
  GotCommandDialogMessage: { message: Command.CommandDialog.Message },
  ToggledCommandDialog: {},
})

const fields = {
  inlineCommand: Command.Model,
  commandDialog: Command.CommandDialog.Model,
  lastCommand: S.String,
  commandRunCount: S.Number,
}
const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

const commandItems = <M>(h: HtmlBuilder<M>): ReadonlyArray<Command.Item> => [
  {
    value: 'calendar',
    label: 'Calendar',
    keywords: ['events', 'schedule'],
    group: 'suggestions',
    content: iconLabel(h, Calendar, 'Calendar'),
  },
  {
    value: 'emoji',
    label: 'Search Emoji',
    keywords: ['smile'],
    group: 'suggestions',
    content: iconLabel(h, Smile, 'Search Emoji'),
  },
  {
    value: 'calculator',
    label: 'Calculator',
    group: 'suggestions',
    isDisabled: true,
    content: iconLabel(h, Calculator, 'Calculator'),
  },
  {
    value: 'profile',
    label: 'Profile',
    keywords: ['account'],
    group: 'settings',
    shortcut: '⌘P',
    content: iconLabel(h, User, 'Profile'),
  },
  {
    value: 'billing',
    label: 'Billing',
    keywords: ['payment', 'invoice'],
    group: 'settings',
    shortcut: '⌘B',
    content: iconLabel(h, CreditCard, 'Billing'),
  },
  {
    value: 'settings',
    label: 'Settings',
    keywords: ['preferences'],
    group: 'settings',
    shortcut: '⌘S',
    content: iconLabel(h, Settings, 'Settings'),
  },
]
const iconLabel = <M>(h: HtmlBuilder<M>, symbol: typeof Calendar, label: string): Html =>
  h.span([h.Class('flex items-center gap-2')], [icon(h, symbol, 'size-4'), h.span([], [label])])
const groups: ReadonlyArray<Command.Group> = [
  { value: 'suggestions', heading: 'Suggestions' },
  { value: 'settings', heading: 'Settings' },
]

const recordCommand =
  (out: Command.OutMessage | Command.CommandDialogOutMessage): Update.Step<State, unknown> =>
  (model) => ({
    model:
      out._tag === 'Selected'
        ? { ...model, lastCommand: out.value, commandRunCount: model.commandRunCount + 1 }
        : model,
  })
const foldInline = Update.foldChild({
  update: Command.update,
  read: (model: State) => Option.some(model.inlineCommand),
  write: (model, inlineCommand) => ({ ...model, inlineCommand }),
  toParentMessage: (message) => Message.GotInlineCommandMessage({ message }),
  foldOutMessage: recordCommand,
})
const foldDialog = Update.foldChild({
  update: Command.CommandDialog.update,
  read: (model: State) => Option.some(model.commandDialog),
  write: (model, commandDialog) => ({ ...model, commandDialog }),
  toParentMessage: (message) => Message.GotCommandDialogMessage({ message }),
  foldOutMessage: recordCommand,
})

export const commandView = (model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full max-w-sm flex-col gap-6')],
    [
      h.h2([h.Class('text-sm font-medium')], ['Inline']),
      h.submodel({
        slotId: model.inlineCommand.id,
        model: model.inlineCommand,
        view: Command.view,
        viewInputs: {
          items: commandItems(h),
          groups,
          label: 'Inline commands',
          loop: true,
          className: 'rounded-lg border',
        },
        toParentMessage: (message) => Message.GotInlineCommandMessage({ message }),
      }),
      h.h2([h.Class('text-sm font-medium')], ['Dialog']),
      button(
        {
          variant: 'outline',
          onClick: Message.ToggledCommandDialog(),
          attributes: [h.Id('command-dialog-trigger')],
        },
        'Open command palette',
        h,
      ),
      h.p(
        [h.Class('text-xs text-muted-foreground')],
        [
          'Press ⌘K or Ctrl+K. Try “schedule”, “payment”, or “clndr”. Calculator is disabled. Shortcut hints are labels, not registered hotkeys.',
        ],
      ),
      h.submodel({
        slotId: model.commandDialog.dialog.id,
        model: model.commandDialog,
        view: Command.CommandDialog.view,
        viewInputs: {
          items: commandItems(h),
          groups,
          label: 'Search commands',
          title: 'Command Palette',
          loop: true,
          vimBindings: false,
        },
        toParentMessage: (message) => Message.GotCommandDialogMessage({ message }),
      }),
      h.p(
        [
          h.Role('status'),
          h.DataAttribute('command-result', ''),
          h.Class('text-sm text-muted-foreground'),
        ],
        [
          model.commandRunCount
            ? `Ran ${model.lastCommand}. Commands run: ${model.commandRunCount}.`
            : 'No command run yet.',
        ],
      ),
    ],
  )

// cmdk also leaves the global shortcut to its caller. Scope this demo to its page.
export const subscriptions = Subscription.make<State, typeof Message.ToggledCommandDialog.Type>()(
  (entry) => ({
    commandShortcut: entry(
      { enabled: S.Boolean },
      {
        modelToDependencies: () => ({ enabled: true }),
        dependenciesToStream: () =>
          Subscription.fromEventFilterMap<KeyboardEvent, typeof Message.ToggledCommandDialog.Type>({
            target: window,
            type: 'keydown',
            toMessage: (event) => {
              if (
                window.location.pathname === '/docs/command' &&
                !event.defaultPrevented &&
                !event.isComposing &&
                !event.repeat &&
                (event.metaKey || event.ctrlKey) &&
                event.key.toLowerCase() === 'k'
              ) {
                event.preventDefault()
                return Option.some(Message.ToggledCommandDialog())
              }
              return Option.none()
            },
          }),
      },
    ),
  }),
)

export const slice = defineSlice({
  fields,
  init: {
    inlineCommand: Command.init({ id: 'command-inline' }),
    commandDialog: Command.CommandDialog.init({
      id: 'command-demo',
      closeOnSelect: true,
      resetOnOpen: true,
    }),
    lastCommand: '',
    commandRunCount: 0,
  },
  messages: [
    Message.GotInlineCommandMessage,
    Message.GotCommandDialogMessage,
    Message.ToggledCommandDialog,
  ],
  handlers: (model: State) => ({
    GotInlineCommandMessage: ({
      message,
    }: typeof Message.GotInlineCommandMessage.Type): UpdateReturn => foldInline(model, message),
    GotCommandDialogMessage: ({
      message,
    }: typeof Message.GotCommandDialogMessage.Type): UpdateReturn => foldDialog(model, message),
    ToggledCommandDialog: (): UpdateReturn => {
      const result = model.commandDialog.dialog.isOpen
        ? Command.CommandDialog.close(model.commandDialog)
        : Command.CommandDialog.open(model.commandDialog)
      return {
        model: { ...model, commandDialog: result.model },
        commands: RuntimeCommand.mapMessages(result.commands ?? [], (message) =>
          Message.GotCommandDialogMessage({ message }),
        ),
      }
    },
  }),
  samples: [Message.ToggledCommandDialog()],
  subscriptions,
})
