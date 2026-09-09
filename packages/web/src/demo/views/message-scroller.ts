import { Effect, Option, Schema as S } from 'effect'
import { Command, Subscription, Update } from 'foldkit'
import { evo } from 'foldkit/struct'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as MessageScroller from '../../generated/registry/ui/message-scroller'
import { button } from '../../generated/registry/ui/button'
import { inputClass } from '../../generated/registry/ui/input'
import { icon } from '../../generated/registry/lib/icons'
import { RotateCw, Send } from 'lucide'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  GotMessageScrollerMessage: { message: MessageScroller.Message },
  TypedChatDraft: { value: S.String },
  SentChatMessage: {},
  AppendedReplyChunk: { messageId: S.String },
  ClickedResetChat: {},
  ClickedJumpToFirstMessage: {},
})

const ChatMessage = S.Struct({
  id: S.String,
  role: S.Literals(['user', 'assistant']),
  text: S.String,
  isStreaming: S.Boolean,
})
type ChatMessage = typeof ChatMessage.Type

/** Scripted opening transcript (adapted from the upstream demo's chat). */
const SCRIPTED: ReadonlyArray<ChatMessage> = [
  {
    id: 'm1',
    role: 'user',
    text: "I'm building a chat for our app and the scroll behavior is driving me nuts. Every time the AI streams a reply, the whole thread jumps around.",
    isStreaming: false,
  },
  {
    id: 'm2',
    role: 'assistant',
    text: "That's the classic streaming scroll problem. Wrap your message list in MessageScroller and turn on autoScroll — the viewport pins to the bottom as tokens arrive, so the latest text lands in place.\n\nThe important part: it only follows while the reader is already at the bottom. The moment they scroll up, their position is preserved.",
    isStreaming: false,
  },
  {
    id: 'm3',
    role: 'user',
    text: "Okay, but when someone scrolls up to re-read an older answer, I don't want to yank them back down.",
    isStreaming: false,
  },
  {
    id: 'm4',
    role: 'assistant',
    text: "You won't. When content they haven't seen arrives below, the scroll button appears at the bottom of the viewport — one tap jumps back to the newest message and re-engages auto-follow.",
    isStreaming: false,
  },
]

/** The canned assistant reply, streamed word-group by word-group. */
const REPLY_WORDS =
  "MessageScrollerItem fixes that with turn anchoring. Your user turns are scroll anchors, so a newly sent message settles near the top of the viewport with the previous exchange peeking above it — the reply grows in below instead of yanking the thread around.\n\nScroll up mid-stream and auto-follow backs off immediately; scroll back to the bottom and it re-engages. That's the whole loop this demo runs.".split(
    /\s+/,
  )

const CHUNK_WORDS = 3
const CHUNK_DELAY = '120 millis'

const StreamReplyChunk = Command.define('StreamReplyChunk', {
  args: { messageId: S.String },
  messages: [Message.AppendedReplyChunk],
  execute: ({ messageId }) =>
    Effect.gen(function* () {
      yield* Effect.sleep(CHUNK_DELAY)
      return Message.AppendedReplyChunk({ messageId })
    }),
})

/** Client-side only: ids minted after interaction never appear in prerendered
 *  HTML, so a module counter stays hydration-safe. */
let mintedId = 0

const mintId = (prefix: string): string => {
  mintedId += 1
  return `${prefix}-${mintedId}`
}

const userBubble = (message: ChatMessage, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex justify-end')],
    [
      h.div(
        [
          h.Class(
            'max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm text-primary-foreground',
          ),
        ],
        [message.text],
      ),
    ],
  )

const assistantBubble = (message: ChatMessage, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex justify-start')],
    [
      h.div(
        [
          h.Class(
            'max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-md bg-muted px-3.5 py-2.5 text-sm',
          ),
        ],
        [
          message.text,
          ...(message.isStreaming
            ? [h.span([h.Class('animate-pulse text-muted-foreground')], ['▍'])]
            : []),
        ],
      ),
    ],
  )

