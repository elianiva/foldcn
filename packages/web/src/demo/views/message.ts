import type { Html, HtmlBuilder } from 'foldkit/html'

import { Avatar } from '../../generated/registry/ui/avatar'
import { Bubble } from '../../generated/registry/ui/bubble'
import { Message, type MessageAlign } from '../../generated/registry/ui/message'

import { defineSlice } from '../slice'
import type { Model, Message as AppMessage } from '../assemble'

const section = (label: string, children: ReadonlyArray<Html>, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full flex-col gap-6')],
    [h.div([h.Class('px-1 text-xs font-medium text-muted-foreground')], [label]), ...children],
  )

const bubble = (text: string, align: MessageAlign, h: HtmlBuilder<AppMessage>): Html =>
  Bubble({ variant: align === 'end' ? 'default' : 'muted' }, [Bubble.content({}, [text], h)], h)

const row = (
  config: Readonly<{
    text: string
    align: MessageAlign
    initials?: string
    header?: string
    footer?: string
  }>,
  h: HtmlBuilder<AppMessage>,
): Html =>
  Message(
    { align: config.align },
    [
      ...(config.initials === undefined
        ? []
        : [Message.avatar({}, [Avatar({}, [Avatar.fallback({}, [config.initials], h)], h)], h)]),
      Message.content(
        {},
        [
          ...(config.header === undefined ? [] : [Message.header({}, [config.header], h)]),
          bubble(config.text, config.align, h),
          ...(config.footer === undefined ? [] : [Message.footer({}, [config.footer], h)]),
        ],
        h,
      ),
    ],
    h,
  )

export const messageView = (_model: Model, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class('flex w-full max-w-sm flex-col gap-10 py-6')],
    [
      section(
        'Basic',
        [
          row({ align: 'end', text: 'Deploying to prod real quick.' }, h),
          row({ align: 'start', text: "It's 4:55 PM. On a Friday." }, h),
          row({ align: 'end', text: "It's a one-line change.", footer: 'Delivered' }, h),
        ],
        h,
      ),
      section(
        'Avatars',
        [
          row({ align: 'start', initials: 'OL', text: 'The build failed during installation.' }, h),
          row(
            {
              align: 'end',
              initials: 'ME',
              text: 'Can you share the exact error?',
              footer: 'Read',
            },
            h,
          ),
        ],
        h,
      ),
      section(
        'Header and footer',
        [
          row({ align: 'start', header: 'Olivia', text: 'I already checked the logs.' }, h),
          row(
            {
              align: 'end',
              header: 'You',
              text: 'Send the report to the team. Ping @shadcn if you need help.',
              footer: 'Read yesterday',
            },
            h,
          ),
        ],
        h,
      ),
      section(
        'Grouped messages',
        [
          Message.group(
            {},
            [
              Message(
                {},
                [
                  Message.avatar({}, [], h),
                  Message.content({}, [bubble('I checked the registry addresses.', 'start', h)], h),
                ],
                h,
              ),
              row(
                {
                  align: 'start',
                  initials: 'OL',
                  text: 'The component and example JSON now live under the UI registry.',
                },
                h,
              ),
            ],
            h,
          ),
          Message.group(
            {},
            [
              row({ align: 'end', text: 'Found them.' }, h),
              row({ align: 'end', text: 'The install command works now.', footer: 'Delivered' }, h),
            ],
            h,
          ),
        ],
        h,
      ),
    ],
  )

export const slice = defineSlice({
  fields: {},
  init: {},
  messages: [],
  handlers: () => ({}),
})
