import { Schema as S } from 'effect'
import { defineMessageUnion } from 'foldkit/message'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { evo } from 'foldkit/struct'

import { Bubble } from '../../generated/registry/ui/bubble'
import { button } from '../../generated/registry/ui/button'
import { Marker } from '../../generated/registry/ui/marker'
import { icon } from '../../generated/registry/lib/icons'
import { ThumbsUp, ThumbsDown, PartyPopper } from 'lucide'

import { defineSlice, type UpdateReturn } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const Message = defineMessageUnion({
  PickedReply: { text: S.String },
  ToggledReaction: {},
})

const quickReplies = [
  'I need help with my account.',
  'I forgot my password.',
  'I have another question. I would like to talk to a human. Can you help me?',
]

export const bubbleView = (model: Model, h: HtmlBuilder<AppMessage>): Html => {
  const separatorMarker = (label: string): Html =>
    Marker<AppMessage>({ variant: 'separator' }, [Marker.content<AppMessage>({}, [label], h)], h)

  const section = (label: string, children: ReadonlyArray<Html>): Html =>
    h.div(
      [h.Class('flex w-full flex-col gap-2')],
      [h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], [label]), ...children],
    )

  return h.div(
    [h.Class('flex w-full max-w-md flex-col gap-8 py-12')],
    [
      section('Variants', [
        Bubble<AppMessage>(
          {},
          [
            Bubble.content<AppMessage>(
              {},
              ['Default bubbles use the primary color for the active user side of a chat.'],
              h,
            ),
          ],
          h,
        ),
        Bubble<AppMessage>(
          { variant: 'secondary' },
          [
            Bubble.content<AppMessage>(
              {},
              ['Secondary bubbles are the standard neutral surface for assistant content.'],
              h,
            ),
          ],
          h,
        ),
        Bubble<AppMessage>(
          { variant: 'muted' },
          [
            Bubble.content<AppMessage>(
              {},
              ['Muted bubbles lower the emphasis for quiet system notes.'],
              h,
            ),
          ],
          h,
        ),
        Bubble<AppMessage>(
          { variant: 'tinted', align: 'end' },
          [
            Bubble.content<AppMessage>(
              {},
              ['Tinted bubbles use a softer primary tint when primary fill is too strong.'],
              h,
            ),
          ],
          h,
        ),
        Bubble<AppMessage>(
          { variant: 'outline' },
          [
            Bubble.content<AppMessage>(
              {},
              ['Outline bubbles can be used to frame message content and give it a border.'],
              h,
            ),
          ],
          h,
        ),
        Bubble<AppMessage>(
          { variant: 'destructive' },
          [
            Bubble.content<AppMessage>(
              {},
              ['Destructive bubbles flag errors or failed actions in a conversation.'],
              h,
            ),
          ],
          h,
        ),
        Bubble<AppMessage>(
          { variant: 'ghost' },
          [
            Bubble.content<AppMessage>(
              {},
              [
                h.span(
                  [h.Class('whitespace-pre-wrap')],
                  [
                    'Ghost bubbles work for assistant text that should not be framed.\n\nThey are full width and can take the whole row of the conversation.',
                  ],
                ),
              ],
              h,
            ),
          ],
          h,
        ),
      ]),
      section('Sizes', [
        Bubble<AppMessage>(
          {},
          [Bubble.content<AppMessage>({}, ['This is a one line bubble.'], h)],
          h,
        ),
        Bubble<AppMessage>(
          {},
          [
            Bubble.content<AppMessage>(
              {},
              [
                'This bubble has multiple lines. It should wrap to the next line and you should see a different radius on the corners.',
              ],
              h,
            ),
          ],
          h,
        ),
        Bubble<AppMessage>(
          {},
          [
            Bubble.content<AppMessage>(
              {},
              [
                h.p([], ['This bubble has multiple lines.']),
                h.p(
                  [],
                  [
                    'It should wrap to the next line and you should see a different radius on the corners.',
                  ],
                ),
                h.p([], ['Here is some more text to see how it wraps.']),
              ],
              h,
            ),
          ],
          h,
        ),
      ]),
      section('Alignment', [
        Bubble<AppMessage>(
          { variant: 'muted' },
          [Bubble.content<AppMessage>({}, ['This bubble is aligned to the start.'], h)],
          h,
        ),
        Bubble<AppMessage>(
          { align: 'end' },
          [Bubble.content<AppMessage>({}, ['This bubble is aligned to the end.'], h)],
          h,
        ),
        Bubble<AppMessage>(
          { variant: 'muted' },
          [
            Bubble.content<AppMessage>(
              {},
              [
                'This multiline bubble is aligned to the start. The corners should adjust when the text wraps to show the grouped side of the conversation.',
              ],
              h,
            ),
          ],
          h,
        ),
        Bubble<AppMessage>(
          { align: 'end' },
          [
            Bubble.content<AppMessage>(
              {},
              [
                'This multiline bubble is aligned to the end. It should sit on the opposite side with the matching corner radius for wrapped text.',
              ],
              h,
            ),
          ],
          h,
        ),
      ]),
      section('Grouped', [
        Bubble.group<AppMessage>(
          {},
          [
            Bubble<AppMessage>(
              { variant: 'secondary' },
              [Bubble.content<AppMessage>({}, ['I finished the audit pass.'], h)],
              h,
            ),
            Bubble<AppMessage>(
              { variant: 'secondary' },
              [
                Bubble.content<AppMessage>(
                  {},
                  ['The registry output looks clean, but I found one stale route.'],
                  h,
                ),
              ],
              h,
            ),
            Bubble<AppMessage>(
              { variant: 'secondary' },
              [Bubble.content<AppMessage>({}, ['Want me to remove it now?'], h)],
              h,
            ),
          ],
          h,
        ),
        Bubble.group<AppMessage>(
          {},
          [
            Bubble<AppMessage>(
              { variant: 'tinted', align: 'end' },
              [Bubble.content<AppMessage>({}, ['Yes, clean that up.'], h)],
              h,
            ),
            Bubble<AppMessage>(
              { variant: 'tinted', align: 'end' },
              [Bubble.content<AppMessage>({}, ['Then rerun the registry build.'], h)],
              h,
            ),
          ],
          h,
        ),
      ]),
      section('Buttons & Links', [
        Bubble<AppMessage>(
          {},
          [
            Bubble.content<AppMessage>(
              { as: 'a', attributes: [h.Href('#')] },
              ['This bubble is a link.'],
              h,
            ),
          ],
          h,
        ),
        Bubble<AppMessage>(
          { variant: 'secondary' },
          [
            Bubble.content<AppMessage>(
              { as: 'button' },
              ['This one is a button you can click.'],
              h,
            ),
          ],
          h,
        ),
        Bubble<AppMessage>(
          { variant: 'muted' },
          [
            Bubble.content<AppMessage>(
              { as: 'button' },
              ['You can also do tinted buttons. Even ones that are multilines.'],
              h,
            ),
          ],
          h,
        ),
        separatorMarker('Chat Suggestions'),
        Bubble<AppMessage>(
          {},
          [Bubble.content<AppMessage>({}, ['How can I help you today?'], h)],
          h,
        ),
        Bubble.group<AppMessage>(
          {},
          [
            ...quickReplies.map((reply) =>
              Bubble<AppMessage>(
                { variant: 'outline', align: 'end' },
                [
                  Bubble.content<AppMessage>(
                    {
                      as: 'button',
                      className: 'border-dashed border-primary',
                      onClick: Message.PickedReply({ text: reply }),
                    },
                    [reply],
                    h,
                  ),
                ],
                h,
              ),
            ),
          ],
          h,
        ),
        ...model.bubbleReplies.map((reply) =>
          Bubble<AppMessage>(
            { variant: 'secondary', align: 'end' },
            [Bubble.content<AppMessage>({}, [reply], h)],
            h,
          ),
        ),
      ]),
      section('Reaction Placement', [
        separatorMarker('side=bottom align=end'),
        Bubble<AppMessage>(
          {},
          [
            Bubble.content<AppMessage>({}, ['This is a one line message.'], h),
            Bubble.reactions<AppMessage>(
              {
                side: 'bottom',
                align: 'end',
                attributes: [h.Attribute('role', 'img'), h.AriaLabel('Reaction: thumbs up')],
              },
              [h.span([], ['👍'])],
              h,
            ),
          ],
          h,
        ),
        Bubble<AppMessage>(
          { variant: 'secondary', align: 'end' },
          [
            Bubble.content<AppMessage>(
              {},
              [
                'A longer message that wraps across lines so the reaction offset is easier to inspect.',
              ],
              h,
            ),
            Bubble.reactions<AppMessage>(
              {
                side: 'bottom',
                align: 'start',
                attributes: [
                  h.Attribute('role', 'img'),
                  h.AriaLabel('Reactions: thumbs up, surprised'),
                ],
              },
              [h.span([], ['👍']), h.span([], ['😮'])],
              h,
            ),
          ],
          h,
        ),
        separatorMarker('side=top align=start'),
        Bubble<AppMessage>(
          { variant: 'secondary' },
          [
            Bubble.content<AppMessage>(
              {},
              [
                'A longer message that wraps across lines so the reaction offset is easier to inspect.',
              ],
              h,
            ),
            Bubble.reactions<AppMessage>(
              {
                side: 'top',
                align: 'start',
                attributes: [
                  h.Attribute('role', 'img'),
                  h.AriaLabel('Reactions: thumbs up, surprised, fire, eyes'),
                ],
              },
              [h.span([], ['👍']), h.span([], ['😮']), h.span([], ['🔥']), h.span([], ['👀'])],
              h,
            ),
          ],
          h,
        ),
        separatorMarker('side=top align=end'),
        Bubble<AppMessage>(
          { variant: 'muted' },
          [
            Bubble.content<AppMessage>({}, ['This is a one line message.'], h),
            Bubble.reactions<AppMessage>(
              {
                side: 'top',
                align: 'end',
                attributes: [h.Attribute('role', 'img'), h.AriaLabel('Reaction: thumbs up')],
              },
              [h.span([], ['👍'])],
              h,
            ),
          ],
          h,
        ),
      ]),
      section('Reaction Buttons', [
        Bubble<AppMessage>(
          {},
          [
            Bubble.content<AppMessage>({}, ['This is a one line message.'], h),
            Bubble.reactions<AppMessage>(
              {},
              [button<AppMessage>({ variant: 'outline', size: 'xs' }, 'Button', h)],
              h,
            ),
          ],
          h,
        ),
        Bubble<AppMessage>(
          { align: 'end' },
          [
            Bubble.content<AppMessage>({}, ['This is a one line message.'], h),
            Bubble.reactions<AppMessage>(
              { align: 'start' },
              [
                button<AppMessage>(
                  {
                    variant: 'ghost',
                    size: 'icon-xs',
                    attributes: [h.AriaLabel('Confetti')],
                  },
                  icon(h, PartyPopper, 'size-3'),
                  h,
                ),
              ],
              h,
            ),
          ],
          h,
        ),
        Bubble<AppMessage>(
          { variant: 'tinted' },
          [
            Bubble.content<AppMessage>(
              {},
              ['We are going to the movies first then dinner. Are you in?'],
              h,
            ),
            Bubble.reactions<AppMessage>(
              { className: 'gap-1 bg-background' },
              [
                button<AppMessage>(
                  {
                    variant: model.bubbleReacted ? 'secondary' : 'outline',
                    size: 'icon-xs',
                    attributes: [
                      h.AriaLabel('Thumbs up'),
                      h.Attribute('aria-pressed', String(model.bubbleReacted)),
                    ],
                    onClick: Message.ToggledReaction(),
                  },
                  icon(h, ThumbsUp, 'size-3'),
                  h,
                ),
                button<AppMessage>(
                  {
                    variant: 'secondary',
                    size: 'icon-xs',
                    attributes: [h.AriaLabel('Thumbs down')],
                  },
                  icon(h, ThumbsDown, 'size-3'),
                  h,
                ),
              ],
              h,
            ),
          ],
          h,
        ),
      ]),
    ],
  )
}

const fields = {
  bubbleReplies: S.Array(S.String),
  bubbleReacted: S.Boolean,
}

const stateSchema = S.Struct(fields)
type State = typeof stateSchema.Type

export const slice = defineSlice({
  fields,
  init: { bubbleReplies: [], bubbleReacted: false },
  messages: [Message.PickedReply, Message.ToggledReaction],
  handlers: (model: State) => ({
    PickedReply: (payload: typeof Message.PickedReply.Type): UpdateReturn => ({
      model: evo(model, { bubbleReplies: () => [...model.bubbleReplies, payload.text] }),
    }),
    ToggledReaction: (): UpdateReturn => ({
      model: evo(model, { bubbleReacted: () => !model.bubbleReacted }),
    }),
  }),
  samples: [Message.ToggledReaction()],
})