export const messageScrollerView = (model: Model, h: HtmlBuilder<AppMessage>): Html => {
  const chatMessages = model.chatMessages
  const canSend = model.chatDraft.trim() !== ''
  const firstMessageId = chatMessages[0]?.id ?? ''

  return h.div(
    [h.Class('flex w-full flex-col gap-8')],
    [
      h.div(
        [h.Class('flex w-full flex-col gap-2')],
        [
          h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], ['Streaming chat']),
          h.div(
            [
              h.Class(
                'mx-auto flex h-[560px] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm',
              ),
            ],
            [
              h.div(
                [
                  h.Class(
                    'flex items-center justify-between gap-2 border-b border-border px-4 py-3',
                  ),
                ],
                [
                  h.div(
                    [h.Class('flex min-w-0 flex-col')],
                    [
                      h.span([h.Class('text-sm font-medium')], ['Streaming support']),
                      h.span(
                        [h.Class('truncate text-xs text-muted-foreground')],
                        ['Auto-follow, turn anchoring, jump-to-latest'],
                      ),
                    ],
                  ),
                  h.div(
                    [h.Class('flex shrink-0 items-center gap-1')],
                    [
                      button<AppMessage>(
                        {
                          variant: 'ghost',
                          size: 'xs',
                          isDisabled: firstMessageId === '',
                          onClick: Message.ClickedJumpToFirstMessage(),
                        },
                        'First message',
                        h,
                      ),
                      button<AppMessage>(
                        {
                          variant: 'ghost',
                          size: 'xs',
                          onClick: Message.ClickedResetChat(),
                        },
                        h.span(
                          [h.Class('inline-flex items-center gap-1')],
                          [icon(h, RotateCw, 'size-3'), 'Reset'],
                        ),
                        h,
                      ),
                    ],
                  ),
                ],
              ),
              h.submodel({
                slotId: model.messageScroller.id,
                model: model.messageScroller,
                view: MessageScroller.view<ChatMessage>(),
                viewInputs: {
                  items: chatMessages,
                  itemToKey: (message) => message.id,
                  itemToId: (message) => message.id,
                  itemIsAnchor: (message) => message.role === 'user',
                  itemToView: (message) =>
                    message.role === 'user' ? userBubble(message, h) : assistantBubble(message, h),
                  className: 'flex-1 min-h-0',
                },
                toParentMessage: (message) => Message.GotMessageScrollerMessage({ message }),
              }),
              h.div(
                [h.Class('flex items-center gap-2 border-t border-border px-3 py-2.5')],
                [
                  h.input([
                    h.Type('text'),
                    h.Placeholder('Ask about scroll behavior…'),
                    h.Value(model.chatDraft),
                    h.OnInput((value) => Message.TypedChatDraft({ value })),
                    h.OnKeyDownPreventDefault((key) =>
                      key === 'Enter' && canSend
                        ? Option.some(Message.SentChatMessage())
                        : Option.none(),
                    ),
                    h.Class(`${inputClass} h-9 flex-1`),
                    h.AriaLabel('Message'),
                  ]),
                  button<AppMessage>(
                    {
                      variant: 'default',
                      size: 'icon-sm',
                      isDisabled: !canSend,
                      onClick: Message.SentChatMessage(),
                    },
                    h.span(
                      [h.Class('inline-flex items-center gap-1')],
                      [icon(h, Send, 'size-4'), h.span([h.Class('sr-only')], ['Send'])],
                    ),
                    h,
                  ),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class('px-1 text-center text-xs text-muted-foreground')],
            [
              'Demo is scripted. Press Send to stream a reply — scroll up mid-stream to break auto-follow, then use the arrow button to jump back to the latest.',
            ],
          ),
        ],
      ),
    ],
  )
}

const foldScroller = Update.foldChild({
  update: MessageScroller.update,
  read: (model: State) => Option.some(model.messageScroller),
  write: (model, next) => evo(model, { messageScroller: () => next }),
  toParentMessage: (message) => Message.GotMessageScrollerMessage({ message }),
})

const fields = {
  messageScroller: MessageScroller.Model,
  chatMessages: S.Array(ChatMessage),
  chatDraft: S.String,
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const subscriptions = Subscription.lift({
  messageScrollerViewportEvents: MessageScroller.subscriptions.viewportEvents,
})<State, typeof Message.GotMessageScrollerMessage.Type>({
  toChildModel: (model) => model.messageScroller,
  toParentMessage: (message) => Message.GotMessageScrollerMessage({ message }),
})

export const slice = defineSlice({
  fields,
  init: {
    messageScroller: MessageScroller.init({
      id: 'message-scroller-demo',
      autoScroll: true,
      defaultScrollPosition: 'end',
    }),
    chatMessages: [...SCRIPTED],
    chatDraft: '',
  },
  messages: [
    Message.GotMessageScrollerMessage,
    Message.TypedChatDraft,
    Message.SentChatMessage,
    Message.AppendedReplyChunk,
    Message.ClickedResetChat,
    Message.ClickedJumpToFirstMessage,
  ],
  handlers: (model: State) => ({
    GotMessageScrollerMessage: (
      payload: typeof Message.GotMessageScrollerMessage.Type,
    ): UpdateReturn => foldScroller(model, payload.message),
    TypedChatDraft: (payload: typeof Message.TypedChatDraft.Type): UpdateReturn => ({
      model: evo(model, { chatDraft: () => payload.value }),
    }),
    SentChatMessage: (): UpdateReturn => {
      const text = model.chatDraft.trim()
      if (text === '') return { model }
      const userId = mintId('user')
      const replyId = mintId('reply')
      return {
        model: evo(model, {
          chatDraft: () => '',
          chatMessages: () => [
            ...model.chatMessages,
            { id: userId, role: 'user', text, isStreaming: false } satisfies ChatMessage,
            {
              id: replyId,
              role: 'assistant',
              text: '',
              isStreaming: true,
            } satisfies ChatMessage,
          ],
        }),
        commands: [StreamReplyChunk({ messageId: replyId })],
      }
    },
    AppendedReplyChunk: (payload: typeof Message.AppendedReplyChunk.Type): UpdateReturn => {
      const target = model.chatMessages.find((message) => message.id === payload.messageId)
      if (target === undefined || !target.isStreaming) return { model }
      const nextCount = (target.text.match(/\S+/g)?.length ?? 0) + CHUNK_WORDS
      const isDone = nextCount >= REPLY_WORDS.length
      return {
        model: evo(model, {
          chatMessages: () =>
            model.chatMessages.map((message) =>
              message.id === payload.messageId
                ? {
                    ...message,
                    text: REPLY_WORDS.slice(0, nextCount).join(' '),
                    isStreaming: !isDone,
                  }
                : message,
            ),
        }),
        commands: isDone ? [] : [StreamReplyChunk({ messageId: payload.messageId })],
      }
    },
    ClickedResetChat: (): UpdateReturn => ({
      model: evo(model, {
        chatMessages: () => [...SCRIPTED],
        chatDraft: () => '',
      }),
    }),
    ClickedJumpToFirstMessage: (): UpdateReturn => {
      const messageId = model.chatMessages[0]?.id
      if (messageId === undefined) return { model }
      const { model: next, commands } = MessageScroller.scrollToMessage(
        model.messageScroller,
        messageId,
        { align: 'start', behavior: 'smooth' },
      )
      return {
        model: evo(model, { messageScroller: () => next }),
        commands: Command.mapMessages(commands, (message) =>
          Message.GotMessageScrollerMessage({ message }),
        ),
      }
    },
  }),
  samples: [
    Message.TypedChatDraft({ value: 'How do I stop the jump?' }),
    Message.SentChatMessage(),
    Message.ClickedResetChat(),
  ],
  subscriptions,
})
